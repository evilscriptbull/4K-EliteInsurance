import { NextResponse } from "next/server";

const AUTHORIZE_URL = "https://authentication.logmeininc.com/oauth/authorize";

/**
 * One-time setup helper, not used at runtime by the app itself. Visit this
 * route locally (after setting GOTO_CLIENT_ID in .env.local and
 * registering http://localhost:3000/api/integrations/goto/oauth/callback
 * as an allowed redirect URI in GoTo Developer Center) to start the OAuth
 * flow and obtain a refresh token for GOTO_REFRESH_TOKEN.
 */
export async function GET(request: Request) {
  const clientId = process.env.GOTO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Set GOTO_CLIENT_ID in .env.local before starting the OAuth flow." }, { status: 400 });
  }

  const redirectUri = new URL("/api/integrations/goto/oauth/callback", request.url).toString();
  const authorizeUrl = new URL(AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(authorizeUrl.toString());
}
