import { describe, it, expect, vi, beforeEach } from "vitest";

const generateStructuredMock = vi.fn();
const saveAgentBriefMock = vi.fn();

vi.mock("@/lib/ai/gateway", () => ({ generateStructured: generateStructuredMock }));
vi.mock("@/lib/ai/agentBrief/store", () => ({ saveAgentBrief: saveAgentBriefMock }));

const { generateAgentBrief, validateBriefContent } = await import("@/lib/ai/agentBrief/generate");

import type { Lead } from "@/lib/schemas/lead";
import type { AgentBriefContent } from "@/lib/schemas/agentBrief";

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    channel: "chat",
    completeness: "full",
    line: "auto",
    intent: "Wants an auto quote.",
    contact: {
      firstName: "Jane",
      lastName: "Doe",
      phone: "8651234567",
      email: "jane@example.com",
      preferredContactMethod: "phone",
      state: "TN",
      smsConsent: true,
    },
    insuredAssets: [],
    renewalUrgency: {},
    crossSellPotential: [],
    conversationSummary: "Completed the Quick Quote Chat.",
    missingFields: [],
    leadScore: 50,
    leadScoreTier: "nurture",
    source: {},
    ...overrides,
  };
}

function validContent(lead: Lead, overrides: Partial<AgentBriefContent> = {}): AgentBriefContent {
  return {
    headline: `Auto quote — ${lead.contact.firstName} ${lead.contact.lastName}`,
    summary: "Wants an auto quote for a 2021 Honda Civic.",
    primaryLine: lead.line,
    crossSellCandidates: [],
    urgency: { tier: "nurture", reasons: [] },
    keyFacts: [],
    missingFields: [],
    suggestedQuestions: ["When does your current policy renew?"],
    riskFlags: [],
    classOfBusinessHint: null,
    recommendedNextAction: "email-first",
    ...overrides,
  };
}

beforeEach(() => {
  generateStructuredMock.mockReset();
  saveAgentBriefMock.mockReset();
  saveAgentBriefMock.mockResolvedValue(undefined);
});

describe("generateAgentBrief", () => {
  it("uses the model's output when status is ok and it passes validation", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({
      status: "ok",
      data: validContent(lead),
      usage: { inputTokens: 120, outputTokens: 60, cacheReadTokens: 0 },
      model: "claude-sonnet-5",
      durationMs: 1200,
    });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("model");
    expect(brief.model).toBe("claude-sonnet-5");
    expect(brief.usage).toEqual({ inputTokens: 120, outputTokens: 60 });
    expect(brief.content.headline).toContain("Jane Doe");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("falls back when the model's output fails post-validation (guardrail phrase)", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({
      status: "ok",
      data: validContent(lead, { summary: "You're covered no matter what happens." }),
      model: "claude-sonnet-5",
      durationMs: 1200,
    });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(brief.model).toBeNull();
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("falls back when status is not-configured", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({ status: "not-configured", durationMs: 1 });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("falls back when status is parse-failed", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({ status: "parse-failed", model: "claude-sonnet-5", durationMs: 500 });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("falls back when status is refusal", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({ status: "refusal", model: "claude-sonnet-5", durationMs: 500 });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("falls back when status is error", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({ status: "error", errorMessage: "rate-limit-error", durationMs: 500 });

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("never throws even if generateStructured itself rejects", async () => {
    const lead = makeLead();
    generateStructuredMock.mockRejectedValue(new Error("network down"));

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(saveAgentBriefMock).toHaveBeenCalledWith(brief);
  });

  it("still returns a usable brief even if saveAgentBrief itself rejects", async () => {
    const lead = makeLead();
    generateStructuredMock.mockResolvedValue({ status: "not-configured", durationMs: 1 });
    saveAgentBriefMock.mockRejectedValue(new Error("db unreachable"));

    const brief = await generateAgentBrief(lead, null);

    expect(brief.origin).toBe("fallback");
    expect(brief.leadId).toBe(lead.id);
  });
});

describe("validateBriefContent", () => {
  it("accepts a model brief whose primaryLine matches the lead", () => {
    const lead = makeLead();
    const result = validateBriefContent(validContent(lead), lead);
    expect(result.ok).toBe(true);
  });

  it("forces primaryLine back to the lead's line and flags it when the model disagreed", () => {
    const lead = makeLead({ line: "home" });
    const result = validateBriefContent(validContent(lead, { primaryLine: "auto", crossSellCandidates: ["auto", "home"] }), lead);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content.primaryLine).toBe("home");
      expect(result.content.crossSellCandidates).toEqual(["auto"]);
      expect(result.content.riskFlags.some((flag) => flag.includes("different line"))).toBe(true);
    }
  });

  it("dedupes crossSellCandidates and removes the lead's own line", () => {
    const lead = makeLead({ line: "auto" });
    const result = validateBriefContent(validContent(lead, { crossSellCandidates: ["home", "home", "auto"] }), lead);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.content.crossSellCandidates).toEqual(["home"]);
  });

  it("accepts a legitimate customer-stated dollar amount (e.g. a restated asset value)", () => {
    // A bare "$"+digits is no longer a rejection trigger on its own -- see
    // generate.ts's comment on PREMIUM_OR_RATE_WITH_NUMBER_PATTERN. Real
    // leads (home dwelling coverage, life amount requested, collector
    // vehicle value) legitimately restate a real dollar figure that's
    // already in Lead.intent; only an actual premium/rate estimate (below)
    // is rejected.
    const lead = makeLead();
    const result = validateBriefContent(validContent(lead, { summary: "Customer's stated vehicle value is $62,000." }), lead);
    expect(result.ok).toBe(true);
  });

  it("rejects a premium/rate estimate", () => {
    const lead = makeLead();
    const result = validateBriefContent(validContent(lead, { summary: "The rate is about 1200 per year." }), lead);
    expect(result.ok).toBe(false);
  });

  it("rejects a 7+ digit PII leak", () => {
    const lead = makeLead();
    const result = validateBriefContent(validContent(lead, { summary: "Reach them at 8651234567." }), lead);
    expect(result.ok).toBe(false);
  });

  it("rejects a banned guardrail phrase anywhere, including nested arrays", () => {
    const lead = makeLead();
    const result = validateBriefContent(validContent(lead, { riskFlags: ["We guarantee lower rates."] }), lead);
    expect(result.ok).toBe(false);
  });
});
