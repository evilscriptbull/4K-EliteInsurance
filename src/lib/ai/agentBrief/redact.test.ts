import { describe, it, expect, afterEach, vi } from "vitest";
import { redactForModel } from "@/lib/ai/agentBrief/redact";
import { appendMessage } from "@/lib/conversations/messages";
import type { Lead } from "@/lib/schemas/lead";
import type { StoredConversation } from "@/lib/conversations/lifecycle";

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

function makeConversation(overrides: Partial<StoredConversation> = {}): StoredConversation {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "in-progress",
    familySlug: "auto",
    claimedBy: null,
    claimedAt: null,
    leadId: null,
    ipHash: null,
    state: {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "in-progress",
      messages: [],
      collectedFields: {},
      resumeConsent: false,
    },
    ...overrides,
  };
}

describe("redactForModel", () => {
  describe("dropped keys", () => {
    const dropKeys = [
      "phone",
      "email",
      "lastName",
      "dateOfBirth",
      "licenseNumber",
      "businessPhone",
      "businessAddress",
      "company_website",
      "gclid",
    ];

    for (const key of dropKeys) {
      it(`drops ${key} from answers`, async () => {
        const lead = makeLead();
        const conversation = makeConversation({
          state: { ...makeConversation().state, collectedFields: { [key]: "sensitive-value", keep: "value" } },
        });
        const input = await redactForModel(lead, conversation);
        expect(input.answers).not.toHaveProperty(key);
        expect(input.answers.keep).toBe("value");
      });
    }

    it("never includes gclid in source", async () => {
      const lead = makeLead({ source: { gclid: "abc123", utmSource: "google" } });
      const input = await redactForModel(lead, null);
      expect(input.source).not.toHaveProperty("gclid");
      expect(input.source.utmSource).toBe("google");
    });
  });

  describe("digit-run redaction", () => {
    it("redacts a plain 7+ digit run", async () => {
      const lead = makeLead();
      const conversation = makeConversation({
        state: { ...makeConversation().state, collectedFields: { notes: "call me at 8651234567 please" } },
      });
      const input = await redactForModel(lead, conversation);
      expect(input.answers.notes).toBe("call me at [number removed] please");
    });

    it("redacts a space-separated digit run", async () => {
      const lead = makeLead();
      const conversation = makeConversation({
        state: { ...makeConversation().state, collectedFields: { notes: "phone 865 123 4567" } },
      });
      const input = await redactForModel(lead, conversation);
      expect(input.answers.notes).toBe("phone [number removed]");
    });

    it("redacts a dash-separated digit run", async () => {
      const lead = makeLead();
      const conversation = makeConversation({
        state: { ...makeConversation().state, collectedFields: { notes: "865-123-4567" } },
      });
      const input = await redactForModel(lead, conversation);
      expect(input.answers.notes).toBe("[number removed]");
    });

    it("leaves a short digit run (e.g. a vehicle year) alone", async () => {
      const lead = makeLead();
      const conversation = makeConversation({
        state: { ...makeConversation().state, collectedFields: { vehicleYear: "2021" } },
      });
      const input = await redactForModel(lead, conversation);
      expect(input.answers.vehicleYear).toBe("2021");
    });
  });

  describe("email redaction", () => {
    it("redacts an email-shaped token in free text", async () => {
      const lead = makeLead();
      const conversation = makeConversation({
        state: { ...makeConversation().state, collectedFields: { notes: "reach me at jane@example.com instead" } },
      });
      const input = await redactForModel(lead, conversation);
      expect(input.answers.notes).toBe("reach me at [email removed] instead");
    });
  });

  describe("live transcript boundary", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("includes only user/associate messages at or after claimedAt, excluding earlier and non-live roles", async () => {
      vi.useFakeTimers();
      const conversationId = crypto.randomUUID();

      vi.setSystemTime(new Date("2026-10-01T10:00:00.000Z"));
      await appendMessage(conversationId, { role: "assistant", content: "What's your name?" });
      await appendMessage(conversationId, { role: "user", content: "Jane, before claim" });

      vi.setSystemTime(new Date("2026-10-01T10:05:00.000Z"));
      const claimedAt = new Date("2026-10-01T10:05:00.000Z").toISOString();

      await appendMessage(conversationId, { role: "associate", content: "Hi Jane, I'm here to help." });
      await appendMessage(conversationId, { role: "user", content: "Great, thanks, after claim" });
      await appendMessage(conversationId, { role: "system", content: "An associate joined the chat." });

      const lead = makeLead();
      const conversation = makeConversation({ id: conversationId, claimedAt });
      const input = await redactForModel(lead, conversation);

      expect(input.transcript).toEqual([
        { role: "associate", content: "Hi Jane, I'm here to help." },
        { role: "user", content: "Great, thanks, after claim" },
      ]);
    });

    it("returns null transcript when the conversation was never claimed", async () => {
      const lead = makeLead();
      const conversation = makeConversation({ claimedAt: null });
      const input = await redactForModel(lead, conversation);
      expect(input.transcript).toBeNull();
    });

    it("returns null transcript for the conversation-less quote-form path", async () => {
      const lead = makeLead();
      const input = await redactForModel(lead, null);
      expect(input.transcript).toBeNull();
    });
  });
});
