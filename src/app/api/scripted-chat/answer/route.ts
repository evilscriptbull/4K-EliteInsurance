import { NextResponse } from "next/server";
import { z } from "zod";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { answerStep, findStep } from "@/lib/scripted-chat/engine";
import { toClientStep } from "@/lib/scripted-chat/serialize";
import { getConversation, mergeAnswer, markStaffPinged } from "@/lib/conversations/store";
import { transition } from "@/lib/conversations/lifecycle";
import { finalizeConversation } from "@/lib/conversations/finalize";
import { appendMessage } from "@/lib/conversations/messages";
import { notifyScriptedChatFirstAnswer } from "@/lib/notifications/leadNotify";

// finalizeConversation (called below on the "complete" branch) schedules
// an after() that runs generateAgentBrief + notifyAgentBrief -- needs more
// than Vercel's default 10s to finish once the response has gone out.
export const maxDuration = 60;

/**
 * Fires the staff SMS the first time any answer for this conversation is
 * successfully persisted -- markStaffPinged's atomic guard (store.ts) makes
 * this safe to call from both the "next" and "complete" branches below
 * without double-pinging.
 */
async function pingStaffOnFirstAnswer(
  conversationId: string,
  familySlug: string,
  answers: Record<string, unknown>,
): Promise<void> {
  const pinged = await markStaffPinged(conversationId);
  if (!pinged) return;
  const firstName = typeof answers.firstName === "string" ? answers.firstName : undefined;
  await notifyScriptedChatFirstAnswer({ familySlug, conversationId, firstName });
}

const answerSchema = z.object({
  conversationId: z.string().min(1),
  stepId: z.string().min(1),
  // Optional: a skipped optional step sends no `answer` at all —
  // JSON.stringify drops `undefined` values entirely, so the key is
  // genuinely absent from the request body, not present as null.
  answer: z.unknown().optional(),
  // The human-readable label the widget actually showed the customer for
  // this answer (a select/boolean option's label, or "(skipped)") — used
  // for the persisted transcript instead of the raw stored value, so a
  // resumed conversation (GET /state) shows "Full coverage", not "full", and
  // "(skipped)", not the literal string "undefined". Falls back to
  // String(answer) if omitted, so older/other callers still work.
  answerLabel: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId, stepId, answer, answerLabel } = parsed.data;

  const conversation = await getConversation(conversationId);
  if (!conversation) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  if (conversation.status !== "in-progress") {
    // Claimed, completed, or abandoned — the script isn't driving this
    // conversation anymore. Once live takeover ships, "claimed" is the
    // normal way this happens (an associate joined); for now it just means
    // the flow already ended.
    return NextResponse.json({ ok: true, status: conversation.status }, { status: 200 });
  }

  const flow = getScriptedFlow(conversation.familySlug);
  if (!flow) {
    return NextResponse.json({ ok: false, error: "no-flow-for-family" }, { status: 500 });
  }

  // Never trust the client's own idea of where it is in the flow — a
  // mismatch means a skipped/replayed step (or a stale tab), so hand back
  // the real current step instead of acting on the wrong one.
  if (conversation.state.currentStepId && conversation.state.currentStepId !== stepId) {
    return NextResponse.json({
      ok: true,
      status: "stale-step",
      step: toClientStep(findStep(flow, conversation.state.currentStepId)),
    });
  }

  const result = answerStep(flow, stepId, answer, conversation.state.collectedFields);

  if (result.status === "invalid") {
    return NextResponse.json({ ok: true, status: "invalid", step: toClientStep(result.step), errors: result.errors });
  }

  // The transcript lives in conversation_messages, not in the
  // conversation's jsonb blob (see src/lib/conversations/messages.ts) —
  // appended as its own row per message, sequentially so ordering by
  // createdAt is reliable.
  await appendMessage(conversationId, { role: "user", content: answerLabel ?? String(answer) });

  if (result.status === "next") {
    // Atomic merge, guarded by status = "in-progress" — if this returns
    // false, the conversation was claimed or ended between our read above
    // and now. Don't append a phantom next-question message in that case;
    // just report the real current status and let the widget follow the
    // control event instead.
    const merged = await mergeAnswer(conversationId, { currentStepId: result.step.id, newFields: result.answers });
    if (!merged) {
      const current = await getConversation(conversationId);
      return NextResponse.json({ ok: true, status: current?.status ?? conversation.status });
    }
    await pingStaffOnFirstAnswer(conversationId, conversation.familySlug, result.answers);
    await appendMessage(conversationId, { role: "assistant", content: result.step.prompt });
    return NextResponse.json({ ok: true, status: "next", step: toClientStep(result.step) });
  }

  // result.status === "complete"
  try {
    // Same guard as the "next" branch: persist the final answer atomically
    // before transitioning, and bail out to the real current status if a
    // claim raced us between the earlier read and now.
    const merged = await mergeAnswer(conversationId, { currentStepId: null, newFields: result.answers });
    if (!merged) {
      const current = await getConversation(conversationId);
      return NextResponse.json({ ok: true, status: current?.status ?? conversation.status });
    }
    await pingStaffOnFirstAnswer(conversationId, conversation.familySlug, result.answers);

    const closingMessageContent = "Thanks — we've got everything we need. An agent will follow up shortly.";
    await appendMessage(conversationId, { role: "assistant", content: closingMessageContent });

    const transitioned = await transition(conversationId, { from: ["in-progress"], to: "completed-unclaimed" });
    if (!transitioned) {
      const current = await getConversation(conversationId);
      return NextResponse.json({ ok: true, status: current?.status ?? "in-progress" });
    }

    const lead = await finalizeConversation(conversationId, "completed-unclaimed");

    return NextResponse.json({
      ok: true,
      status: "complete",
      leadId: lead?.id,
      line: lead?.line,
      leadScoreTier: lead?.leadScoreTier,
      channel: lead?.channel,
      closingMessage: closingMessageContent,
    });
  } catch (error) {
    // A mapper/schema mismatch here (e.g. a skipped-step edge case reaching
    // "complete" with incomplete answers) must never surface as a raw 500 —
    // the user's answer was already persisted above; fail into the same
    // handled shape the widget already renders gracefully.
    console.error(`[scripted-chat/answer] finalize failed for conversation ${conversationId}`, error);
    return NextResponse.json({
      ok: true,
      status: "invalid",
      step: toClientStep(findStep(flow, stepId)),
      errors: ["Something went wrong finishing your quote — please try again or contact us directly."],
    });
  }
}
