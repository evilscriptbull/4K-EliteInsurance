import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Route Handler Supabase client — reads the session
 * proxy.ts already refreshed via next/headers' cookies() (async in this
 * Next.js version). Distinct from browserClient.ts (client components) and
 * adminClient.ts (service-role, elevated privileges).
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Components can't set cookies — proxy.ts handles refresh.
      },
    },
  });
}
