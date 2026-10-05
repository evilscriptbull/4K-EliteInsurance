import { NextResponse } from "next/server";
import { z } from "zod";
import type { Lead } from "@/lib/schemas/lead";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { releaseConversation } from "@/lib/conversations/store";
import { finalizeConversation } from "@/lib/conversations/finalize";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation, handoffLeadFields } from "@/lib/conversations/broadcast";

// finalizeConversation (called below) schedules an after() that runs
// generateAgentBrief + notifyAgentBrief -- needs more than Vercel's
// default 10s to finish once the response has gone out.
export const maxDuration = 60;

const releaseSchema = z.object({
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

  const parsed = releaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId } = parsed.data;
  const released = await releaseConversation(conversationId, auth.userId);

  if (released) {
    // Confirmed decision: releasing does not resume the scripted
    // questionnaire — the customer's live chat simply ends here. The
    // conversation heads to Needs Follow-up (status "released", see
    // lib/conversations/store.ts) rather than back to the Live Queue —
    // there's nothing left to resume, so a fresh claim wouldn't do anything.
    const message = await appendMessage(conversationId, {
      role: "system",
      content: "This associate has stepped away — we'll follow up with you shortly.",
    });
    await broadcastToConversation(conversationId, { name: "message", payload: message });

    // Finalized before the handoff is broadcast so the customer's widget
    // can fire GA's lead_created from the event (Phase 6.1). A finalize
    // failure must never block the handoff itself -- it just means no
    // lead fields ride along.
    let lead: Lead | null = null;
    try {
      lead = await finalizeConversation(conversationId, "released");
    } catch (error) {
      console.error(`[staff/release] finalize failed for conversation ${conversationId}`, error);
    }
    await broadcastToConversation(conversationId, {
      name: "control",
      payload: { type: "handoff", reason: "released", ...handoffLeadFields(lead) },
    });
  }

  return NextResponse.json({ ok: true, released });
}
