import { NextResponse } from "next/server";

const TOKEN_URL = "https://authentication.logmeininc.com/oauth/token";

/**
 * One-time setup helper, not used at runtime by the app itself. GoTo
 * redirects here after the owner logs in and approves access (started at
 * .../oauth/start/route.ts). Exchanges the authorization code for tokens
 * and returns the refresh token to copy into GOTO_REFRESH_TOKEN in
 * .env.local.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "No authorization code in callback." }, { status: 400 });
  }

  const clientId = process.env.GOTO_CLIENT_ID;
  const clientSecret = process.env.GOTO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Set GOTO_CLIENT_ID and GOTO_CLIENT_SECRET in .env.local before completing the OAuth flow." },
      { status: 400 },
    );
  }

  const redirectUri = new URL("/api/integrations/goto/oauth/callback", request.url).toString();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Token exchange failed: ${response.status}`, details: await response.text() },
      { status: 502 },
    );
  }

  const data = await response.json();

  return NextResponse.json({
    message: "Copy refresh_token into GOTO_REFRESH_TOKEN in .env.local, then restart the dev server.",
    refresh_token: data.refresh_token,
    access_token_expires_in_seconds: data.expires_in,
  });
}
