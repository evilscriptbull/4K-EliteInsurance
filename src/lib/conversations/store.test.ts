import { describe, it, expect } from "vitest";
import {
  createConversation,
  claimConversation,
  releaseConversation,
  completeConversation,
  type StoredConversation,
  type ConversationStatus,
} from "@/lib/conversations/store";

// DATABASE_URL is unset in the test environment (vitest doesn't load
// .env.local), so every store call below exercises the in-memory fallback
// branch. That branch is a module-level Map with no reset export, so each
// test creates its own conversation under a fresh id instead of relying on
// isolation between test cases.
function makeConversation(status: ConversationStatus): StoredConversation {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    status,
    familySlug: "auto",
    claimedBy: null,
    claimedAt: null,
    leadId: null,
    state: {
      id,
      createdAt: now,
      updatedAt: now,
      status,
      messages: [],
      collectedFields: {},
      resumeConsent: false,
    },
  };
}

describe("claimConversation", () => {
  it("succeeds on an in-progress conversation", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    const claimed = await claimConversation(conversation.id, "associate-a");
    expect(claimed).toBe(true);
  });

  it("fails on a second claim by a different associate", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    expect(await claimConversation(conversation.id, "associate-a")).toBe(true);
    expect(await claimConversation(conversation.id, "associate-b")).toBe(false);
  });

  it("fails on a conversation that isn't in-progress", async () => {
    const conversation = makeConversation("abandoned");
    await createConversation(conversation);
    expect(await claimConversation(conversation.id, "associate-a")).toBe(false);
  });
});

describe("releaseConversation", () => {
  it("only succeeds for the associate who claimed it", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");

    expect(await releaseConversation(conversation.id, "associate-b")).toBe(false);
    expect(await releaseConversation(conversation.id, "associate-a")).toBe(true);
  });
});

describe("completeConversation", () => {
  it("only succeeds for the associate who claimed it", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");

    expect(await completeConversation(conversation.id, "associate-b")).toBe(false);
    expect(await completeConversation(conversation.id, "associate-a")).toBe(true);
  });
});
