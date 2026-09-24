import { NextResponse } from "next/server";
import { getConversation } from "@/lib/conversations/store";
import { listMessages } from "@/lib/conversations/messages";

/**
 * Lets the customer's ChatWidget hydrate the transcript on mount/refresh —
 * Broadcast has no replay/history, so a page reload mid-live-chat would
 * otherwise lose everything sent while the tab wasn't connected. Same
 * no-auth, conversationId-as-capability posture as /answer and /message.
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
  return NextResponse.json({ ok: true, messages });
}
