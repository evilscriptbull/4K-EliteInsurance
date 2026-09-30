import { describe, it, expect } from "vitest";
import {
  createConversation,
  getConversation,
  claimConversation,
  releaseConversation,
  completeConversation,
  mergeAnswer,
  listNeedsFollowUp,
  listLive,
  listIdleInProgress,
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

  it("transitions to released, not back to in-progress, and keeps claimedBy", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");
    await releaseConversation(conversation.id, "associate-a");

    const result = await getConversation(conversation.id);
    expect(result?.status).toBe("released");
    expect(result?.claimedBy).toBe("associate-a");
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

describe("listNeedsFollowUp / listLive", () => {
  it("moves a released conversation into follow-up, out of the live queue", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");
    await releaseConversation(conversation.id, "associate-a");

    const [followUp, live] = await Promise.all([listNeedsFollowUp(), listLive()]);
    expect(followUp.some((c) => c.id === conversation.id)).toBe(true);
    expect(live.some((c) => c.id === conversation.id)).toBe(false);
  });
});

describe("listIdleInProgress", () => {
  it("returns an in-progress conversation only once it's older than the threshold", async () => {
    const conversation = makeConversation("in-progress");
    const staleUpdatedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await createConversation({ ...conversation, updatedAt: staleUpdatedAt });

    expect((await listIdleInProgress(20 * 60 * 1000)).some((c) => c.id === conversation.id)).toBe(true);
    expect((await listIdleInProgress(60 * 60 * 1000)).some((c) => c.id === conversation.id)).toBe(false);
  });

  it("excludes conversations that aren't in-progress even if they're stale", async () => {
    const conversation = makeConversation("claimed");
    const staleUpdatedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await createConversation({ ...conversation, updatedAt: staleUpdatedAt });

    expect((await listIdleInProgress(20 * 60 * 1000)).some((c) => c.id === conversation.id)).toBe(false);
  });
});

describe("mergeAnswer", () => {
  it("merges new fields and advances currentStepId when in-progress", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);

    const merged = await mergeAnswer(conversation.id, {
      currentStepId: "vehicleYear",
      newFields: { personalOrCommercial: "personal" },
    });
    expect(merged).toBe(true);

    const result = await getConversation(conversation.id);
    expect(result?.state.currentStepId).toBe("vehicleYear");
    expect(result?.state.collectedFields).toMatchObject({ personalOrCommercial: "personal" });
  });

  it("fails once the conversation is no longer in-progress", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");

    const merged = await mergeAnswer(conversation.id, {
      currentStepId: "vehicleYear",
      newFields: { personalOrCommercial: "personal" },
    });
    expect(merged).toBe(false);
  });
});
