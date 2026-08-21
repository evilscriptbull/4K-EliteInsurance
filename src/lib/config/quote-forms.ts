import type { InsuranceLine } from "@/lib/config/agency";

/**
 * The 6 quote-request form families, replacing the old site's 6 Squarespace
 * lightbox forms (see docs/site-audit/content-inventory.md for the exact
 * field lists these are built from). Drives /quote's family picker and
 * /quote/[family]'s form selection.
 */
export interface QuoteFormFamily {
  slug: string;
  label: string;
  /** Short form for mid-sentence use (button/CTA text) — `label` reads awkwardly there for some families. */
  shortLabel: string;
  description: string;
  applicableLines: InsuranceLine[];
}

export const quoteFormFamilies: QuoteFormFamily[] = [
  {
    slug: "collector-vehicle",
    label: "Collector Vehicle",
    shortLabel: "Collector Vehicle",
    description: "Classics, muscle cars, hot rods, and exotics.",
    applicableLines: ["collector-vehicle"],
  },
  {
    slug: "auto",
    label: "Auto (Personal or Commercial)",
    shortLabel: "Auto",
    description: "Family vehicles, delivery drivers, and commercial fleets.",
    applicableLines: ["auto", "commercial-auto"],
  },
  {
    slug: "home",
    label: "Homeowners & Rental Dwelling",
    shortLabel: "Home",
    description: "Primary homes, rentals, and short-term/vacation properties.",
    applicableLines: ["home", "rental-property"],
  },
  {
    slug: "recreational",
    label: "Boat, Motorcycle, RV & ATV",
    shortLabel: "Recreational Vehicle",
    description: "Coverage for the toys, wherever you keep them.",
    applicableLines: ["boat", "motorcycle", "rv", "other"],
  },
  {
    slug: "life",
    label: "Life Insurance",
    shortLabel: "Life Insurance",
    description: "Term, whole life, and final-expense coverage.",
    applicableLines: ["life", "group-life"],
  },
  {
    slug: "business",
    label: "Business & Workers' Comp",
    shortLabel: "Business",
    description: "General liability, workers' comp, property, and more.",
    applicableLines: [
      "business",
      "general-liability",
      "workers-comp",
      "commercial-property",
      "builders-risk",
      "commercial-auto",
      "commercial-umbrella",
      "contractors",
      "cyber",
      "other",
    ],
  },
];

export function getQuoteFormFamily(slug: string): QuoteFormFamily | undefined {
  return quoteFormFamilies.find((family) => family.slug === slug);
}

/**
 * Resolves an InsuranceLine to its quote-family slug, for landing pages to
 * link directly into the right form. First-match wins, and family order
 * above is deliberate: e.g. "auto" comes before "business" so
 * commercial-auto resolves to the auto family (which has vehicle fields),
 * not the business family (which doesn't).
 */
export function resolveQuoteFormFamily(line: InsuranceLine): QuoteFormFamily {
  const family = quoteFormFamilies.find((candidate) => candidate.applicableLines.includes(line));
  if (!family) {
    throw new Error(`No quote form family covers insurance line "${line}"`);
  }
  return family;
}
