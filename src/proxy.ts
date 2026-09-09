import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed middleware.ts to proxy.ts (same mechanics, new file
 * name/export) — confirmed via node_modules/next/dist/docs before writing
 * this, since AGENTS.md warns this version differs from training data.
 *
 * Refreshes the Supabase session cookie on every request to a gated route,
 * and gates /staff/dashboard behind having one.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    // Staff auth isn't configured — let requests through rather than
    // locking everyone out of a feature that isn't set up yet.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/staff/dashboard")) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  if (user && pathname === "/staff/login") {
    return NextResponse.redirect(new URL("/staff/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/staff/dashboard/:path*", "/staff/login"],
};
