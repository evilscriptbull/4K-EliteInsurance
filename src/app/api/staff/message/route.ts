import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { getConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation } from "@/lib/conversations/broadcast";
import { getAssociate } from "@/lib/associates/store";

const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const auth = await verifyStaffRequest(request);
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId, content } = parsed.data;

  const conversation = await getConversation(conversationId);
  if (!conversation) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  // Never trust the UI hiding the input — re-check server-side that this
  // caller is actually the one who claimed it, and that it's still live.
  if (conversation.claimedBy !== auth.userId || conversation.status !== "claimed") {
    return NextResponse.json({ ok: false, error: "not-claimed-by-you" }, { status: 409 });
  }

  const associate = await getAssociate(auth.userId);
  const message = await appendMessage(conversationId, {
    role: "associate",
    content,
    authorAssociateId: auth.userId,
  });
  await broadcastToConversation(conversationId, {
    name: "message",
    payload: { ...message, authorName: associate?.name },
  });

  return NextResponse.json({ ok: true });
}
