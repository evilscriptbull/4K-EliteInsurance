import { describe, it, expect } from "vitest";
import { scriptedAnswersToLead, conversationToPartialLead, scriptedStepProgress } from "@/lib/scripted-chat/finalize";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";

const fullAutoAnswers = {
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
  liabilityLimits: "250-500-100",
  dateOfBirth: "1990-01-01",
};

describe("scriptedAnswersToLead", () => {
  it("produces a full, chat-channel Lead from a completed flow", () => {
    const lead = scriptedAnswersToLead("auto", fullAutoAnswers);
    expect(lead.channel).toBe("chat");
    expect(lead.completeness).toBe("full");
    expect(lead.line).toBe("auto");
    expect(lead.contact.firstName).toBe("Jane");
  });

  it("throws when required fields are missing (partial conversation)", () => {
    expect(() => scriptedAnswersToLead("auto", { personalOrCommercial: "personal" })).toThrow();
  });

  it("honors an explicit channel override (e.g. chat-live for a claimed conversation)", () => {
    const lead = scriptedAnswersToLead("auto", fullAutoAnswers, {}, "chat-live");
    expect(lead.channel).toBe("chat-live");
  });
});

describe("scriptedStepProgress", () => {
  it("counts steps answered before the current step", () => {
    // Phase 5.1 order: personalOrCommercial(0), fullName(1), phone(2),
    // smsConsent(3), email(4), vehicleYear(5), vehicleMake(6), ...
    const progress = scriptedStepProgress(autoFlow, "vehicleMake");
    expect(progress).toEqual({ answeredCount: 6, totalCount: autoFlow.steps.length });
  });

  it("treats a null currentStepId (flow completed) as every step answered", () => {
    expect(scriptedStepProgress(autoFlow, null)).toEqual({
      answeredCount: autoFlow.steps.length,
      totalCount: autoFlow.steps.length,
    });
  });

  it("treats a missing/unrecognized currentStepId as every step answered", () => {
    expect(scriptedStepProgress(autoFlow, undefined).answeredCount).toBe(autoFlow.steps.length);
    expect(scriptedStepProgress(autoFlow, "not-a-real-step").answeredCount).toBe(autoFlow.steps.length);
  });
});

describe("conversationToPartialLead", () => {
  it("returns null when there's no name and no way to reach the prospect", () => {
    const lead = conversationToPartialLead(autoFlow, "auto", { personalOrCommercial: "personal" }, "vehicleYear");
    expect(lead).toBeNull();
  });

  it("builds a partial lead with completeness/missingFields when contact info exists -- proving Phase 5.1's whole point: an abandon before any vehicle question still has phone captured", () => {
    const answers = {
      personalOrCommercial: "personal",
      firstName: "Jane",
      lastName: "Doe",
      phone: "8651234567",
      smsConsent: true,
      email: "jane@example.com",
    };
    const lead = conversationToPartialLead(autoFlow, "auto", answers, "vehicleYear");
    expect(lead).not.toBeNull();
    expect(lead?.completeness).toBe("partial");
    expect(lead?.channel).toBe("chat");
    expect(lead?.contact.phone).toBe("8651234567");
    expect(lead?.missingFields).not.toContain("personalOrCommercial");
    expect(lead?.missingFields).not.toContain("phone");
    expect(lead?.missingFields).toContain("vehicleYear");
    expect(lead?.missingFields).toContain("vehicleMake");
  });

  it("doesn't misreport the spreadFields 'fullName' step as missing once its target keys are answered", () => {
    // fullName is a spreadFields step: answering it stores firstName/lastName,
    // never a "fullName" key. currentStepId past it (at "phone") means it
    // was answered, even though "fullName" itself never appears in `answers`.
    const answers = { personalOrCommercial: "personal", firstName: "Jane", lastName: "Doe" };
    const lead = conversationToPartialLead(autoFlow, "auto", answers, "phone");
    expect(lead?.missingFields).not.toContain("fullName");
    expect(lead?.missingFields).toEqual([
      "phone",
      "smsConsent",
      "email",
      "vehicleYear",
      "vehicleMake",
      "vehicleModel",
      "coverageType",
      "liabilityLimits",
    ]);
  });

  it("maps currentCarrier/renewalDate/hasActivePolicy into renewalUrgency when present", () => {
    const answers = {
      personalOrCommercial: "personal",
      firstName: "Jane",
      lastName: "Doe",
      phone: "8651234567",
      currentCarrier: "State Farm",
      renewalDate: "2026-11-15",
      hasActivePolicy: true,
    };
    const lead = conversationToPartialLead(autoFlow, "auto", answers, "renewalDate");
    expect(lead?.renewalUrgency).toEqual({
      currentCarrier: "State Farm",
      renewalDate: "2026-11-15",
      hasActivePolicy: true,
    });
  });

  it("is satisfied by phone/email alone even without a name", () => {
    const lead = conversationToPartialLead(autoFlow, "auto", { phone: "8651234567" }, "vehicleYear");
    expect(lead).not.toBeNull();
  });

  it("honors an explicit channel override (e.g. chat-live for a claimed conversation)", () => {
    const answers = {
      personalOrCommercial: "personal",
      firstName: "Jane",
      lastName: "Doe",
      phone: "8651234567",
      smsConsent: true,
      email: "jane@example.com",
    };
    const lead = conversationToPartialLead(autoFlow, "auto", answers, "vehicleYear", {}, "chat-live");
    expect(lead?.channel).toBe("chat-live");
  });
});
