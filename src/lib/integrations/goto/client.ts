/**
 * GoTo Connect Messaging V2 API client. Endpoints/flow verified against
 * GoTo's own developer docs (developer.goto.com), not guessed:
 * - Auth: Personal Access Token exchange, `grant_type=personal_access_token`,
 *   token endpoint https://authentication.logmeininc.com/oauth/token. The
 *   PAT itself is long-lived (generated once at myaccount.goto.com >
 *   Developer Tools, on an OAuth client with "Personal Access Token"
 *   enabled at developer.logmeininc.com/clients); only the access token it's
 *   exchanged for expires (1 hour), so it's refetched and cached here.
 * - Send: POST https://api.goto.com/messaging/v1/messages
 */

const TOKEN_URL = "https://authentication.logmeininc.com/oauth/token";
const SMS_URL = "https://api.goto.com/messaging/v1/messages";

interface GotoConfig {
  clientId: string;
  clientSecret: string;
  personalAccessToken: string;
  ownerPhoneNumber: string;
}

function getConfig(): GotoConfig | null {
  const clientId = process.env.GOTO_CLIENT_ID;
  const clientSecret = process.env.GOTO_CLIENT_SECRET;
  const personalAccessToken = process.env.GOTO_PERSONAL_ACCESS_TOKEN;
  const ownerPhoneNumber = process.env.GOTO_OWNER_PHONE_NUMBER;

  if (!clientId || !clientSecret || !personalAccessToken || !ownerPhoneNumber) {
    return null;
  }
  return { clientId, clientSecret, personalAccessToken, ownerPhoneNumber };
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
      Accept: "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ grant_type: "personal_access_token", pat: config.personalAccessToken }),
  });

  if (!response.ok) {
    throw new Error(`GoTo PAT exchange failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
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
      "[goto] SMS not sent — GoTo credentials not configured (GOTO_CLIENT_ID/GOTO_CLIENT_SECRET/GOTO_PERSONAL_ACCESS_TOKEN/GOTO_OWNER_PHONE_NUMBER).",
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
