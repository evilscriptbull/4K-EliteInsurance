import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { getFirstStep } from "@/lib/scripted-chat/engine";
import { toClientStep } from "@/lib/scripted-chat/serialize";
import { createConversation, countRecentConversationsByIpHash } from "@/lib/conversations/store";
import { appendMessage } from "@/lib/conversations/messages";
import { isHoneypotTripped } from "@/lib/forms/honeypot";
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

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_CONVERSATIONS = 10;

/** Null if RATE_LIMIT_SALT isn't configured -- rate limiting then just no-ops (see .env.example). */
function hashIp(ip: string): string | null {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

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

  const firstStep = getFirstStep(flow);

  if (isHoneypotTripped(body as Record<string, unknown>)) {
    // A bot filled the invisible field — fake a normal-looking success
    // without persisting a real conversation, same posture as the 3 static
    // form routes (lib/forms/honeypot.ts). Any /answer call against this id
    // will 404, but a scraping bot doesn't check.
    return NextResponse.json(
      { ok: true, conversationId: crypto.randomUUID(), intro: flow.intro, step: toClientStep(firstStep) },
      { status: 201 },
    );
  }

  // x-forwarded-for's first entry is the original client, added by the
  // first proxy it passed through (Vercel's edge network here) — later
  // entries are proxies further down the chain. Absent entirely for a
  // direct connection (e.g. local dev), in which case rate limiting simply
  // doesn't apply to that request rather than blocking it.
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = clientIp ? hashIp(clientIp) : null;
  if (ipHash) {
    const recentCount = await countRecentConversationsByIpHash(ipHash, RATE_LIMIT_WINDOW_MS);
    if (recentCount >= RATE_LIMIT_MAX_CONVERSATIONS) {
      return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
    }
  }

  const now = new Date().toISOString();
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
    ipHash,
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
