import { z } from "zod";
import { insuranceLines } from "@/lib/config/agency";
import { leadScoreTierSchema } from "@/lib/schemas/lead";

/**
 * Internal pre-call brief for agency staff, generated after a Lead is
 * stored (see src/lib/ai/agentBrief/generate.ts) -- never shown to the
 * customer. Bump this whenever the prompt or schema changes, so prompt
 * changes are deliberate and visible in diffs (see prompt.ts's snapshot test).
 */
export const AGENT_BRIEF_PROMPT_VERSION = "2026-10-01.1";

export const agentBriefContentSchema = z.object({
  headline: z.string().max(120), // one line an agent reads in 3 seconds
  summary: z.string().max(600), // 2-4 plain sentences of what the customer wants
  primaryLine: z.enum(insuranceLines),
  crossSellCandidates: z.array(z.enum(insuranceLines)).max(4),
  urgency: z.object({
    tier: leadScoreTierSchema, // immediate | same-day | nurture | marketing
    reasons: z.array(z.string().max(160)).max(4),
  }),
  keyFacts: z
    .array(
      z.object({
        label: z.string().max(60),
        value: z.string().max(160),
        basis: z.enum(["customer-stated", "inferred"]),
      }),
    )
    .max(12),
  missingFields: z.array(z.string().max(80)).max(10), // what the agent still needs before quoting
  suggestedQuestions: z.array(z.string().max(200)).max(6), // to ask on the first call
  riskFlags: z.array(z.string().max(200)).max(6), // anything that changes how the agent should approach it
  classOfBusinessHint: z.string().max(200).nullable(), // free-text hint for commercial leads; never a code
  recommendedNextAction: z.enum(["call-now", "call-today", "email-first", "schedule-review"]),
});

export const agentBriefSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  conversationId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  origin: z.enum(["model", "fallback"]),
  model: z.string().nullable(),
  promptVersion: z.string(),
  usage: z.object({ inputTokens: z.number(), outputTokens: z.number() }).nullable(),
  content: agentBriefContentSchema,
});

export type AgentBriefContent = z.infer<typeof agentBriefContentSchema>;
export type AgentBrief = z.infer<typeof agentBriefSchema>;
