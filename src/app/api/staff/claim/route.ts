import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { claimConversation } from "@/lib/conversations/store";

const claimSchema = z.object({
  conversationId: z.string().min(1),
});

/** Same bearer-token verification pattern as /api/staff/complete-setup. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "missing bearer token" }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });
  }

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

  const claimed = await claimConversation(parsed.data.conversationId, data.user.id);
  return NextResponse.json({ ok: true, claimed });
}
