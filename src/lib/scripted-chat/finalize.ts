import { quoteFormSchema, type QuoteFormInput } from "@/lib/schemas/forms";
import { quoteFormToLead, type LeadSource } from "@/lib/leads/mappers";
import type { Lead } from "@/lib/schemas/lead";

/**
 * Converts a completed scripted conversation's collected answers into the
 * same validated Lead shape a static quote-form submission produces.
 * `family` and `state` aren't asked in the conversation — `family` is
 * implied by which flow ran, and `state` is fixed to TN for the pilot's
 * TN-only scope (see docs/backlog.md) rather than asked, since no other
 * state's disclaimer text is confirmed yet.
 */
export function scriptedAnswersToLead(familySlug: string, answers: Record<string, unknown>, source: LeadSource = {}): Lead {
  const input: Record<string, unknown> = {
    ...answers,
    family: familySlug,
    state: "TN",
  };
  const parsed: QuoteFormInput = quoteFormSchema.parse(input);
  const conversationSummary = `Completed the Quick Quote Chat (${familySlug}) — answered every question without an agent joining live.`;
  return quoteFormToLead(parsed, source, conversationSummary);
}
