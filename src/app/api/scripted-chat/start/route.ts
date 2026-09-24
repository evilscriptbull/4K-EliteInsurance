import { NextResponse } from "next/server";
import { z } from "zod";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { getFirstStep } from "@/lib/scripted-chat/engine";
import { toClientStep } from "@/lib/scripted-chat/serialize";
import { createConversation } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import type { ConversationState } from "@/lib/schemas/conversation";

const sourceSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  landingPage: z.string().optional(),
  gclid: z.string().optional(),
});

const startSchema = z.object({
  familySlug: z.string().min(1),
  source: sourceSchema.optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const flow = getScriptedFlow(parsed.data.familySlug);
  if (!flow) {
    // No scripted flow for this family yet — the client should fall back
    // to the static form rather than treat this as a real error.
    return NextResponse.json({ ok: false, error: "no-flow-for-family" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const firstStep = getFirstStep(flow);
  const conversationId = crypto.randomUUID();

  // messages: [] — the transcript lives in conversation_messages now, not
  // this jsonb blob (see src/lib/conversations/messages.ts). Kept as an
  // empty array only so this still satisfies ConversationState's type.
  const state: ConversationState = {
    id: conversationId,
    createdAt: now,
    updatedAt: now,
    status: "in-progress",
    messages: [],
    currentStepId: firstStep.id,
    collectedFields: {},
    resumeConsent: false,
    source: parsed.data.source,
  };

  await createConversation({
    id: conversationId,
    createdAt: now,
    updatedAt: now,
    status: "in-progress",
    familySlug: flow.slug,
    claimedBy: null,
    claimedAt: null,
    leadId: null,
    state,
  });

  // Sequential, not Promise.all — both would otherwise get the same
  // millisecond timestamp and listMessages()'s createdAt ordering
  // wouldn't reliably keep the intro before the first prompt.
  await appendMessage(conversationId, { role: "assistant", content: flow.intro });
  await appendMessage(conversationId, { role: "assistant", content: firstStep.prompt });

  return NextResponse.json(
    { ok: true, conversationId, intro: flow.intro, step: toClientStep(firstStep) },
    { status: 201 },
  );
}
