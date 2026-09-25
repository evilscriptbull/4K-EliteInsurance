import { describe, it, expect } from "vitest";
import { quoteFormToLead } from "@/lib/leads/mappers";
import type { QuoteFormInput } from "@/lib/schemas/forms";

const baseContact = {
  firstName: "Jane",
  lastName: "Doe",
  phone: "8651234567",
  email: "jane@example.com",
  state: "TN" as const,
  smsConsent: false,
};

describe("quoteFormToLead", () => {
  it("maps a collector-vehicle quote", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "collector-vehicle",
      vehicleYear: "1969",
      vehicleMake: "Chevrolet",
      vehicleModel: "Camaro",
      estimatedValue: 45000,
      mileagePlan: "3000",
      liabilityLimits: "300000",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("collector-vehicle");
    expect(lead.insuredAssets[0]).toMatchObject({ kind: "vehicle", value: 45000 });
  });

  it("maps a personal auto quote to the auto line", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "auto",
      personalOrCommercial: "personal",
      dateOfBirth: "1990-01-01",
      vehicleYear: "2021",
      vehicleMake: "Honda",
      vehicleModel: "Civic",
      liabilityLimits: "100-300-100",
      coverageType: "full",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("auto");
  });

  it("maps a commercial auto quote to the commercial-auto line", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "auto",
      personalOrCommercial: "commercial",
      dateOfBirth: "1990-01-01",
      vehicleYear: "2019",
      vehicleMake: "Ford",
      vehicleModel: "Transit",
      liabilityLimits: "250-500-100",
      coverageType: "full",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("commercial-auto");
  });

  it("maps a home quote", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "home",
      dateOfBirth: "1985-05-05",
      dwellingCoverageAmount: 300000,
      liabilityLimit: "300000",
      deductible: "1000",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("home");
    expect(lead.insuredAssets[0]).toMatchObject({ kind: "home", value: 300000 });
  });

  it("maps a recreational quote to its vehicleType", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "recreational",
      vehicleType: "boat",
      dateOfBirth: "1985-05-05",
      vehicleYear: "2015",
      vehicleMake: "Bayliner",
      vehicleModel: "175",
      coverageType: "full",
      liabilityLimits: "100-300",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("boat");
  });

  it("maps a life quote", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "life",
      amountRequested: 250000,
      product: "term",
      height: "5'10\"",
      weight: "180",
      tobaccoUser: false,
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("life");
    expect(lead.insuredAssets[0]).toMatchObject({ kind: "life-policy", value: 250000 });
  });

  it("maps a business quote to its coverageType", () => {
    const input: QuoteFormInput = {
      ...baseContact,
      family: "business",
      businessName: "Acme Roofing",
      businessAddress: "123 Main St",
      businessPhone: "8659876543",
      coverageType: "workers-comp",
      businessEntity: "llc",
      operationsDescription: "Residential roofing",
      liabilityCoverageRequested: "1000000",
    };
    const lead = quoteFormToLead(input);
    expect(lead.line).toBe("workers-comp");
    expect(lead.insuredAssets[0]).toMatchObject({ kind: "business", description: "Acme Roofing" });
  });
});
