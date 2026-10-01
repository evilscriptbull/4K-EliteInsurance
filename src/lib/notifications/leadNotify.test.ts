import { describe, it, expect, vi, beforeEach } from "vitest";

const sendSmsMock = vi.fn();
const sendEmailMock = vi.fn();

vi.mock("@/lib/integrations/goto/client", () => ({ sendSms: sendSmsMock }));
vi.mock("@/lib/integrations/resend/client", () => ({ sendEmail: sendEmailMock }));

const { toE164, notifyAgentBrief } = await import("@/lib/notifications/leadNotify");

import type { Lead } from "@/lib/schemas/lead";
import type { AgentBrief, AgentBriefContent } from "@/lib/schemas/agentBrief";

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

function makeContent(overrides: Partial<AgentBriefContent> = {}): AgentBriefContent {
  return {
    headline: "Auto quote — Jane Doe",
    summary: "Wants an auto quote.",
    primaryLine: "auto",
    crossSellCandidates: [],
    urgency: { tier: "nurture", reasons: [] },
    keyFacts: [],
    missingFields: [],
    suggestedQuestions: [],
    riskFlags: [],
    classOfBusinessHint: null,
    recommendedNextAction: "email-first",
    ...overrides,
  };
}

function makeBrief(overrides: Partial<AgentBrief> = {}): AgentBrief {
  return {
    id: crypto.randomUUID(),
    leadId: crypto.randomUUID(),
    conversationId: null,
    createdAt: new Date().toISOString(),
    origin: "fallback",
    model: null,
    promptVersion: "test",
    usage: null,
    content: makeContent(),
    ...overrides,
  };
}

beforeEach(() => {
  sendSmsMock.mockReset();
  sendEmailMock.mockReset();
  sendSmsMock.mockResolvedValue(undefined);
  sendEmailMock.mockResolvedValue({ sent: true });
  delete process.env.AGENT_BRIEF_EMAIL;
  process.env.GOTO_NOTIFY_PHONE_NUMBER = "+18655550000";
});

describe("toE164", () => {
  it("normalizes a plain 10-digit number", () => {
    expect(toE164("8651234567")).toBe("+18651234567");
  });

  it("normalizes a formatted number", () => {
    expect(toE164("(865) 123-4567")).toBe("+18651234567");
  });

  it("normalizes an 11-digit number already starting with 1", () => {
    expect(toE164("18651234567")).toBe("+18651234567");
  });

  it("passes through an already-E.164 number", () => {
    expect(toE164("+18651234567")).toBe("+18651234567");
  });

  it("returns null for a too-short number", () => {
    expect(toE164("12345")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(toE164("")).toBeNull();
  });
});

describe("notifyAgentBrief", () => {
  it("includes a tel: link when the lead has a phone", async () => {
    const lead = makeLead({ contact: { ...makeLead().contact, phone: "8651234567" } });
    const brief = makeBrief();
    await notifyAgentBrief(lead, brief);

    expect(sendSmsMock).toHaveBeenCalledTimes(1);
    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).toContain("tel:+18651234567");
  });

  it("omits the tel: link when the lead has no phone", async () => {
    const lead = makeLead({ contact: { ...makeLead().contact, phone: undefined } });
    const brief = makeBrief();
    await notifyAgentBrief(lead, brief);

    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).not.toContain("tel:");
  });

  it("shows 'nothing critical' when there are no missing fields", async () => {
    const lead = makeLead();
    const brief = makeBrief({ content: makeContent({ missingFields: [] }) });
    await notifyAgentBrief(lead, brief);

    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).toContain("Missing: nothing critical");
  });

  it("lists only the first 2 missing fields", async () => {
    const lead = makeLead();
    const brief = makeBrief({ content: makeContent({ missingFields: ["phone", "email", "dateOfBirth"] }) });
    await notifyAgentBrief(lead, brief);

    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).toContain("Missing: phone, email");
    expect(text).not.toContain("dateOfBirth");
  });

  it("is at most 4 lines", async () => {
    const lead = makeLead();
    const brief = makeBrief();
    await notifyAgentBrief(lead, brief);

    const [, text] = sendSmsMock.mock.calls[0];
    expect(text.split("\n").length).toBeLessThanOrEqual(4);
  });

  it("does not send SMS when GOTO_NOTIFY_PHONE_NUMBER is unconfigured", async () => {
    delete process.env.GOTO_NOTIFY_PHONE_NUMBER;
    await notifyAgentBrief(makeLead(), makeBrief());
    expect(sendSmsMock).not.toHaveBeenCalled();
  });

  it("does not send the internal email when AGENT_BRIEF_EMAIL is unset (default off)", async () => {
    await notifyAgentBrief(makeLead(), makeBrief());
    expect(sendEmailMock).not.toHaveBeenCalled();
    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).not.toContain("Brief emailed");
  });

  it("does not send the internal email when AGENT_BRIEF_EMAIL is any value other than 'true'", async () => {
    process.env.AGENT_BRIEF_EMAIL = "1";
    await notifyAgentBrief(makeLead(), makeBrief());
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("sends the internal email and notes it in the SMS when AGENT_BRIEF_EMAIL is 'true'", async () => {
    process.env.AGENT_BRIEF_EMAIL = "true";
    sendEmailMock.mockResolvedValue({ sent: true });

    await notifyAgentBrief(makeLead(), makeBrief());

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).toContain("Brief emailed to");
  });

  it("doesn't claim the email was sent in the SMS if the send itself failed", async () => {
    process.env.AGENT_BRIEF_EMAIL = "true";
    sendEmailMock.mockResolvedValue({ sent: false, reason: "not-configured" });

    await notifyAgentBrief(makeLead(), makeBrief());

    const [, text] = sendSmsMock.mock.calls[0];
    expect(text).not.toContain("Brief emailed");
  });
});
