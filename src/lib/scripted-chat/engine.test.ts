import { describe, it, expect } from "vitest";
import { answerStep, getFirstStep } from "@/lib/scripted-chat/engine";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";
import { scriptedFlows } from "@/lib/scripted-chat/flows";

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
