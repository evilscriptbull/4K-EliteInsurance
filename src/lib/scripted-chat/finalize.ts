import { quoteFormSchema, type QuoteFormInput } from "@/lib/schemas/forms";
import { quoteFormToLead, type LeadSource } from "@/lib/leads/mappers";
import { leadSchema, scoreToTier, type Lead } from "@/lib/schemas/lead";
import { estimateLeadScore } from "@/lib/leads/scoring";
import type { InsuranceLine } from "@/lib/config/agency";
import type { ScriptedFlow } from "@/lib/scripted-chat/types";

/**
 * Converts a completed scripted conversation's collected answers into the
 * same validated Lead shape a static quote-form submission produces.
 * `family` and `state` aren't asked in the conversation — `family` is
 * implied by which flow ran, and `state` is fixed to TN for the pilot's
 * TN-only scope (see docs/backlog.md) rather than asked, since no other
 * state's disclaimer text is confirmed yet.
 */
export function scriptedAnswersToLead(
  familySlug: string,
  answers: Record<string, unknown>,
  source: LeadSource = {},
  channel: Lead["channel"] = "chat",
): Lead {
  const input: Record<string, unknown> = {
    ...answers,
    family: familySlug,
    state: "TN",
  };
  const parsed: QuoteFormInput = quoteFormSchema.parse(input);
  const conversationSummary = `Completed the Quick Quote Chat (${familySlug}) — answered every question without an agent joining live.`;
  return quoteFormToLead(parsed, source, conversationSummary, channel);
}

/** Mirrors resolveLine (lib/leads/mappers.ts) but tolerant of an unanswered branching field. */
function resolvePartialLine(familySlug: string, answers: Record<string, unknown>): InsuranceLine {
  switch (familySlug) {
    case "collector-vehicle":
      return "collector-vehicle";
    case "auto":
      return answers.personalOrCommercial === "commercial" ? "commercial-auto" : "auto";
    case "home":
      return "home";
    case "recreational": {
      const vehicleType = answers.vehicleType;
      return vehicleType === "boat" || vehicleType === "motorcycle" || vehicleType === "rv" ? vehicleType : "other";
    }
    case "life":
      return "life";
    case "business":
      return typeof answers.coverageType === "string" ? (answers.coverageType as InsuranceLine) : "business";
    default:
      return "other";
  }
}

/**
 * How far into the flow a conversation got, by position of `currentStepId`
 * (the step being asked, i.e. not yet answered) rather than by inspecting
 * `answers` directly -- a `spreadFields` step (e.g. "full name" -> firstName
 * + lastName) stores keys other than its own `field`, so presence-checking
 * `answers` can't tell whether that step was actually answered. Assumes a
 * linear flow, true of every flow today (`next()` only ever returns the
 * next id or null). `currentStepId` is `null` once a flow completes and
 * always set from the first step onward otherwise (see start/route.ts), so
 * a missing/unrecognized id is treated as "every step answered."
 */
export function scriptedStepProgress(
  flow: ScriptedFlow,
  currentStepId: string | null | undefined,
): { answeredCount: number; totalCount: number } {
  const totalCount = flow.steps.length;
  if (!currentStepId) return { answeredCount: totalCount, totalCount };
  const idx = flow.steps.findIndex((step) => step.id === currentStepId);
  return { answeredCount: idx === -1 ? totalCount : idx, totalCount };
}

function vehicleDescription(answers: Record<string, unknown>): string | null {
  const parts = [answers.vehicleYear, answers.vehicleMake, answers.vehicleModel].filter(
    (part): part is string => typeof part === "string" && part.length > 0,
  );
  return parts.length > 0 ? parts.join(" ") : null;
}

/** Mirrors buildIntent (lib/leads/mappers.ts) but tolerant of missing fields — for a conversation that never reached "complete". */
function buildPartialIntent(familySlug: string, answers: Record<string, unknown>): string {
  const vehicle = vehicleDescription(answers);
  switch (familySlug) {
    case "collector-vehicle":
      return vehicle
        ? `Started a collector vehicle quote for a ${vehicle}, but didn't finish the conversation.`
        : "Started a collector vehicle quote, but didn't get far enough to describe the vehicle.";
    case "auto":
      return vehicle
        ? `Started an auto quote for a ${vehicle}, but didn't finish the conversation.`
        : "Started an auto quote, but didn't get far enough to describe the vehicle.";
    case "home":
      return "Started a homeowners/rental dwelling quote, but didn't finish the conversation.";
    case "recreational":
      return vehicle
        ? `Started a ${typeof answers.vehicleType === "string" ? answers.vehicleType : "recreational vehicle"} quote for a ${vehicle}, but didn't finish the conversation.`
        : "Started a recreational vehicle quote, but didn't get far enough to describe the vehicle.";
    case "life":
      return "Started a life insurance quote, but didn't finish the conversation.";
    case "business":
      return typeof answers.businessName === "string"
        ? `Started a business insurance quote for ${answers.businessName}, but didn't finish the conversation.`
        : "Started a business insurance quote, but didn't finish the conversation.";
    default:
      return "Started a Quick Quote Chat, but didn't finish the conversation.";
  }
}

/**
 * Builds a best-effort Lead from a conversation that never reached
 * "complete" (released, abandoned, or claimed and finished live). Tolerant
 * of missing required-by-form fields — `completeness: "partial"` and
 * `missingFields` tell the agent what's still outstanding. Returns `null`
 * when there's nothing actionable at all (no name and no way to reach them).
 */
export function conversationToPartialLead(
  flow: ScriptedFlow,
  familySlug: string,
  answers: Record<string, unknown>,
  currentStepId: string | null | undefined,
  source: LeadSource = {},
): Lead | null {
  const firstName = typeof answers.firstName === "string" ? answers.firstName : "";
  const lastName = typeof answers.lastName === "string" ? answers.lastName : "";
  const phone = typeof answers.phone === "string" ? answers.phone : undefined;
  const email = typeof answers.email === "string" ? answers.email : undefined;

  const hasName = Boolean(firstName || lastName);
  if (!hasName && !phone && !email) return null;

  const { answeredCount } = scriptedStepProgress(flow, currentStepId);
  const missingFields = flow.steps
    .slice(answeredCount)
    .filter((step) => !step.optional)
    .map((step) => step.field);

  const draft: Omit<Lead, "leadScore" | "leadScoreTier"> = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    channel: "chat",
    completeness: "partial",
    line: resolvePartialLine(familySlug, answers),
    intent: buildPartialIntent(familySlug, answers),
    contact: {
      firstName,
      lastName,
      phone,
      email,
      preferredContactMethod: answers.smsConsent === true ? "sms" : "phone",
      state: "TN",
      smsConsent: answers.smsConsent === true,
    },
    insuredAssets: [],
    renewalUrgency: {},
    crossSellPotential: [],
    conversationSummary: `Started the Quick Quote Chat (${familySlug}) but didn't finish — an agent will need to fill in the gaps directly.`,
    missingFields,
    source,
  };

  const leadScore = estimateLeadScore(draft);

  return leadSchema.parse({
    ...draft,
    leadScore,
    leadScoreTier: scoreToTier(leadScore),
  });
}
