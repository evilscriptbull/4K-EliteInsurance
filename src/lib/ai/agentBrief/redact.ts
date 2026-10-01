import type { Lead } from "@/lib/schemas/lead";
import type { InsuranceLine } from "@/lib/config/agency";
import { priorityLines } from "@/lib/config/agency";
import type { StoredConversation } from "@/lib/conversations/lifecycle";
import { listMessages } from "@/lib/conversations/messages";

/**
 * What actually reaches the model for Agent Brief generation -- never the
 * raw Lead/StoredConversation. Deltas from the archived spec
 * (tasks/archive/2026-09-03-plan.md §1.4): `transcript` entries are
 * "user" | "associate" (not "assistant" | "user") since this is the live
 * free-text transcript after an associate claims a chat, redacting the
 * associate's own messages too (todo 4.3); `completeness`/`missingFields`
 * are added so the prompt (PR 4) can steer `suggestedQuestions` toward
 * what's actually missing (todo 4.2); `source` is never null since
 * `Lead.source` is always present (only its individual fields are
 * optional).
 */
export interface BriefModelInput {
  firstName: string;
  line: InsuranceLine;
  familySlug: string | null;
  state: string;
  intent: string;
  completeness: Lead["completeness"];
  answers: Record<string, unknown>;
  missingFields: string[];
  transcript: { role: "user" | "associate"; content: string }[] | null;
  source: { utmSource?: string; utmMedium?: string; utmCampaign?: string; landingPage?: string };
  smsConsent: boolean;
  priorityLines: readonly InsuranceLine[];
}

/**
 * Keys dropped outright, never sent to the model regardless of where they
 * appear (conversation.state.collectedFields or a free-text value) --
 * least-privilege data access (guardrails.leastPrivilegeDataAccess). The
 * agent already has these from the Lead itself; the brief doesn't need them.
 */
const DROP_KEYS = new Set([
  "phone",
  "email",
  "lastName",
  "dateOfBirth",
  "licenseNumber",
  "businessPhone",
  "businessAddress",
  "company_website",
  "gclid",
]);

/** 7+ consecutive digits, tolerant of spaces/dashes/parens between them -- phone numbers, license numbers, etc. */
const DIGIT_RUN_PATTERN = /\d(?:[\d\s().-]*\d)?/g;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi;

function redactText(text: string): string {
  return text
    .replace(DIGIT_RUN_PATTERN, (match) => ((match.match(/\d/g) ?? []).length >= 7 ? "[number removed]" : match))
    .replace(EMAIL_PATTERN, "[email removed]");
}

/**
 * The structured facts available to redact, before key-dropping/digit-redaction.
 * A chat lead has `conversation.state.collectedFields`; a static quote-form
 * lead has no conversation at all, so this falls back to the one place a
 * Lead keeps line-specific structured detail: its first insured asset.
 */
function rawAnswers(lead: Lead, conversation: StoredConversation | null): Record<string, unknown> {
  if (conversation) return { ...conversation.state.collectedFields };
  return { ...(lead.insuredAssets[0]?.details ?? {}) };
}

function redactAnswers(raw: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (DROP_KEYS.has(key)) continue;
    redacted[key] = typeof value === "string" ? redactText(value) : value;
  }
  return redacted;
}

export async function redactForModel(lead: Lead, conversation: StoredConversation | null): Promise<BriefModelInput> {
  const answers = redactAnswers(rawAnswers(lead, conversation));

  let transcript: BriefModelInput["transcript"] = null;
  if (conversation?.claimedAt) {
    const claimedAt = conversation.claimedAt;
    const messages = await listMessages(conversation.id);
    transcript = messages
      .filter((message) => message.createdAt >= claimedAt && (message.role === "user" || message.role === "associate"))
      .map((message) => ({ role: message.role as "user" | "associate", content: redactText(message.content) }));
  }

  return {
    firstName: lead.contact.firstName,
    line: lead.line,
    familySlug: conversation?.familySlug ?? null,
    state: lead.contact.state,
    intent: redactText(lead.intent),
    completeness: lead.completeness,
    answers,
    missingFields: lead.missingFields,
    transcript,
    source: {
      utmSource: lead.source.utmSource,
      utmMedium: lead.source.utmMedium,
      utmCampaign: lead.source.utmCampaign,
      landingPage: lead.source.landingPage,
    },
    smsConsent: lead.contact.smsConsent,
    priorityLines,
  };
}
