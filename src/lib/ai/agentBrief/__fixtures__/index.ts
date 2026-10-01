import type { Lead } from "@/lib/schemas/lead";
import type { StoredConversation } from "@/lib/conversations/lifecycle";

/**
 * 6 realistic, entirely fictional leads -- one per quoteFormFamilies family
 * -- used by scripts/eval-agent-brief.mjs to spot-check real model output
 * (not unit-tested behavior, which redact.test.ts/fallback.test.ts already
 * cover with mocks). All 6 use `conversation: null` (the static quote-form
 * path): a live-transcript conversation's messages come from
 * conversations/messages.ts's real store, which this standalone script has
 * no seeded rows for, so a synthetic StoredConversation here would just
 * produce an empty transcript rather than exercising anything new --
 * redact.test.ts's claimedAt-boundary tests already cover that path with a
 * real in-memory store. The "auto" fixture's `intent` carries a phone
 * number in free text instead, to prove redaction survives end-to-end into
 * a real model call regardless of the conversation path.
 */
export interface EvalFixture {
  name: string;
  lead: Lead;
  conversation: StoredConversation | null;
}

export const EVAL_FIXTURES: EvalFixture[] = [
  {
    name: "collector-vehicle",
    conversation: null,
    lead: {
      id: "11111111-1111-4111-8111-111111111111",
      createdAt: "2026-10-01T15:00:00.000Z",
      channel: "form",
      completeness: "full",
      line: "collector-vehicle",
      intent: "Requested a quote for a 1967 Chevrolet Camaro SS, estimated value $62,000.",
      contact: {
        firstName: "Marcus",
        lastName: "Webb",
        phone: "8655551001",
        email: "marcus.webb@example.com",
        preferredContactMethod: "phone",
        state: "TN",
        smsConsent: true,
      },
      insuredAssets: [
        {
          kind: "vehicle",
          description: "1967 Chevrolet Camaro SS",
          value: 62000,
          details: { mileagePlan: "3000", liabilityLimits: "300000" },
        },
      ],
      renewalUrgency: { hasActivePolicy: true, currentCarrier: "Hagerty" },
      crossSellPotential: [],
      conversationSummary: "Submitted via static collector-vehicle quote form (no AI conversation).",
      missingFields: [],
      leadScore: 65,
      leadScoreTier: "same-day",
      source: { utmSource: "google", utmMedium: "cpc", landingPage: "/collector-car-insurance" },
    },
  },
  {
    name: "auto",
    conversation: null,
    lead: {
      id: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-10-01T15:05:00.000Z",
      channel: "chat",
      completeness: "full",
      line: "auto",
      // Phone number embedded in free text (not the structured contact.phone
      // field) -- proves redaction strips it from every string, not just
      // the known PII keys, before anything reaches the model.
      intent:
        "Requested a personal auto quote for a 2023 Toyota RAV4. Customer noted she's easiest to reach on her cell at 865-555-1002 after 5pm.",
      contact: {
        firstName: "Priya",
        lastName: "Natarajan",
        phone: "8655551002",
        email: "priya.n@example.com",
        preferredContactMethod: "sms",
        state: "TN",
        smsConsent: true,
      },
      insuredAssets: [
        {
          kind: "vehicle",
          description: "2023 Toyota RAV4",
          details: { liabilityLimits: "250-500-100", coverageType: "full" },
        },
      ],
      renewalUrgency: { hasActivePolicy: false },
      crossSellPotential: [],
      conversationSummary: "Completed the Quick Quote Chat (auto) — answered every question without an agent joining live.",
      missingFields: [],
      leadScore: 70,
      leadScoreTier: "same-day",
      source: { utmSource: "facebook", utmMedium: "paid-social" },
    },
  },
  {
    name: "home",
    conversation: null,
    lead: {
      id: "33333333-3333-4333-8333-333333333333",
      createdAt: "2026-10-01T15:10:00.000Z",
      channel: "form",
      completeness: "full",
      line: "home",
      intent: "Requested a homeowners/rental dwelling quote, dwelling coverage $420,000.",
      contact: {
        firstName: "Owen",
        lastName: "Bradshaw",
        phone: "8655551003",
        email: "owen.bradshaw@example.com",
        preferredContactMethod: "phone",
        state: "TN",
        smsConsent: false,
      },
      insuredAssets: [
        {
          kind: "home",
          value: 420000,
          details: { liabilityLimit: "300000", deductible: "2500" },
        },
      ],
      renewalUrgency: { hasActivePolicy: true, currentCarrier: "State Farm", renewalDate: "2026-11-15" },
      crossSellPotential: [],
      conversationSummary: "Submitted via static home quote form (no AI conversation).",
      missingFields: [],
      leadScore: 75,
      leadScoreTier: "same-day",
      source: { landingPage: "/personal-auto-home-insurance" },
    },
  },
  {
    name: "recreational",
    conversation: null,
    lead: {
      id: "44444444-4444-4444-8444-444444444444",
      createdAt: "2026-10-01T15:15:00.000Z",
      channel: "form",
      completeness: "full",
      line: "boat",
      intent: "Requested a boat quote for a 2018 Bayliner 175, full coverage.",
      contact: {
        firstName: "Renee",
        lastName: "Castillo",
        phone: "8655551004",
        email: "renee.castillo@example.com",
        preferredContactMethod: "email",
        state: "TN",
        smsConsent: true,
      },
      insuredAssets: [
        {
          kind: "boat",
          description: "2018 Bayliner 175",
          details: { coverageType: "full", liabilityLimits: "100-300" },
        },
      ],
      renewalUrgency: {},
      crossSellPotential: [],
      conversationSummary: "Submitted via static recreational quote form (no AI conversation).",
      missingFields: [],
      leadScore: 55,
      leadScoreTier: "nurture",
      source: {},
    },
  },
  {
    name: "life",
    conversation: null,
    lead: {
      id: "55555555-5555-4555-8555-555555555555",
      createdAt: "2026-10-01T15:20:00.000Z",
      channel: "form",
      completeness: "full",
      line: "life",
      intent: "Requested a term life insurance quote for $500,000.",
      contact: {
        firstName: "David",
        lastName: "Okafor",
        phone: "8655551005",
        email: "david.okafor@example.com",
        preferredContactMethod: "phone",
        state: "TN",
        smsConsent: false,
      },
      insuredAssets: [
        {
          kind: "life-policy",
          value: 500000,
          details: { product: "term", tobaccoUser: false },
        },
      ],
      renewalUrgency: {},
      crossSellPotential: [],
      conversationSummary: "Submitted via static life quote form (no AI conversation).",
      missingFields: [],
      leadScore: 60,
      leadScoreTier: "same-day",
      source: { utmSource: "google", utmMedium: "cpc" },
    },
  },
  {
    name: "business",
    conversation: null,
    lead: {
      id: "66666666-6666-4666-8666-666666666666",
      createdAt: "2026-10-01T15:25:00.000Z",
      channel: "form",
      completeness: "partial",
      line: "general-liability",
      intent: "Requested a general-liability quote for Ridgeline Electrical (llc).",
      contact: {
        firstName: "Felicia",
        lastName: "Tran",
        phone: "8655551006",
        preferredContactMethod: "phone",
        state: "TN",
        smsConsent: true,
      },
      insuredAssets: [
        {
          kind: "business",
          description: "Ridgeline Electrical",
          details: {
            businessEntity: "llc",
            operationsDescription: "Residential and commercial electrical contracting.",
            liabilityCoverageRequested: "1000000",
          },
        },
      ],
      renewalUrgency: { hasActivePolicy: false },
      crossSellPotential: [],
      conversationSummary: "Submitted via static business quote form (no AI conversation).",
      missingFields: ["email", "yearsInBusiness", "employees"],
      leadScore: 68,
      leadScoreTier: "same-day",
      source: {},
    },
  },
];
