import { describe, it, expect, vi, beforeEach } from "vitest";

const sendGAEventMock = vi.fn();
vi.mock("@next/third-parties/google", () => ({ sendGAEvent: sendGAEventMock }));

const {
  trackLeadCreatedFromResponse,
  trackChatStarted,
  trackChatStepAnswered,
  trackChatTakenOver,
} = await import("@/lib/analytics/track");

beforeEach(() => {
  sendGAEventMock.mockReset();
});

describe("trackLeadCreatedFromResponse", () => {
  it("passes line and leadScoreTier through", () => {
    trackLeadCreatedFromResponse({ line: "auto", leadScoreTier: "same-day" });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "lead_created", { line: "auto", leadScoreTier: "same-day" });
  });

  it("includes channel when the response carries one", () => {
    trackLeadCreatedFromResponse({ line: "business", leadScoreTier: "immediate", channel: "chat-live" });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "lead_created", {
      line: "business",
      leadScoreTier: "immediate",
      channel: "chat-live",
    });
  });

  it("ignores a non-string channel", () => {
    trackLeadCreatedFromResponse({ line: "auto", leadScoreTier: "nurture", channel: 5 });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "lead_created", { line: "auto", leadScoreTier: "nurture" });
  });

  it("fires nothing when line or leadScoreTier is missing (e.g. a handoff with no Lead)", () => {
    trackLeadCreatedFromResponse(undefined);
    trackLeadCreatedFromResponse({});
    trackLeadCreatedFromResponse({ line: "auto" });
    trackLeadCreatedFromResponse({ type: "handoff", reason: "released" });
    expect(sendGAEventMock).not.toHaveBeenCalled();
  });
});

describe("chat events", () => {
  it("chat_started carries only the family", () => {
    trackChatStarted({ family: "auto" });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "chat_started", { family: "auto" });
  });

  it("chat_step_answered carries family, stepId, and turnIndex", () => {
    trackChatStepAnswered({ family: "business", stepId: "phone", turnIndex: 3 });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "chat_step_answered", {
      family: "business",
      stepId: "phone",
      turnIndex: 3,
    });
  });

  it("chat_taken_over carries only the family", () => {
    trackChatTakenOver({ family: "home" });
    expect(sendGAEventMock).toHaveBeenCalledWith("event", "chat_taken_over", { family: "home" });
  });
});
