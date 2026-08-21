import type { QuoteFormInput } from "@/lib/schemas/forms";
import { leadSchema, scoreToTier, type Lead } from "@/lib/schemas/lead";
import type { InsuranceLine } from "@/lib/config/agency";
import { estimateLeadScore } from "@/lib/leads/scoring";

export interface LeadSource {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  gclid?: string;
}

function formatDollars(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function resolveLine(input: QuoteFormInput): InsuranceLine {
  switch (input.family) {
    case "collector-vehicle":
      return "collector-vehicle";
    case "auto":
      return input.personalOrCommercial === "commercial" ? "commercial-auto" : "auto";
    case "home":
      return "home";
    case "recreational":
      return input.vehicleType;
    case "life":
      return "life";
    case "business":
      return input.coverageType;
  }
}

function buildIntent(input: QuoteFormInput): string {
  switch (input.family) {
    case "collector-vehicle":
      return `Requested a quote for a ${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}, estimated value ${formatDollars(input.estimatedValue)}.`;
    case "auto":
      return `Requested a ${input.personalOrCommercial} auto quote for a ${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}.`;
    case "home":
      return `Requested a homeowners/rental dwelling quote, dwelling coverage ${formatDollars(input.dwellingCoverageAmount)}.`;
    case "recreational":
      return `Requested a ${input.vehicleType} quote for a ${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}.`;
    case "life":
      return `Requested a ${input.product} life insurance quote for ${formatDollars(input.amountRequested)}.`;
    case "business":
      return `Requested a ${input.coverageType} quote for ${input.businessName} (${input.businessEntity}).`;
  }
}

function buildInsuredAssets(input: QuoteFormInput): Lead["insuredAssets"] {
  switch (input.family) {
    case "collector-vehicle":
      return [
        {
          kind: "vehicle",
          description: `${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}`,
          value: input.estimatedValue,
          details: { mileagePlan: input.mileagePlan, liabilityLimits: input.liabilityLimits },
        },
      ];
    case "auto":
      return [
        {
          kind: "vehicle",
          description: `${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}`,
          details: { liabilityLimits: input.liabilityLimits, coverageType: input.coverageType },
        },
      ];
    case "home":
      return [
        {
          kind: "home",
          value: input.dwellingCoverageAmount,
          details: { liabilityLimit: input.liabilityLimit, deductible: input.deductible },
        },
      ];
    case "recreational":
      return [
        {
          kind: input.vehicleType,
          description: `${input.vehicleYear} ${input.vehicleMake} ${input.vehicleModel}`,
          details: { coverageType: input.coverageType, liabilityLimits: input.liabilityLimits },
        },
      ];
    case "life":
      return [
        {
          kind: "life-policy",
          value: input.amountRequested,
          details: { product: input.product, tobaccoUser: input.tobaccoUser },
        },
      ];
    case "business":
      return [
        {
          kind: "business",
          description: input.businessName,
          details: {
            businessEntity: input.businessEntity,
            operationsDescription: input.operationsDescription,
            liabilityCoverageRequested: input.liabilityCoverageRequested,
          },
        },
      ];
  }
}

/**
 * Maps a quote-form submission (the only form family that represents new
 * business intent) into the canonical Lead shape, finishing with
 * leadSchema.parse as the hard validation gate. Contact and Claim
 * submissions are NOT mapped here — they're stored via their own simple
 * schemas (see lib/schemas/forms.ts, lib/claims/store.ts).
 */
export function quoteFormToLead(input: QuoteFormInput, source: LeadSource = {}): Lead {
  const line = resolveLine(input);

  const draft: Omit<Lead, "leadScore" | "leadScoreTier"> = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    line,
    intent: buildIntent(input),
    contact: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      preferredContactMethod: input.smsConsent ? "sms" : "phone",
      state: input.state,
      smsConsent: input.smsConsent,
    },
    insuredAssets: buildInsuredAssets(input),
    renewalUrgency: {},
    crossSellPotential: [],
    conversationSummary: `Submitted via static ${input.family} quote form (no AI conversation).`,
    missingFields: [],
    source,
  };

  const leadScore = estimateLeadScore(draft);

  return leadSchema.parse({
    ...draft,
    leadScore,
    leadScoreTier: scoreToTier(leadScore),
  });
}
