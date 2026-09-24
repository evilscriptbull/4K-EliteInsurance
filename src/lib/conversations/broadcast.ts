import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { StoredMessage } from "@/lib/conversations/messages";

/**
 * Live-takeover control signals, broadcast alongside chat messages so the
 * client never has to string-match copy to know when to switch UI modes.
 */
export type ConversationControlEvent =
  | { type: "takeover"; associateName: string }
  | { type: "handoff"; reason: "released" | "completed" };

/**
 * Delivers a message or control signal to everyone currently connected to
 * this conversation's channel (the customer's ChatWidget, an associate's
 * dashboard live-chat panel) — via Realtime Broadcast, not postgres_changes.
 *
 * Broadcast, not a database-authorized subscription, is the point: knowing
 * the conversation's (unguessable) UUID is what gates access to this
 * topic, the same capability model /api/scripted-chat/answer already uses
 * for a customer with no auth session — never a public SELECT policy on
 * message content, which would let anyone holding the public anon key read
 * every customer's transcript, not just the one they're viewing.
 *
 * Best-effort: a failure here means the message won't appear live, but it
 * was already persisted (see appendMessage in the callers) before this
 * runs, so it's still visible on the next reload/hydrate — same
 * fallback-safe posture as every other notification in this app.
 */
export async function broadcastToConversation(
  conversationId: string,
  event:
    | { name: "message"; payload: StoredMessage & { authorName?: string } }
    | { name: "control"; payload: ConversationControlEvent },
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const channel = admin.channel(`conversation:${conversationId}`);
  try {
    await channel.httpSend(event.name, event.payload);
  } catch (error) {
    console.error(`[broadcast] conversation:${conversationId} ${event.name} failed`, error);
  }
}
