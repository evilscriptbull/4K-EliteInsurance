import { describe, it, expect } from "vitest";
import {
  transition,
  conversationTransitions,
  inMemoryConversations,
  type ConversationStatus,
  type StoredConversation,
} from "@/lib/conversations/lifecycle";

function makeConversation(status: ConversationStatus, claimedBy: string | null = null): StoredConversation {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const conversation: StoredConversation = {
    id,
    createdAt: now,
    updatedAt: now,
    status,
    familySlug: "auto",
    claimedBy,
    claimedAt: claimedBy ? now : null,
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
  inMemoryConversations.set(id, conversation);
  return conversation;
}

describe("conversationTransitions table", () => {
  it("only allows the transitions in tasks/todo.md's target flow", () => {
    expect(conversationTransitions).toEqual({
      "in-progress": ["claimed", "completed-unclaimed", "abandoned"],
      claimed: ["completed-claimed", "released"],
      "completed-unclaimed": [],
      "completed-claimed": [],
      released: [],
      abandoned: [],
    });
  });
});

describe("transition", () => {
  it("applies every allowed transition in the table", async () => {
    for (const [from, tos] of Object.entries(conversationTransitions) as [ConversationStatus, ConversationStatus[]][]) {
      for (const to of tos) {
        const conversation = makeConversation(from);
        const applied = await transition(conversation.id, { from: [from], to });
        expect(applied).toBe(true);
        expect(inMemoryConversations.get(conversation.id)?.status).toBe(to);
      }
    }
  });

  it("rejects a transition from a status not in `from`", async () => {
    const conversation = makeConversation("completed-unclaimed");
    const applied = await transition(conversation.id, { from: ["in-progress"], to: "claimed" });
    expect(applied).toBe(false);
    expect(inMemoryConversations.get(conversation.id)?.status).toBe("completed-unclaimed");
  });

  it("rejects when claimedBy doesn't match the ownership guard", async () => {
    const conversation = makeConversation("claimed", "associate-a");
    const applied = await transition(conversation.id, { from: ["claimed"], to: "released", claimedBy: "associate-b" });
    expect(applied).toBe(false);
  });

  it("applies when claimedBy matches the ownership guard", async () => {
    const conversation = makeConversation("claimed", "associate-a");
    const applied = await transition(conversation.id, { from: ["claimed"], to: "released", claimedBy: "associate-a" });
    expect(applied).toBe(true);
  });

  it("sets additional fields via `set`", async () => {
    const conversation = makeConversation("in-progress");
    await transition(conversation.id, {
      from: ["in-progress"],
      to: "claimed",
      set: { claimedBy: "associate-a", claimedAt: new Date().toISOString() },
    });
    const result = inMemoryConversations.get(conversation.id);
    expect(result?.claimedBy).toBe("associate-a");
  });

  it("returns false for a nonexistent conversation", async () => {
    const applied = await transition(crypto.randomUUID(), { from: ["in-progress"], to: "claimed" });
    expect(applied).toBe(false);
  });
});
