/**
 * GoTo Connect Messaging V2 API client. Endpoints/flow verified against
 * GoTo's own developer docs (developer.goto.com), not guessed:
 * - Auth: OAuth 2.0 Authorization Code flow, `messaging.v1.send` scope,
 *   token endpoint https://authentication.logmeininc.com/oauth/token
 * - Send: POST https://api.goto.com/messaging/v1/messages
 *
 * See src/app/api/integrations/goto/oauth/{start,callback}/route.ts for the
 * one-time setup flow that produces GOTO_REFRESH_TOKEN.
 */

const TOKEN_URL = "https://authentication.logmeininc.com/oauth/token";
const SMS_URL = "https://api.goto.com/messaging/v1/messages";

interface GotoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  ownerPhoneNumber: string;
}

function getConfig(): GotoConfig | null {
  const clientId = process.env.GOTO_CLIENT_ID;
  const clientSecret = process.env.GOTO_CLIENT_SECRET;
  const refreshToken = process.env.GOTO_REFRESH_TOKEN;
  const ownerPhoneNumber = process.env.GOTO_OWNER_PHONE_NUMBER;

  if (!clientId || !clientSecret || !refreshToken || !ownerPhoneNumber) {
    return null;
  }
  return { clientId, clientSecret, refreshToken, ownerPhoneNumber };
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: GotoConfig): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token;
  }

  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: config.refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`GoTo token refresh failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  // GoTo rotates refresh tokens as they near expiry. We only hold the
  // token in an env var (no persistence layer), so we can't update it
  // ourselves — surface it loudly so an operator updates GOTO_REFRESH_TOKEN
  // before the old one stops working.
  if (data.refresh_token && data.refresh_token !== config.refreshToken) {
    console.warn(
      "[goto] GoTo issued a new refresh token. Update GOTO_REFRESH_TOKEN in your env — the old one will expire soon:",
      data.refresh_token,
    );
  }

  cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedAccessToken.token;
}

export interface SendSmsResult {
  sent: boolean;
  reason?: string;
}

/**
 * Sends an SMS via GoTo Connect. Safe to call even when GoTo credentials
 * aren't configured yet — no-ops with a clear log message rather than
 * throwing, same contract as lib/analytics/track.ts.
 */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const config = getConfig();
  if (!config) {
    console.log(
      "[goto] SMS not sent — GoTo credentials not configured (GOTO_CLIENT_ID/GOTO_CLIENT_SECRET/GOTO_REFRESH_TOKEN/GOTO_OWNER_PHONE_NUMBER).",
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    const accessToken = await getAccessToken(config);
    const response = await fetch(SMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ownerPhoneNumber: config.ownerPhoneNumber,
        contactPhoneNumbers: [to],
        body,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[goto] SMS send failed: ${response.status} ${text}`);
      return { sent: false, reason: `http-${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[goto] SMS send error:", error);
    return { sent: false, reason: "exception" };
  }
}
