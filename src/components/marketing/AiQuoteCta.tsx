import { CTABanner } from "@/components/ui/CTABanner";

/**
 * The handoff doc calls for a prominent "2-minute AI qualification CTA" —
 * but the AI Lead Warmer itself isn't built yet (this pass only ships the
 * static /quote form flow that replaces the old Squarespace lightbox
 * forms). Copy here is deliberately about the quote flow that actually
 * exists today, not a conversational AI experience that doesn't. Swap this
 * copy out when the AI Lead Warmer ships (see docs/backlog.md).
 */
export function AiQuoteCta() {
  return (
    <CTABanner
      eyebrow="Get Covered"
      heading="Get a Quote in Minutes"
      body="Tell us a little about what you need covered and we'll connect you with a licensed agent — no long forms, no waiting on hold."
      ctaLabel="Start Your Quote"
      ctaHref="/quote"
      id="quote-cta"
    />
  );
}
