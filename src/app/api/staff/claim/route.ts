import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { claimConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { broadcastToConversation } from "@/lib/conversations/broadcast";
import { getAssociate } from "@/lib/associates/store";

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

  if (claimed) {
    const associate = await getAssociate(auth.userId);
    const associateName = associate?.name ?? "An agent";
    const message = await appendMessage(conversationId, {
      role: "system",
      content: `${associateName} has joined the chat.`,
    });
    await broadcastToConversation(conversationId, { name: "message", payload: message });
    await broadcastToConversation(conversationId, {
      name: "control",
      payload: { type: "takeover", associateName },
    });
  }

  return NextResponse.json({ ok: true, claimed });
}
