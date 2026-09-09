import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";

/**
 * Shared bearer-token verification for staff API routes (claim, release,
 * complete, complete-setup) — extracted once three routes needed the exact
 * same check. Returns the caller's user id, or a ready-to-return
 * NextResponse if verification failed.
 */
export async function verifyStaffRequest(request: Request): Promise<{ userId: string } | { error: NextResponse }> {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!accessToken) {
    return { error: NextResponse.json({ ok: false, error: "missing bearer token" }, { status: 401 }) };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 }) };
  }

  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) {
    return { error: NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 }) };
  }

  return { userId: data.user.id };
}
