import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { RelatedLines } from "@/components/marketing/RelatedLines";
import { agency, priorityLines, type InsuranceLine } from "@/lib/config/agency";
import { resolveQuoteFormFamily } from "@/lib/config/quote-forms";

interface SecondaryCta {
  label: string;
  href: string;
}

/**
 * Shared body for all 12 MVP line landing pages. Each page.tsx supplies
 * real, line-specific content (heading/intro/coveragePoints/whyUs) — this
 * component only owns the section shape, not the copy, so 12 pages don't
 * duplicate the same layout markup.
 */
export function LineLandingPage({
  insuranceLine,
  heading,
  intro,
  coveragePoints,
  whyUs,
  relatedSlugs,
  secondaryCta,
  children,
}: {
  insuranceLine: InsuranceLine;
  heading: string;
  intro: string;
  coveragePoints?: string[];
  whyUs?: ReactNode;
  relatedSlugs: string[];
  secondaryCta?: SecondaryCta;
  /** Escape hatch for a bespoke section in place of the generic "What's Covered" list (e.g. CollectorCarAuthority). */
  children?: ReactNode;
}) {
  const quoteFamily = resolveQuoteFormFamily(insuranceLine);
  const quoteHref = `/quote/${quoteFamily.slug}`;
  const isPriority = priorityLines.includes(insuranceLine);

  return (
    <>
      <Section background="brand">
        <div className="max-w-2xl">
          {isPriority && (
            <span className="mb-3 block text-sm font-semibold uppercase tracking-wide text-accent-300">
              Top-Performing Line
            </span>
          )}
          <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{heading}</h1>
          <p className="mt-4 text-lg text-brand-100">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={quoteHref} size="lg">
              Get {quoteFamily.shortLabel} Quote
            </Button>
            {secondaryCta && (
              <Button
                href={secondaryCta.href}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-brand-800"
              >
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </div>
      </Section>

      {children}

      {coveragePoints && (
        <Section>
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">What&apos;s Covered</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {coveragePoints.map((point) => (
              <li key={point} className="flex gap-3 rounded-lg border border-border bg-surface p-4 text-brand-800">
                <span aria-hidden="true" className="text-accent-600">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {whyUs && (
        <Section background="surface">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">Why {agency.legalName}?</h2>
          <div className="mt-4 max-w-3xl text-lg text-brand-700">{whyUs}</div>
        </Section>
      )}

      <Section>
        <h2 className="font-serif text-2xl font-semibold text-brand-900 sm:text-3xl">Related Coverage</h2>
        <div className="mt-6">
          <RelatedLines slugs={relatedSlugs} />
        </div>
      </Section>

      <CTABanner
        heading={`Ready to talk about ${quoteFamily.shortLabel.toLowerCase()} coverage?`}
        body="Get a quote in minutes, or reach out and a licensed agent will walk you through your options."
        ctaLabel="Start Your Quote"
        ctaHref={quoteHref}
      />
    </>
  );
}
