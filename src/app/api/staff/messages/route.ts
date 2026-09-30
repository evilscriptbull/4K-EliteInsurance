import { NextResponse } from "next/server";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { listMessages } from "@/lib/conversations/messages";

/**
 * Lets LiveChatPanel re-sync its transcript after a Realtime reconnect
 * (Broadcast has no replay, so anything sent while disconnected is
 * otherwise gone). Any active associate can call this for any conversation
 * id, not just one they claimed -- same trust boundary the dashboard
 * already relies on (its `conversations`/`conversation_messages` RLS
 * policies are `FOR SELECT TO authenticated USING (true)`; every logged-in
 * associate can already see every live conversation's messages there), so
 * this doesn't re-check claimed-by-caller the way /api/staff/message does.
 */
export async function GET(request: Request) {
  const auth = await verifyStaffRequest(request);
  if ("error" in auth) return auth.error;

  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "missing conversationId" }, { status: 400 });
  }

  const messages = await listMessages(conversationId);
  return NextResponse.json({ ok: true, messages });
}
