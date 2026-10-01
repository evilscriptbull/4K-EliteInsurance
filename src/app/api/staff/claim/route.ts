import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { claimConversation, getConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation } from "@/lib/conversations/broadcast";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { conversationToPartialLead } from "@/lib/scripted-chat/finalize";
import { buildFallbackBrief } from "@/lib/ai/agentBrief/fallback";
import type { AgentBriefContent } from "@/lib/schemas/agentBrief";

const claimSchema = z.object({
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

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId } = parsed.data;
  const claimed = await claimConversation(conversationId, auth.userId);

  let instantBrief: AgentBriefContent | null = null;

  if (claimed) {
    const associateName = auth.associate.name;
    const message = await appendMessage(conversationId, {
      role: "system",
      content: `${associateName} has joined the chat.`,
    });
    await broadcastToConversation(conversationId, { name: "message", payload: message });
    await broadcastToConversation(conversationId, {
      name: "control",
      payload: { type: "takeover", associateName },
    });

    // Best-effort instant snapshot from whatever was collected so far --
    // deterministic only, no model call, and never persisted (the real
    // brief is generated and saved at finalize, see conversations/finalize.ts).
    // Gives the associate something to read in the second before the
    // dashboard refreshes into the live-chat view.
    const conversation = await getConversation(conversationId);
    const flow = conversation ? getScriptedFlow(conversation.familySlug) : null;
    if (conversation && flow) {
      const partialLead = conversationToPartialLead(
        flow,
        conversation.familySlug,
        conversation.state.collectedFields,
        conversation.state.currentStepId,
        conversation.state.source ?? {},
        "chat-live",
      );
      if (partialLead) {
        instantBrief = buildFallbackBrief(partialLead, conversation);
      }
    }
  }

  return NextResponse.json({ ok: true, claimed, instantBrief });
}
