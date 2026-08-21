import type { Lead } from "@/lib/schemas/lead";

/**
 * EZLynx (Applied Systems) push adapter.
 *
 * HONEST SCAFFOLD, NOT A LIVE CONNECTION. EZLynx's API is partner/enterprise
 * -gated (OAuth2, confirmed via EZLynx's published API solutions page) —
 * it is not self-serve, and as of this writing Elite only has an EZLynx
 * portal login, not API credentials. Building real request logic against
 * guessed endpoints would violate the guardrail against fabricating things
 * that look real but aren't (see lib/compliance/guardrails.ts).
 *
 * What to request from EZLynx/Applied Systems before this can go live is
 * documented in docs/open-questions.md. Once real credentials and endpoint
 * docs exist, replace the body of pushLeadToEZLynx with the actual HTTP
 * call(s) — the call site (src/app/api/quote/route.ts) and the result type
 * below are already the intended shape.
 */

export type EZLynxPushResult =
  | { status: "not-connected" }
  | { status: "success"; ezlynxId: string }
  | { status: "error"; message: string };

function getConfig(): { clientId: string; clientSecret: string; agencyId: string } | null {
  const clientId = process.env.EZLYNX_CLIENT_ID;
  const clientSecret = process.env.EZLYNX_CLIENT_SECRET;
  const agencyId = process.env.EZLYNX_AGENCY_ID;

  if (!clientId || !clientSecret || !agencyId) {
    return null;
  }
  return { clientId, clientSecret, agencyId };
}

export async function pushLeadToEZLynx(lead: Lead): Promise<EZLynxPushResult> {
  const config = getConfig();
  if (!config) {
    console.log(
      `[ezlynx] Lead ${lead.id} not pushed — EZLynx API credentials not provisioned yet (EZLYNX_CLIENT_ID/EZLYNX_CLIENT_SECRET/EZLYNX_AGENCY_ID). See docs/open-questions.md for what to request from EZLynx/Applied Systems.`,
    );
    return { status: "not-connected" };
  }

  // Real implementation goes here once EZLynx API access is granted:
  // OAuth2 client-credentials (or whatever flow EZLynx's docs specify) to
  // get a token, then create an Applicant/Prospect and Opportunity from
  // `lead`. Left unimplemented deliberately — do not fill this in with
  // guessed endpoint shapes.
  console.warn(`[ezlynx] EZLYNX_* env vars are set but pushLeadToEZLynx() has no real implementation yet.`);
  return { status: "error", message: "EZLynx push not implemented" };
}
