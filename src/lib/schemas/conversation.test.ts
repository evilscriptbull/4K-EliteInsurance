import { describe, it, expect } from "vitest";
import { conversationStateSchema } from "@/lib/schemas/conversation";

const base = {
  id: "c1",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
  status: "in-progress",
  collectedFields: {},
};

describe("conversationStateSchema", () => {
  it("parses a current-shape blob that has no messages key", () => {
    const parsed = conversationStateSchema.parse(base);
    expect(parsed).not.toHaveProperty("messages");
  });

  it("still parses a historical row whose data.messages predates the conversation_messages table, and ignores it", () => {
    const legacy = {
      ...base,
      messages: [
        { role: "assistant", content: "Hi!", timestamp: "2026-09-01T00:00:00.000Z" },
        { role: "user", content: "Personal", timestamp: "2026-09-01T00:00:05.000Z" },
      ],
    };
    const parsed = conversationStateSchema.parse(legacy);
    expect(parsed.id).toBe("c1");
    expect(parsed).not.toHaveProperty("messages");
  });
});
