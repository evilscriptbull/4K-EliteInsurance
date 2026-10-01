import { describe, it, expect } from "vitest";
import { answerStep, getFirstStep } from "@/lib/scripted-chat/engine";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";
import { businessFlow } from "@/lib/scripted-chat/flows/business";
import { collectorVehicleFlow } from "@/lib/scripted-chat/flows/collector-vehicle";
import { homeFlow } from "@/lib/scripted-chat/flows/home";
import { recreationalFlow } from "@/lib/scripted-chat/flows/recreational";
import { lifeFlow } from "@/lib/scripted-chat/flows/life";
import { scriptedFlows } from "@/lib/scripted-chat/flows";

function walkFlow(flow: typeof autoFlow, answersInOrder: Array<{ stepId: string; answer: unknown }>) {
  let answers: Record<string, unknown> = {};
  let lastStatus = "";
  for (const { stepId, answer } of answersInOrder) {
    const result = answerStep(flow, stepId, answer, answers);
    lastStatus = result.status;
    if (result.status === "invalid") {
      throw new Error(`Unexpected invalid answer at step "${stepId}": ${result.errors.join(", ")}`);
    }
    answers = result.answers;
  }
  return { answers, lastStatus };
}

describe("getFirstStep", () => {
  it("returns the flow's declared first step", () => {
    expect(getFirstStep(autoFlow).id).toBe("personalOrCommercial");
  });
});

describe("answerStep", () => {
  it("returns invalid with errors for a bad answer", () => {
    const result = answerStep(autoFlow, "personalOrCommercial", "not-a-real-option", {});
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("skips an optional step when no answer is given", () => {
    const result = answerStep(autoFlow, "licenseNumber", undefined, {});
    expect(result.status).toBe("next");
    if (result.status === "next") {
      expect(result.step.id).toBe("notes");
      expect(result.answers).not.toHaveProperty("licenseNumber");
    }
  });

  it("spreads a spreadFields step's parsed output into the answers instead of nesting under its field", () => {
    const result = answerStep(autoFlow, "fullName", "Jane Doe", {});
    expect(result.status).toBe("next");
    if (result.status === "next") {
      expect(result.answers).toMatchObject({ firstName: "Jane", lastName: "Doe" });
      expect(result.answers).not.toHaveProperty("fullName");
    }
  });

  it("derives hasActivePolicy: true and keeps the carrier name when a real carrier is chosen", () => {
    const result = answerStep(autoFlow, "currentCarrier", "State Farm", {});
    expect(result.status).toBe("next");
    if (result.status === "next") {
      expect(result.answers).toMatchObject({ currentCarrier: "State Farm", hasActivePolicy: true });
    }
  });

  it("derives hasActivePolicy: false and no carrier name for 'not currently insured'", () => {
    const result = answerStep(autoFlow, "currentCarrier", "not-insured", {});
    expect(result.status).toBe("next");
    if (result.status === "next") {
      expect(result.answers).toMatchObject({ hasActivePolicy: false });
      expect(result.answers.currentCarrier).toBeUndefined();
    }
  });

  it("walks the full auto flow to completion", () => {
    const answersInOrder: Array<{ stepId: string; answer: unknown }> = [
      { stepId: "personalOrCommercial", answer: "personal" },
      { stepId: "fullName", answer: "Jane Doe" },
      { stepId: "phone", answer: "8651234567" },
      { stepId: "smsConsent", answer: true },
      { stepId: "email", answer: "jane@example.com" },
      { stepId: "vehicleYear", answer: "2021" },
      { stepId: "vehicleMake", answer: "Honda" },
      { stepId: "vehicleModel", answer: "Civic" },
      { stepId: "coverageType", answer: "full" },
      { stepId: "liabilityLimits", answer: "100-300-100" },
      { stepId: "currentCarrier", answer: "State Farm" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "dateOfBirth", answer: "1990-01-01" },
      { stepId: "licenseNumber", answer: undefined },
      { stepId: "notes", answer: undefined },
    ];

    let answers: Record<string, unknown> = {};
    let lastStatus = "";
    for (const { stepId, answer } of answersInOrder) {
      const result = answerStep(autoFlow, stepId, answer, answers);
      lastStatus = result.status;
      if (result.status === "invalid") {
        throw new Error(`Unexpected invalid answer at step "${stepId}": ${result.errors.join(", ")}`);
      }
      answers = result.answers;
    }

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      personalOrCommercial: "personal",
      firstName: "Jane",
      lastName: "Doe",
      phone: "8651234567",
      smsConsent: true,
      email: "jane@example.com",
      vehicleYear: "2021",
      vehicleMake: "Honda",
      vehicleModel: "Civic",
      coverageType: "full",
      liabilityLimits: "100-300-100",
      currentCarrier: "State Farm",
      hasActivePolicy: true,
      dateOfBirth: "1990-01-01",
    });
    expect(answers).not.toHaveProperty("renewalDate");
    expect(answers).not.toHaveProperty("licenseNumber");
    expect(answers).not.toHaveProperty("notes");
  });
});

