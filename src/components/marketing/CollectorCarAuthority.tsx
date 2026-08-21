import type { ReactNode } from "react";
import { agency } from "@/lib/config/agency";
import { Button } from "@/components/ui/Button";

const defaultHeading = "Our Flagship: Collector Car Insurance";
const defaultBody =
  "Founded on a passion for muscle cars, hot rods, and exotics, our collector vehicle program offers agreed value coverage that reflects what your vehicle is really worth. Coverage comes loaded with extras like Nationwide Roadside Assistance, spare parts coverage, trip interruption, and pet coverage — built by people who understand what these vehicles mean to their owners.";

/**
 * Homepage-specific by default, but built to accept overrides so the future
 * /collector-car-insurance landing page can reuse this block instead of
 * duplicating the copy.
 */
export function CollectorCarAuthority({
  heading = defaultHeading,
  body = defaultBody,
  cta = true,
}: {
  heading?: string;
  body?: ReactNode;
  cta?: boolean;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <span className="text-sm font-semibold uppercase tracking-wide text-accent-600">
          {agency.yearsInBusinessClaim} of collector-car expertise
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">{heading}</h2>
        <p className="mt-4 text-lg text-brand-700">{body}</p>
        {cta && (
          <div className="mt-6">
            <Button href="/quote" variant="secondary">
              Get a Collector Car Quote
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-border bg-surface p-8">
        <ul className="space-y-3 text-brand-800">
          <li>Agreed value coverage</li>
          <li>Nationwide Roadside Assistance</li>
          <li>Spare parts coverage</li>
          <li>Trip interruption coverage</li>
          <li>Pet coverage</li>
        </ul>
      </div>
    </div>
  );
}
