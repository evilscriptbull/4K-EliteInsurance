import { describe, it, expect } from "vitest";
import { buildFallbackBrief } from "@/lib/ai/agentBrief/fallback";
import { forEachStringLeaf } from "@/lib/ai/agentBrief/stringLeaf";
import { agentBriefContentSchema } from "@/lib/schemas/agentBrief";
import { violatesGuardrails } from "@/lib/compliance/guardrails";
import { quoteFormToLead } from "@/lib/leads/mappers";
import type { QuoteFormInput } from "@/lib/schemas/forms";
import type { Lead } from "@/lib/schemas/lead";
import type { InsuranceLine } from "@/lib/config/agency";

const baseContact = {
  firstName: "Jane",
  lastName: "Doe",
  phone: "8651234567",
  email: "jane@example.com",
  state: "TN" as const,
  smsConsent: false,
};

function partialLead(line: InsuranceLine, overrides: Partial<Lead> = {}): Lead {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    channel: "chat",
    completeness: "partial",
    line,
    intent: "Started a quote, but didn't finish the conversation.",
    contact: {
      firstName: "Sam",
      lastName: "",
      preferredContactMethod: "phone",
      state: "TN",
      smsConsent: false,
    },
    insuredAssets: [],
    renewalUrgency: {},
    crossSellPotential: [],
    conversationSummary: "Started the Quick Quote Chat but didn't finish.",
    missingFields: ["phone", "email"],
    leadScore: 40,
    leadScoreTier: "nurture",
    source: {},
    ...overrides,
  };
}

const fullLeadByFamily: Record<string, Lead> = {
  "collector-vehicle": quoteFormToLead({
    ...baseContact,
    family: "collector-vehicle",
    vehicleYear: "1969",
    vehicleMake: "Chevrolet",
    vehicleModel: "Camaro",
    estimatedValue: 45000,
    mileagePlan: "3000",
    liabilityLimits: "300000",
  } as QuoteFormInput),
  auto: quoteFormToLead({
    ...baseContact,
    family: "auto",
    personalOrCommercial: "personal",
    dateOfBirth: "1990-01-01",
    vehicleYear: "2021",
    vehicleMake: "Honda",
    vehicleModel: "Civic",
    liabilityLimits: "100-300-100",
    coverageType: "full",
  } as QuoteFormInput),
  home: quoteFormToLead({
    ...baseContact,
    family: "home",
    dateOfBirth: "1985-05-05",
    dwellingCoverageAmount: 300000,
    liabilityLimit: "300000",
    deductible: "1000",
  } as QuoteFormInput),
  recreational: quoteFormToLead({
    ...baseContact,
    family: "recreational",
    vehicleType: "boat",
    dateOfBirth: "1985-05-05",
    vehicleYear: "2015",
    vehicleMake: "Bayliner",
    vehicleModel: "175",
    coverageType: "full",
    liabilityLimits: "100-300",
  } as QuoteFormInput),
  life: quoteFormToLead({
    ...baseContact,
    family: "life",
    amountRequested: 250000,
    product: "term",
    height: "5'10\"",
    weight: "180",
    tobaccoUser: false,
  } as QuoteFormInput),
  business: quoteFormToLead({
    ...baseContact,
    family: "business",
    businessName: "Acme Roofing",
    businessAddress: "123 Main St",
    businessPhone: "8659876543",
    coverageType: "workers-comp",
    businessEntity: "llc",
    operationsDescription: "Residential roofing",
    liabilityCoverageRequested: "1000000",
  } as QuoteFormInput),
};

const partialLeadByFamily: Record<string, Lead> = {
  "collector-vehicle": partialLead("collector-vehicle", { missingFields: ["vehicleYear", "vehicleMake", "vehicleModel"] }),
  auto: partialLead("auto", { missingFields: ["vehicleYear", "vehicleMake", "vehicleModel", "phone"] }),
  home: partialLead("home", { missingFields: ["dwellingCoverageAmount", "phone"] }),
  recreational: partialLead("boat", { missingFields: ["vehicleYear", "vehicleMake", "vehicleModel"] }),
  life: partialLead("life", { missingFields: ["amountRequested", "product"] }),
  business: partialLead("business", { missingFields: ["businessName", "operationsDescription"] }),
};

describe("buildFallbackBrief", () => {
  for (const family of Object.keys(fullLeadByFamily)) {
    it(`produces a guardrail-clean, schema-valid brief for a full ${family} lead`, () => {
      const content = buildFallbackBrief(fullLeadByFamily[family], null);
      expect(() => agentBriefContentSchema.parse(content)).not.toThrow();
      forEachStringLeaf(content, (text) => expect(violatesGuardrails(text)).toBe(false));
    });

    it(`produces a guardrail-clean, schema-valid brief for a partial ${family} lead`, () => {
      const content = buildFallbackBrief(partialLeadByFamily[family], null);
      expect(() => agentBriefContentSchema.parse(content)).not.toThrow();
      forEachStringLeaf(content, (text) => expect(violatesGuardrails(text)).toBe(false));
    });
  }

  it("flags a commercial vehicle submitted through the auto flow", () => {
    const lead = fullLeadByFamily.auto;
    const conversation = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "completed-unclaimed" as const,
      familySlug: "auto",
      claimedBy: null,
      claimedAt: null,
      leadId: null,
      ipHash: null,
      state: {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "completed-unclaimed" as const,
        collectedFields: { personalOrCommercial: "commercial" },
        resumeConsent: false,
      },
    };
    const content = buildFallbackBrief(lead, conversation);
    expect(content.riskFlags.some((flag) => flag.includes("Commercial vehicle"))).toBe(true);
  });

  it("flags a prospect outside TN", () => {
    const lead = { ...fullLeadByFamily.home, contact: { ...fullLeadByFamily.home.contact, state: "KY" as const } };
    const content = buildFallbackBrief(lead, null);
    expect(content.riskFlags.some((flag) => flag.includes("KY"))).toBe(true);
  });

  it("surfaces classOfBusinessHint only when lead.line is the generic 'business' coverage type", () => {
    // fullLeadByFamily.business uses coverageType "workers-comp" (mirroring
    // mappers.test.ts), so lead.line is "workers-comp", not "business" --
    // buildClassOfBusinessHint is narrowly keyed on lead.line === "business"
    // per the approved plan, not on "submitted through the business family".
    expect(buildFallbackBrief(fullLeadByFamily.business, null).classOfBusinessHint).toBeNull();

    const genericBusinessLead = quoteFormToLead({
      ...baseContact,
      family: "business",
      businessName: "Acme Roofing",
      businessAddress: "123 Main St",
      businessPhone: "8659876543",
      coverageType: "business",
      businessEntity: "llc",
      operationsDescription: "Residential roofing",
      liabilityCoverageRequested: "1000000",
    } as QuoteFormInput);
    expect(buildFallbackBrief(genericBusinessLead, null).classOfBusinessHint).toBe("Residential roofing");
    expect(buildFallbackBrief(fullLeadByFamily.auto, null).classOfBusinessHint).toBeNull();
  });

  it("excludes the lead's own line from crossSellCandidates", () => {
    const content = buildFallbackBrief(fullLeadByFamily["collector-vehicle"], null);
    expect(content.crossSellCandidates).not.toContain("collector-vehicle");
  });

  it("reads missingFields straight from the lead", () => {
    const content = buildFallbackBrief(partialLeadByFamily.auto, null);
    expect(content.missingFields).toEqual(partialLeadByFamily.auto.missingFields);
  });
});
