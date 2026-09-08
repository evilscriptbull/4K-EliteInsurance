import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client for staff auth (invite/password flows now,
 * live-chat Realtime + dashboard session next — see docs/backlog.md).
 * Returns null if the project isn't configured yet, so pages can show an
 * honest "not set up" state instead of crashing — same fallback-safe
 * contract as every other integration in this app.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
