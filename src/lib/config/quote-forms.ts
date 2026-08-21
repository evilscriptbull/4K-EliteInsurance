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
  description: string;
  applicableLines: InsuranceLine[];
}

export const quoteFormFamilies: QuoteFormFamily[] = [
  {
    slug: "collector-vehicle",
    label: "Collector Vehicle",
    description: "Classics, muscle cars, hot rods, and exotics.",
    applicableLines: ["collector-vehicle"],
  },
  {
    slug: "auto",
    label: "Auto (Personal or Commercial)",
    description: "Family vehicles, delivery drivers, and commercial fleets.",
    applicableLines: ["auto", "commercial-auto"],
  },
  {
    slug: "home",
    label: "Homeowners & Rental Dwelling",
    description: "Primary homes, rentals, and short-term/vacation properties.",
    applicableLines: ["home", "rental-property"],
  },
  {
    slug: "recreational",
    label: "Boat, Motorcycle, RV & ATV",
    description: "Coverage for the toys, wherever you keep them.",
    applicableLines: ["boat", "motorcycle", "rv", "other"],
  },
  {
    slug: "life",
    label: "Life Insurance",
    description: "Term, whole life, and final-expense coverage.",
    applicableLines: ["life", "group-life"],
  },
  {
    slug: "business",
    label: "Business & Workers' Comp",
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