describe("businessFlow", () => {
  it("walks the non-contractors path, skipping the trade/certificates branch entirely", () => {
    const { answers, lastStatus } = walkFlow(businessFlow, [
      { stepId: "coverageType", answer: "general-liability" },
      { stepId: "fullName", answer: "Jane Owner" },
      { stepId: "phone", answer: "8651234567" },
      { stepId: "smsConsent", answer: true },
      { stepId: "email", answer: "jane@example.com" },
      { stepId: "businessName", answer: "Acme Co" },
      { stepId: "operationsDescription", answer: "General retail store" },
      { stepId: "businessEntity", answer: "llc" },
      { stepId: "yearsInBusiness", answer: "5" },
      { stepId: "employees", answer: "10" },
      { stepId: "annualPayroll", answer: "250k-500k" },
      { stepId: "annualRevenue", answer: "500k-1m" },
      { stepId: "usesSubcontractors", answer: false },
      { stepId: "vehicleCount", answer: "2" },
      { stepId: "currentCarrier", answer: "Travelers" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "liabilityCoverageRequested", answer: "1000000" },
      { stepId: "businessAddress", answer: "123 Main St" },
      { stepId: "businessPhone", answer: undefined },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      coverageType: "general-liability",
      firstName: "Jane",
      lastName: "Owner",
      businessName: "Acme Co",
      businessEntity: "llc",
      yearsInBusiness: 5,
      employees: 10,
      annualPayroll: "250k-500k",
      annualRevenue: "500k-1m",
      usesSubcontractors: false,
      vehicleCount: 2,
      currentCarrier: "Travelers",
      hasActivePolicy: true,
      liabilityCoverageRequested: "1000000",
      businessAddress: "123 Main St",
    });
    expect(answers).not.toHaveProperty("trade");
    expect(answers).not.toHaveProperty("needsCertificates");
    expect(answers).not.toHaveProperty("renewalDate");
    expect(answers).not.toHaveProperty("businessPhone");
  });

  it("branches into trade/needsCertificates when coverageType is contractors", () => {
    const { answers, lastStatus } = walkFlow(businessFlow, [
      { stepId: "coverageType", answer: "contractors" },
      { stepId: "fullName", answer: "Bob Builder" },
      { stepId: "phone", answer: "8651234567" },
      { stepId: "smsConsent", answer: false },
      { stepId: "email", answer: "bob@example.com" },
      { stepId: "businessName", answer: "Bob's Roofing" },
      { stepId: "operationsDescription", answer: "Residential roofing" },
      { stepId: "trade", answer: "roofing" },
      { stepId: "needsCertificates", answer: true },
      { stepId: "businessEntity", answer: "individual" },
      { stepId: "yearsInBusiness", answer: "3" },
      { stepId: "employees", answer: "4" },
      { stepId: "annualPayroll", answer: "under-100k" },
      { stepId: "annualRevenue", answer: "under-250k" },
      { stepId: "usesSubcontractors", answer: true },
      { stepId: "vehicleCount", answer: "1" },
      { stepId: "currentCarrier", answer: "not-insured" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "liabilityCoverageRequested", answer: "other" },
      { stepId: "businessAddress", answer: "456 Oak St" },
      { stepId: "businessPhone", answer: undefined },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      coverageType: "contractors",
      trade: "roofing",
      needsCertificates: true,
      hasActivePolicy: false,
    });
    expect(answers.currentCarrier).toBeUndefined();
  });
});

describe("collectorVehicleFlow", () => {
  it("walks the full flow to completion", () => {
    const { answers, lastStatus } = walkFlow(collectorVehicleFlow, [
      { stepId: "fullName", answer: "Chris Collector" },
      { stepId: "phone", answer: "8655550030" },
      { stepId: "smsConsent", answer: true },
      { stepId: "email", answer: "chris@example.com" },
      { stepId: "vehicleYear", answer: "1969" },
      { stepId: "vehicleMake", answer: "Chevrolet" },
      { stepId: "vehicleModel", answer: "Camaro" },
      { stepId: "estimatedValue", answer: "45000" },
      { stepId: "mileagePlan", answer: "3000" },
      { stepId: "liabilityLimits", answer: "300000" },
      { stepId: "currentCarrier", answer: "State Farm" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "dateOfBirth", answer: undefined },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      firstName: "Chris",
      lastName: "Collector",
      vehicleYear: "1969",
      vehicleMake: "Chevrolet",
      vehicleModel: "Camaro",
      estimatedValue: 45000,
      mileagePlan: "3000",
      liabilityLimits: "300000",
      currentCarrier: "State Farm",
      hasActivePolicy: true,
    });
    expect(answers).not.toHaveProperty("dateOfBirth");
    expect(answers).not.toHaveProperty("renewalDate");
  });
});

