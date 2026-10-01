import { describe, it, expect } from "vitest";
import { buildUserMessage } from "@/lib/ai/agentBrief/prompt";
import type { BriefModelInput } from "@/lib/ai/agentBrief/redact";

const fixture: BriefModelInput = {
  firstName: "Jane",
  line: "auto",
  familySlug: "auto",
  state: "TN",
  intent: "Wants a personal auto quote for a 2021 Honda Civic.",
  completeness: "full",
  answers: { vehicleYear: "2021", vehicleMake: "Honda", vehicleModel: "Civic", coverageType: "full" },
  missingFields: [],
  transcript: null,
  source: { utmSource: "google", utmMedium: "cpc" },
  smsConsent: true,
  priorityLines: ["workers-comp", "general-liability"],
};

describe("buildUserMessage", () => {
  it("is deterministic across repeated calls with the same input", () => {
    expect(buildUserMessage(fixture)).toBe(buildUserMessage(fixture));
  });

  it("produces identical output regardless of the answers object's key insertion order", () => {
    const reordered: BriefModelInput = {
      ...fixture,
      answers: { coverageType: "full", vehicleModel: "Civic", vehicleYear: "2021", vehicleMake: "Honda" },
    };
    expect(buildUserMessage(fixture)).toBe(buildUserMessage(reordered));
  });

  it("matches the known snapshot format", () => {
    expect(buildUserMessage(fixture)).toMatchSnapshot();
  });

  it("includes a labeled live transcript section only when the input has one", () => {
    const withoutTranscript = buildUserMessage(fixture);
    expect(withoutTranscript).not.toContain("Live transcript:");

    const withTranscript = buildUserMessage({
      ...fixture,
      transcript: [
        { role: "associate", content: "Hi Jane, I'm here to help." },
        { role: "user", content: "Great, thanks." },
      ],
    });
    expect(withTranscript).toContain("Live transcript:\nassociate: Hi Jane, I'm here to help.\nuser: Great, thanks.");
  });

  it("notes a partial completeness and lists missing fields instead of guessing", () => {
    const partial = buildUserMessage({ ...fixture, completeness: "partial", missingFields: ["phone", "email"] });
    expect(partial).toContain("Completeness: partial");
    expect(partial).toContain("Missing fields:\n- phone\n- email");
  });

  it("renders a static quote-form lead (no family/conversation) without crashing", () => {
    const formLead = buildUserMessage({ ...fixture, familySlug: null, transcript: null });
    expect(formLead).toContain("Family: none (static quote form)");
  });
});
