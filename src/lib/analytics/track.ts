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

export function trackLeadCreated(params: {
  line: InsuranceLine;
  leadScoreTier: Lead["leadScoreTier"];
  channel?: Lead["channel"];
}): void {
  sendGAEvent("event", "lead_created", params);
}

/**
 * Convenience wrapper for the 6 quote forms and the chat widget: takes the
 * raw success response / control payload (typed loosely since it crosses a
 * fetch or Realtime boundary) and safely extracts line/leadScoreTier (and
 * channel, when present) before tracking — avoids repeating the same cast
 * everywhere a Lead gets created.
 */
export function trackLeadCreatedFromResponse(data: Record<string, unknown> | undefined): void {
  if (!data || typeof data.line !== "string" || typeof data.leadScoreTier !== "string") return;
  trackLeadCreated({
    line: data.line as InsuranceLine,
    leadScoreTier: data.leadScoreTier as Lead["leadScoreTier"],
    ...(typeof data.channel === "string" ? { channel: data.channel as Lead["channel"] } : {}),
  });
}

/*
 * Quick Quote Chat events (Phase 6.1). `family` is the quote-form family
 * slug (auto, business, ...). Deliberately no conversation id: that UUID is
 * the capability token gating the conversation's Realtime channel, so it
 * must never be handed to a third-party tool.
 */

export function trackChatStarted(params: { family: string }): void {
  sendGAEvent("event", "chat_started", params);
}

export function trackChatStepAnswered(params: { family: string; stepId: string; turnIndex: number }): void {
  sendGAEvent("event", "chat_step_answered", params);
}

export function trackChatTakenOver(params: { family: string }): void {
  sendGAEvent("event", "chat_taken_over", params);
}

export function trackContactSubmitted(): void {
  sendGAEvent("event", "contact_submitted", {});
}

export function trackClaimSubmitted(): void {
  sendGAEvent("event", "claim_submitted", {});
}