describe("homeFlow", () => {
  it("walks the full flow to completion, skipping the now-optional dateOfBirth", () => {
    const { answers, lastStatus } = walkFlow(homeFlow, [
      { stepId: "fullName", answer: "Holly Owner" },
      { stepId: "phone", answer: "8655550040" },
      { stepId: "smsConsent", answer: false },
      { stepId: "email", answer: "holly@example.com" },
      { stepId: "dwellingCoverageAmount", answer: "350000" },
      { stepId: "liabilityLimit", answer: "300000" },
      { stepId: "deductible", answer: "1000" },
      { stepId: "currentCarrier", answer: "not-insured" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "dateOfBirth", answer: undefined },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      firstName: "Holly",
      lastName: "Owner",
      dwellingCoverageAmount: 350000,
      liabilityLimit: "300000",
      deductible: "1000",
      hasActivePolicy: false,
    });
    expect(answers.currentCarrier).toBeUndefined();
    expect(answers).not.toHaveProperty("dateOfBirth");
  });
});

describe("recreationalFlow", () => {
  it("walks the full flow to completion", () => {
    const { answers, lastStatus } = walkFlow(recreationalFlow, [
      { stepId: "vehicleType", answer: "boat" },
      { stepId: "fullName", answer: "Rhonda Rec" },
      { stepId: "phone", answer: "8655550050" },
      { stepId: "smsConsent", answer: true },
      { stepId: "email", answer: "rhonda@example.com" },
      { stepId: "vehicleYear", answer: "2015" },
      { stepId: "vehicleMake", answer: "Bayliner" },
      { stepId: "vehicleModel", answer: "175" },
      { stepId: "coverageType", answer: "full" },
      { stepId: "liabilityLimits", answer: "100-300" },
      { stepId: "currentCarrier", answer: "Progressive" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "dateOfBirth", answer: "1985-05-05" },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      vehicleType: "boat",
      firstName: "Rhonda",
      lastName: "Rec",
      vehicleYear: "2015",
      vehicleMake: "Bayliner",
      vehicleModel: "175",
      coverageType: "full",
      liabilityLimits: "100-300",
      currentCarrier: "Progressive",
      hasActivePolicy: true,
      dateOfBirth: "1985-05-05",
    });
  });
});

describe("lifeFlow", () => {
  it("walks the full flow to completion with its own carrier list", () => {
    const { answers, lastStatus } = walkFlow(lifeFlow, [
      { stepId: "fullName", answer: "Len Life" },
      { stepId: "phone", answer: "8655550060" },
      { stepId: "smsConsent", answer: false },
      { stepId: "email", answer: "len@example.com" },
      { stepId: "amountRequested", answer: "250000" },
      { stepId: "product", answer: "term" },
      { stepId: "height", answer: "5'10\"" },
      { stepId: "weight", answer: "180" },
      { stepId: "tobaccoUser", answer: false },
      { stepId: "currentCarrier", answer: "Northwestern Mutual" },
      { stepId: "renewalDate", answer: undefined },
      { stepId: "medicationsSurgeries", answer: undefined },
      { stepId: "notes", answer: undefined },
    ]);

    expect(lastStatus).toBe("complete");
    expect(answers).toMatchObject({
      firstName: "Len",
      lastName: "Life",
      amountRequested: 250000,
      product: "term",
      height: "5'10\"",
      weight: "180",
      tobaccoUser: false,
      currentCarrier: "Northwestern Mutual",
      hasActivePolicy: true,
    });
    expect(answers).not.toHaveProperty("dateOfBirth");
  });
});

describe("flow graph integrity", () => {
  for (const flow of Object.values(scriptedFlows)) {
    it(`every step's next() in "${flow.slug}" resolves to a real step id or null`, () => {
      const stepIds = new Set(flow.steps.map((step) => step.id));
      for (const step of flow.steps) {
        const nextId = step.next({});
        if (nextId !== null) {
          expect(stepIds.has(nextId)).toBe(true);
        }
      }
    });
  }
});
