import { NextResponse } from "next/server";
import { getConversation } from "@/lib/conversations/store";
import { listMessages } from "@/lib/conversations/messages";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { findStep } from "@/lib/scripted-chat/engine";
import { toClientStep } from "@/lib/scripted-chat/serialize";

/**
 * Lets the customer's ChatWidget resume a conversation after a page
 * refresh (the widget only ever kept `conversationId` in React state before
 * this) -- given the id back from sessionStorage, returns everything needed
 * to rebuild the widget's view: which mode to resume in (`status`), the
 * current question if the script is still driving (`step`), and the full
 * transcript so far (`messages`). Supersedes the never-called
 * /api/scripted-chat/messages, which only returned the transcript. Same
 * no-auth, conversationId-as-capability posture as /answer and /message --
 * customers hold no Supabase Auth session.
 */
export async function GET(request: Request) {
  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "missing conversationId" }, { status: 400 });
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  const messages = await listMessages(conversationId);

  let step = null;
  if (conversation.status === "in-progress" && conversation.state.currentStepId) {
    const flow = getScriptedFlow(conversation.familySlug);
    if (flow) step = toClientStep(findStep(flow, conversation.state.currentStepId));
  }

  return NextResponse.json({ ok: true, status: conversation.status, step, messages });
}
