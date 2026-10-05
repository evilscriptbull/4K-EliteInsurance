import { NextResponse } from "next/server";
import { z } from "zod";
import type { Lead } from "@/lib/schemas/lead";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { completeConversation } from "@/lib/conversations/store";
import { finalizeConversation } from "@/lib/conversations/finalize";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation, handoffLeadFields } from "@/lib/conversations/broadcast";

// finalizeConversation (called below) schedules an after() that runs
// generateAgentBrief + notifyAgentBrief -- needs more than Vercel's
// default 10s to finish once the response has gone out.
export const maxDuration = 60;

const completeSchema = z.object({
  conversationId: z.string().min(1),
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

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId } = parsed.data;
  const completed = await completeConversation(conversationId, auth.userId);

  if (completed) {
    const message = await appendMessage(conversationId, {
      role: "system",
      content: "This conversation has been completed. Thanks for chatting with us!",
    });
    await broadcastToConversation(conversationId, { name: "message", payload: message });

    // Finalized before the handoff is broadcast so the customer's widget
    // can fire GA's lead_created from the event (Phase 6.1). A finalize
    // failure must never block the handoff itself -- it just means no
    // lead fields ride along.
    let lead: Lead | null = null;
    try {
      lead = await finalizeConversation(conversationId, "completed-claimed");
    } catch (error) {
      console.error(`[staff/complete] finalize failed for conversation ${conversationId}`, error);
    }
    await broadcastToConversation(conversationId, {
      name: "control",
      payload: { type: "handoff", reason: "completed", ...handoffLeadFields(lead) },
    });
  }

  return NextResponse.json({ ok: true, completed });
}
