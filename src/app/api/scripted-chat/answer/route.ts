import { NextResponse } from "next/server";
import { z } from "zod";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { answerStep, findStep } from "@/lib/scripted-chat/engine";
import { toClientStep } from "@/lib/scripted-chat/serialize";
import { scriptedAnswersToLead } from "@/lib/scripted-chat/finalize";
import { getConversation, updateConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { addLead } from "@/lib/leads/store";
import { notifyScriptedChatLead } from "@/lib/notifications/leadNotify";
import { sendQuoteConfirmationEmail } from "@/lib/notifications/emailNotify";
import { pushLeadToEZLynx } from "@/lib/integrations/ezlynx/adapter";

const answerSchema = z.object({
  conversationId: z.string().min(1),
  stepId: z.string().min(1),
  // Optional: a skipped optional step sends no `answer` at all —
  // JSON.stringify drops `undefined` values entirely, so the key is
  // genuinely absent from the request body, not present as null.
  answer: z.unknown().optional(),
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

  const { conversationId, stepId, answer } = parsed.data;

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
  const now = new Date().toISOString();

  if (result.status === "invalid") {
    return NextResponse.json({ ok: true, status: "invalid", step: toClientStep(result.step), errors: result.errors });
  }

  // The transcript lives in conversation_messages now, not
  // conversation.state.messages (see src/lib/conversations/messages.ts) —
  // appended as its own row per message, sequentially so ordering by
  // createdAt is reliable, instead of overwriting the whole jsonb blob.
  await appendMessage(conversationId, { role: "user", content: String(answer) });

  if (result.status === "next") {
    await appendMessage(conversationId, { role: "assistant", content: result.step.prompt });
    await updateConversation(conversationId, {
      state: {
        ...conversation.state,
        updatedAt: now,
        currentStepId: result.step.id,
        collectedFields: result.answers,
      },
    });
    return NextResponse.json({ ok: true, status: "next", step: toClientStep(result.step) });
  }

  // result.status === "complete"
  try {
    const lead = scriptedAnswersToLead(conversation.familySlug, result.answers, conversation.state.source ?? {});
    await addLead(lead);

    const closingMessageContent = "Thanks — we've got everything we need. An agent will follow up shortly.";
    await appendMessage(conversationId, { role: "assistant", content: closingMessageContent });

    await updateConversation(conversationId, {
      state: {
        ...conversation.state,
        updatedAt: now,
        status: "completed-unclaimed",
        collectedFields: result.answers,
        leadId: lead.id,
      },
      status: "completed-unclaimed",
      leadId: lead.id,
    });

    await Promise.all([notifyScriptedChatLead(lead), sendQuoteConfirmationEmail(lead), pushLeadToEZLynx(lead)]);

    return NextResponse.json({
      ok: true,
      status: "complete",
      leadId: lead.id,
      leadScoreTier: lead.leadScoreTier,
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
