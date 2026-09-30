import { NextResponse } from "next/server";
import { listIdleInProgress } from "@/lib/conversations/store";
import { transition } from "@/lib/conversations/lifecycle";
import { finalizeConversation } from "@/lib/conversations/finalize";

/**
 * Invoked by Vercel Cron (see vercel.json) every 15 minutes. Not cacheable
 * (it mutates on every call and its result depends on wall-clock time), so
 * this opts out of Route Handler GET caching explicitly rather than relying
 * on the default -- this project has no Cache Components config to conflict
 * with `force-dynamic` (confirmed via next.config.ts).
 */
export const dynamic = "force-dynamic";

const IDLE_THRESHOLD_MS = 20 * 60 * 1000;

/**
 * No Supabase session exists for a cron invocation, so this can't reuse
 * verifyStaffRequest -- Vercel Cron sends a static bearer secret instead
 * (set as CRON_SECRET in both .env.local and the Vercel project's env vars;
 * Vercel injects it into the Authorization header automatically for its own
 * scheduled invocations of this route).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const idle = await listIdleInProgress(IDLE_THRESHOLD_MS);

  let abandoned = 0;
  for (const conversation of idle) {
    const transitioned = await transition(conversation.id, { from: ["in-progress"], to: "abandoned" });
    if (!transitioned) continue; // raced with a claim/answer since listIdleInProgress read it
    await finalizeConversation(conversation.id, "abandoned");
    abandoned++;
  }

  return NextResponse.json({ ok: true, swept: idle.length, abandoned });
}
