import { NextResponse } from "next/server";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { markPasswordSet } from "@/lib/associates/store";

/**
 * Called by /staff/join right after updateUser() succeeds. Records
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
  const auth = await verifyStaffRequest(request);
  if ("error" in auth) return auth.error;

  await markPasswordSet(auth.userId);
  return NextResponse.json({ ok: true });
}
