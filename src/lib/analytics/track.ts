"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { InsuranceLine } from "@/lib/config/agency";
import type { Lead } from "@/lib/schemas/lead";

/**
 * Thin, typed wrappers around GA4's sendGAEvent — centralizes event
 * names/shapes in one place instead of scattering raw sendGAEvent calls.
 * Safe to call even when GA hasn't been initialized (NEXT_PUBLIC_GA_MEASUREMENT_ID
 * unset) — sendGAEvent no-ops with a console warning rather than throwing.
 *
 * Matches the events actually implementable today per
 * docs/event-tracking-schema.md. contact_submitted and claim_submitted
 * extend that doc's original taxonomy (which only had lead_created for
 * quote-type conversions) — both are worth measuring for Ads conversion
 * tracking even though they aren't sales leads (see lib/leads/mappers.ts
 * for why contact/claims don't map into the Lead schema).
 */

export function trackLandingPageView(line: InsuranceLine): void {
  sendGAEvent("event", "landing_page_view", { line });
}

export function trackLeadCreated(params: { line: InsuranceLine; leadScoreTier: Lead["leadScoreTier"] }): void {
  sendGAEvent("event", "lead_created", params);
}

/**
 * Convenience wrapper for the 6 quote forms: takes the raw /api/quote
 * success response (typed loosely since it crosses a fetch boundary) and
 * safely extracts line/leadScoreTier before tracking — avoids repeating the
 * same cast in every quote form component.
 */
export function trackLeadCreatedFromResponse(data: Record<string, unknown> | undefined): void {
  if (!data || typeof data.line !== "string" || typeof data.leadScoreTier !== "string") return;
  trackLeadCreated({ line: data.line as InsuranceLine, leadScoreTier: data.leadScoreTier as Lead["leadScoreTier"] });
}

export function trackContactSubmitted(): void {
  sendGAEvent("event", "contact_submitted", {});
}

export function trackClaimSubmitted(): void {
  sendGAEvent("event", "claim_submitted", {});
}
