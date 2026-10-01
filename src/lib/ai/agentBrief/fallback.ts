import type { Lead } from "@/lib/schemas/lead";
import type { AgentBriefContent } from "@/lib/schemas/agentBrief";
import type { StoredConversation } from "@/lib/conversations/lifecycle";
import type { InsuranceLine } from "@/lib/config/agency";
import { priorityLines } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { formatLine } from "@/lib/format/insuranceLine";

const RECOMMENDED_ACTION_BY_TIER: Record<Lead["leadScoreTier"], AgentBriefContent["recommendedNextAction"]> = {
  immediate: "call-now",
  "same-day": "call-today",
  nurture: "email-first",
  marketing: "schedule-review",
};

const SUGGESTED_QUESTIONS_BY_FAMILY: Record<string, string[]> = {
  "collector-vehicle": [
    "Where is the vehicle stored, and is it driven regularly or only to shows?",
    "Do you have an appraisal or documented agreed value?",
    "Any modifications from factory spec?",
  ],
  auto: [
    "Who else in the household drives this vehicle?",
    "Any accidents or claims in the last 3 years?",
    "When does your current policy renew?",
  ],
  home: [
    "Is this a primary residence, rental, or secondary home?",
    "Any recent updates to the roof, electrical, or plumbing?",
    "When does your current policy renew?",
  ],
  recreational: [
    "How often and where is it used?",
    "Is it stored at home or at a marina/storage facility?",
    "Any prior claims on this or a previous unit?",
  ],
  life: [
    "What's driving the interest in coverage right now?",
    "Do you have any existing life insurance in place?",
    "Any major health conditions to be aware of before quoting?",
  ],
  business: [
    "How many years has the business been operating?",
    "How many employees, and what's the approximate payroll?",
    "Do you currently hold a policy, and when does it renew?",
    "Do you use subcontractors or need certificates of insurance?",
  ],
};

const DEFAULT_SUGGESTED_QUESTIONS = [
  "What's the best way and time to reach you?",
  "When does your current policy (if any) renew?",
  "Is there anything time-sensitive driving this request?",
];

/**
 * Matches a quoteFormFamilies slug (src/lib/config/quote-forms.ts). Used to
 * pick a suggestedQuestions template for the static quote-form path, which
 * has no conversation/familySlug of its own -- only `lead.line`. Not
 * perfectly 1:1 (e.g. "commercial-auto" can come from either the auto or
 * business family) but good enough for picking a reasonable question set.
 */
function familySlugForLine(line: InsuranceLine): string {
  switch (line) {
    case "collector-vehicle":
      return "collector-vehicle";
    case "auto":
      return "auto";
    case "home":
    case "rental-property":
      return "home";
    case "boat":
    case "motorcycle":
    case "rv":
      return "recreational";
    case "life":
      return "life";
    default:
      return "business";
  }
}

function buildHeadline(lead: Lead): string {
  const name = `${lead.contact.firstName} ${lead.contact.lastName}`.trim();
  const base = `${formatLine(lead.line)} — ${name || "unnamed prospect"}`;
  const assetDescription = lead.insuredAssets[0]?.description;
  return assetDescription ? `${base} (${assetDescription})` : base;
}

function buildCrossSellCandidates(lead: Lead): InsuranceLine[] {
  const sourcePage = landingPages.find((page) => page.insuranceLine === lead.line);
  if (!sourcePage) return [];
  const candidates = sourcePage.relatedSlugs
    .map((slug) => landingPages.find((page) => page.slug === slug)?.insuranceLine)
    .filter((line): line is InsuranceLine => Boolean(line) && line !== lead.line);
  return Array.from(new Set(candidates)).slice(0, 4);
}

function buildUrgencyReasons(lead: Lead): string[] {
  const reasons: string[] = [];
  if (lead.contact.phone) reasons.push("Provided a phone number — reachable directly.");
  if (lead.contact.smsConsent) reasons.push("Consented to SMS — fast follow-up channel available.");
  if (priorityLines.includes(lead.line)) reasons.push(`${formatLine(lead.line)} is one of the agency's priority lines.`);
  if (lead.renewalUrgency.hasActivePolicy === false) reasons.push("Reports no active policy in place — likely uninsured now.");
  return reasons;
}

function buildKeyFacts(lead: Lead): AgentBriefContent["keyFacts"] {
  const asset = lead.insuredAssets[0];
  if (!asset) return [];
  const facts: AgentBriefContent["keyFacts"] = [];
  if (asset.description) facts.push({ label: "Asset", value: asset.description, basis: "customer-stated" });
  if (asset.value !== undefined) {
    facts.push({ label: "Value", value: asset.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), basis: "customer-stated" });
  }
  for (const [key, value] of Object.entries(asset.details ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    facts.push({ label: key, value: String(value), basis: "customer-stated" });
  }
  return facts.slice(0, 12);
}

function buildRiskFlags(lead: Lead, conversation: StoredConversation | null): string[] {
  const flags: string[] = [];
  if (
    conversation?.familySlug === "auto" &&
    conversation.state.collectedFields.personalOrCommercial === "commercial"
  ) {
    flags.push("Commercial vehicle submitted through the auto flow — confirm business use and entity.");
  }
  if (lead.contact.state !== "TN") flags.push(`Prospect is in ${lead.contact.state}, not TN — confirm the agency is licensed there.`);
  return flags;
}

function buildClassOfBusinessHint(lead: Lead): string | null {
  if (lead.line !== "business") return null;
  const operationsDescription = lead.insuredAssets[0]?.details?.operationsDescription;
  return typeof operationsDescription === "string" ? operationsDescription : null;
}

/**
 * No model call -- always available, always valid against
 * agentBriefContentSchema. Used both as the Agent Brief's last-resort
 * origin ("fallback") and, unpersisted, as the claim-time instant snapshot
 * (PR 6).
 */
export function buildFallbackBrief(lead: Lead, conversation: StoredConversation | null): AgentBriefContent {
  return {
    headline: buildHeadline(lead),
    summary: `${lead.intent} ${lead.conversationSummary}`.trim(),
    primaryLine: lead.line,
    crossSellCandidates: buildCrossSellCandidates(lead),
    urgency: { tier: lead.leadScoreTier, reasons: buildUrgencyReasons(lead) },
    keyFacts: buildKeyFacts(lead),
    missingFields: lead.missingFields,
    suggestedQuestions: (
      SUGGESTED_QUESTIONS_BY_FAMILY[conversation?.familySlug ?? familySlugForLine(lead.line)] ?? DEFAULT_SUGGESTED_QUESTIONS
    ).slice(0, 6),
    riskFlags: buildRiskFlags(lead, conversation),
    classOfBusinessHint: buildClassOfBusinessHint(lead),
    recommendedNextAction: RECOMMENDED_ACTION_BY_TIER[lead.leadScoreTier],
  };
}
