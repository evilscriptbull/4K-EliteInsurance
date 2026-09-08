import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { markPasswordSet } from "@/lib/associates/store";

/**
 * Called by /staff/set-password right after updateUser() succeeds. Records
 * completion in our own `associates` table rather than trusting Supabase's
 * email_confirmed_at/last_sign_in_at — those get set the moment an invite
 * link is merely fetched, which corporate email security scanners do
 * automatically before the real recipient ever opens the email (this is
 * exactly what happened to the first real invite sent in this project —
 * see docs/backlog.md). A scanner fetches a URL; it doesn't run this app's
 * JS and submit a password form, so this signal is trustworthy where
 * Supabase's own metadata wasn't.
 */
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

  await markPasswordSet(data.user.id);
  return NextResponse.json({ ok: true });
}
