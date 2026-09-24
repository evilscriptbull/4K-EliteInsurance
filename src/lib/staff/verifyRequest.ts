import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { getAssociate, type Associate } from "@/lib/associates/store";

/**
 * Shared bearer-token verification for staff API routes (claim, release,
 * complete, complete-setup, message). A valid Supabase session alone isn't
 * enough — it only proves someone once had (or still has) an account, not
 * that they're a current, active associate. Requiring the associate row
 * here, not just at the dashboard page, closes the gap for a deactivated
 * associate or any session obtained outside the invite flow.
 */
export async function verifyStaffRequest(
  request: Request,
): Promise<{ userId: string; associate: Associate } | { error: NextResponse }> {
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

  const associate = await getAssociate(data.user.id);
  if (!associate || !associate.active) {
    return { error: NextResponse.json({ ok: false, error: "not-an-associate" }, { status: 403 }) };
  }

  return { userId: data.user.id, associate };
}
