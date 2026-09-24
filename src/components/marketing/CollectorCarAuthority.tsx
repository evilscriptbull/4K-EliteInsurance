import type { ReactNode } from "react";
import { agency } from "@/lib/config/agency";
import { Button } from "@/components/ui/Button";
import { CogIcon, PawIcon, RouteIcon, TagIcon, TowTruckIcon } from "@/components/icons/features";
import type { IconProps } from "@/components/icons/Icon";

const defaultHeading = "Our Flagship: Collector Car Insurance";
const defaultBody =
  "Founded on a passion for muscle cars, hot rods, and exotics, our collector vehicle program offers agreed value coverage that reflects what your vehicle is really worth. Coverage comes loaded with extras like Nationwide Roadside Assistance, spare parts coverage, trip interruption, and pet coverage — built by people who understand what these vehicles mean to their owners.";

const perks: { icon: (props: IconProps) => ReactNode; label: string }[] = [
  { icon: TagIcon, label: "Agreed value coverage" },
  { icon: TowTruckIcon, label: "Nationwide Roadside Assistance" },
  { icon: CogIcon, label: "Spare parts coverage" },
  { icon: RouteIcon, label: "Trip interruption coverage" },
  { icon: PawIcon, label: "Pet coverage" },
];

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
          {perks.map(({ icon: PerkIcon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <PerkIcon className="size-5 shrink-0 text-accent-600" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
