import { generateStructured } from "@/lib/ai/gateway";
import { agentBriefContentSchema, AGENT_BRIEF_PROMPT_VERSION } from "@/lib/schemas/agentBrief";
import type { AgentBrief, AgentBriefContent } from "@/lib/schemas/agentBrief";
import { redactForModel } from "@/lib/ai/agentBrief/redact";
import { buildFallbackBrief } from "@/lib/ai/agentBrief/fallback";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/ai/agentBrief/prompt";
import { saveAgentBrief } from "@/lib/ai/agentBrief/store";
import { forEachStringLeaf } from "@/lib/ai/agentBrief/stringLeaf";
import { violatesGuardrails } from "@/lib/compliance/guardrails";
import type { Lead } from "@/lib/schemas/lead";
import type { StoredConversation } from "@/lib/conversations/lifecycle";

// Belt-and-braces checks beyond violatesGuardrails -- catches a price
// estimate or a PII leak back out even if the model never used a banned
// phrase. 7+ consecutive digits only (not spaced/dashed like redact.ts's
// input-side rule), matching the archived spec's post-validation wording.
//
// Delta from the archived spec, found live during PR 7's eval run (see
// tasks/todo.md): the spec also called for rejecting any `$`+digits as a
// belt-and-braces anti-price-estimate check. That rejected *every*
// collector-vehicle/home/life brief in practice, because those leads'
// Lead.intent legitimately states a real customer value ("estimated value
// $62,000", "dwelling coverage $420,000") -- a fact the model correctly
// restated, not a fabricated premium. The premium/rate pattern below
// already catches an actual fabricated price estimate; the bare `$`+digit
// check only ever caught legitimate restated facts, so it's removed.
const PREMIUM_OR_RATE_WITH_NUMBER_PATTERN = /\b(premium|rate)\b[^\n]{0,20}\d/i;
const DIGIT_LEAK_PATTERN = /\d{7,}/;

export type BriefValidation = { ok: true; content: AgentBriefContent } | { ok: false; reason: string };

/**
 * Forces primaryLine back to the lead's real line (the model's own guess is
 * informational at best -- the Lead already pinned it), sweeps every string
 * leaf for guardrail violations and price/PII leaks, and never mutates its
 * input. Pure and unit-tested on its own so generateAgentBrief's test only
 * needs to mock generateStructured, not re-cover these rules.
 */
export function validateBriefContent(content: AgentBriefContent, lead: Lead): BriefValidation {
  const dedupedCrossSell = Array.from(new Set(content.crossSellCandidates)).filter((line) => line !== lead.line);

  const adjusted: AgentBriefContent =
    content.primaryLine === lead.line
      ? { ...content, crossSellCandidates: dedupedCrossSell }
      : {
          ...content,
          primaryLine: lead.line,
          crossSellCandidates: dedupedCrossSell,
          riskFlags: [...content.riskFlags, `Model suggested a different line: ${content.primaryLine}`],
        };

  let violation: string | null = null;
  forEachStringLeaf(adjusted, (text) => {
    if (violation) return;
    if (violatesGuardrails(text)) violation = `banned phrase in "${text}"`;
    else if (PREMIUM_OR_RATE_WITH_NUMBER_PATTERN.test(text)) violation = `premium/rate estimate in "${text}"`;
    else if (DIGIT_LEAK_PATTERN.test(text)) violation = `possible PII leak (7+ digits) in "${text}"`;
  });

  if (violation) return { ok: false, reason: violation };
  return { ok: true, content: adjusted };
}

/**
 * Never throws. Always returns a usable AgentBrief: the deterministic
 * fallback is built first and used unless the model call succeeds AND
 * passes validateBriefContent. Always calls saveAgentBrief -- a failure to
 * persist still returns the brief so the caller (notifyAgentBrief, PR 5)
 * has something to deliver.
 */
export async function generateAgentBrief(lead: Lead, conversation: StoredConversation | null): Promise<AgentBrief> {
  let content: AgentBriefContent = buildFallbackBrief(lead, conversation);
  let origin: AgentBrief["origin"] = "fallback";
  let model: string | null = null;
  let usage: AgentBrief["usage"] = null;

  try {
    const input = await redactForModel(lead, conversation);
    const result = await generateStructured({
      schema: agentBriefContentSchema,
      system: SYSTEM_PROMPT,
      user: buildUserMessage(input),
      effort: "medium",
    });

    if (result.status === "ok" && result.data) {
      const validated = validateBriefContent(result.data, lead);
      if (validated.ok) {
        content = validated.content;
        origin = "model";
        model = result.model ?? null;
        usage = result.usage ? { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens } : null;
      } else {
        console.log(`[ai] brief rejected, using fallback -- ${validated.reason}`);
      }
    } else if (result.status !== "not-configured") {
      console.log(`[ai] brief not used, using fallback -- status=${result.status}`);
    }
  } catch (error) {
    console.error("[ai] brief generation threw, using fallback", error);
  }

  const brief: AgentBrief = {
    id: crypto.randomUUID(),
    leadId: lead.id,
    conversationId: conversation?.id ?? null,
    createdAt: new Date().toISOString(),
    origin,
    model,
    promptVersion: AGENT_BRIEF_PROMPT_VERSION,
    usage,
    content,
  };

  try {
    await saveAgentBrief(brief);
  } catch (error) {
    console.error("[ai] saveAgentBrief failed", error);
  }

  return brief;
}
