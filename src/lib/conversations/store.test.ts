import { describe, it, expect } from "vitest";
import {
  createConversation,
  getConversation,
  claimConversation,
  releaseConversation,
  completeConversation,
  mergeAnswer,
  listLive,
  listIdleInProgress,
  countRecentConversationsByIpHash,
  markStaffPinged,
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
    ipHash: null,
    state: {
      id,
      createdAt: now,
      updatedAt: now,
      status,
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

describe("listLive", () => {
  it("excludes a released conversation", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);
    await claimConversation(conversation.id, "associate-a");
    await releaseConversation(conversation.id, "associate-a");

    const live = await listLive();
    expect(live.some((c) => c.id === conversation.id)).toBe(false);
  });

  it("caps the result at the live-queue limit", async () => {
    await Promise.all(Array.from({ length: 101 }, () => createConversation(makeConversation("in-progress"))));
    expect((await listLive()).length).toBeLessThanOrEqual(100);
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

describe("countRecentConversationsByIpHash", () => {
  it("counts conversations from the same hash within the window", async () => {
    const ipHash = `hash-${crypto.randomUUID()}`;
    await createConversation({ ...makeConversation("in-progress"), ipHash });
    await createConversation({ ...makeConversation("completed-unclaimed"), ipHash });

    expect(await countRecentConversationsByIpHash(ipHash, 60 * 60 * 1000)).toBe(2);
  });

  it("doesn't count conversations from a different hash or outside the window", async () => {
    const ipHash = `hash-${crypto.randomUUID()}`;
    const oldConversation = makeConversation("in-progress");
    await createConversation({ ...oldConversation, ipHash, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() });
    await createConversation({ ...makeConversation("in-progress"), ipHash: `other-${crypto.randomUUID()}` });

    expect(await countRecentConversationsByIpHash(ipHash, 60 * 60 * 1000)).toBe(0);
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

describe("markStaffPinged", () => {
  it("succeeds once and sets staffPingedAt", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);

    expect(await markStaffPinged(conversation.id)).toBe(true);
    const result = await getConversation(conversation.id);
    expect(result?.state.staffPingedAt).toBeTypeOf("string");
  });

  it("fails on every call after the first", async () => {
    const conversation = makeConversation("in-progress");
    await createConversation(conversation);

    expect(await markStaffPinged(conversation.id)).toBe(true);
    expect(await markStaffPinged(conversation.id)).toBe(false);
  });
});
