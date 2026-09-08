import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key — elevated
 * privileges, never expose to the browser. Used by API routes that need to
 * verify a caller's session token or bypass RLS (see
 * /api/staff/complete-setup), and by scripts/seed-associates.mjs.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
