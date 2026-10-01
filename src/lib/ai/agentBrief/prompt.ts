import { insuranceLines } from "@/lib/config/agency";
import type { BriefModelInput } from "@/lib/ai/agentBrief/redact";

/**
 * Frozen, no interpolation -- keeps the cache prefix stable (gateway.ts
 * marks this block `cache_control: { type: "ephemeral" }`). Bump
 * AGENT_BRIEF_PROMPT_VERSION (schemas/agentBrief.ts) whenever this changes.
 */
export const SYSTEM_PROMPT = `You prepare an internal pre-call brief for a licensed insurance agent at an independent agency. The reader is a licensed professional, not the customer -- the customer never sees this brief.

Source discipline: use only facts the customer actually stated, in the answers and the live transcript (when provided). If you infer something rather than reading it directly, mark that key fact's basis as "inferred". Never add facts that weren't stated. If a field is absent, list it under missingFields rather than guessing at a value.

Hard prohibitions -- never do any of the following:
- No premium or price estimates, in any form.
- No statement that anything is or is not covered.
- No carrier appetite, underwriting, or eligibility claims.
- No legal or licensed coverage determinations.
- No promises to the customer.
- No discriminatory inferences from name, age, or location.

What good looks like: a headline under 15 words; a summary in plain English; suggestedQuestions the agent can ask verbatim on the first call; crossSellCandidates only where the customer's own answers make it plausible, preferring the agency's priority lines (listed in the user message) when there's a tie. When completeness is "partial", make the missingFields entries the first suggestedQuestions -- the agent's first job on that call is closing those gaps.

Vocabulary: primaryLine and crossSellCandidates must come from the allowed lines list in the user message. classOfBusinessHint is a plain-language description, never a class code or NAICS number.

Output: follow the provided schema exactly. No markdown formatting in any field.`;

function formatAnswers(answers: Record<string, unknown>): string {
  const keys = Object.keys(answers).sort();
  if (keys.length === 0) return "(none)";
  return keys.map((key) => `${key}: ${String(answers[key])}`).join("\n");
}

function formatList(items: readonly string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "(none)";
}

function formatSource(source: BriefModelInput["source"]): string {
  const lines = [
    source.utmSource ? `utmSource: ${source.utmSource}` : null,
    source.utmMedium ? `utmMedium: ${source.utmMedium}` : null,
    source.utmCampaign ? `utmCampaign: ${source.utmCampaign}` : null,
    source.landingPage ? `landingPage: ${source.landingPage}` : null,
  ].filter((line): line is string => line !== null);
  return lines.length > 0 ? lines.join("\n") : "(none)";
}

/**
 * A compact, deterministic serialization of `BriefModelInput` -- identical
 * input always produces an identical string (answers/missing-fields are
 * sorted, no timestamps), so prompt-cache hits are reliable and a diff in
 * the prompt is always a real input change, not key-order noise.
 */
export function buildUserMessage(input: BriefModelInput): string {
  const sections = [
    `Customer:\nFirst name: ${input.firstName}\nState: ${input.state}\nSMS consent: ${input.smsConsent}`,
    `Line and family:\nPrimary line: ${input.line}\nFamily: ${input.familySlug ?? "none (static quote form)"}\nCompleteness: ${input.completeness}`,
    `Intent:\n${input.intent}`,
    `Missing fields:\n${formatList(input.missingFields)}`,
    `Answers:\n${formatAnswers(input.answers)}`,
  ];

  if (input.transcript) {
    sections.push(`Live transcript:\n${input.transcript.map((message) => `${message.role}: ${message.content}`).join("\n")}`);
  }

  sections.push(`Marketing source:\n${formatSource(input.source)}`);
  sections.push(`Allowed lines:\n${insuranceLines.join(", ")}`);
  sections.push(`Agency priority lines:\n${input.priorityLines.join(", ")}`);

  return sections.join("\n\n");
}
