import { NextResponse } from "next/server";
import { z } from "zod";
import { getConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation } from "@/lib/conversations/broadcast";

/**
 * A customer's free-text message once an associate has claimed the
 * conversation and the script has handed off to live chat. Sibling to
 * /api/scripted-chat/answer (kept separate rather than merged into it —
 * that route's contract is specifically step/schema-shaped and has real
 * production traffic). Same no-auth, conversationId-as-capability posture:
 * customers hold no Supabase Auth session, same as /answer.
 */
const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
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

  if (conversation.status !== "claimed") {
    // Not live yet, or already ended — degrade gracefully, same contract
    // as /answer's equivalent guard, so a stale tab that hasn't processed
    // a takeover/handoff control event yet doesn't error.
    return NextResponse.json({ ok: true, status: conversation.status });
  }

  const message = await appendMessage(conversationId, { role: "user", content });
  await broadcastToConversation(conversationId, { name: "message", payload: message });

  return NextResponse.json({ ok: true });
}
