import type { InsuranceLine } from "@/lib/config/agency";
import { priorityLines } from "@/lib/config/agency";

/**
 * The 12 MVP line/vertical landing pages, in the priority order set by
 * docs/sitemap-mvp.md (reordered 2026-08-21 around confirmed top-performing
 * lines). None of these routes exist yet — this list drives the homepage's
 * line selector, which links to them via ExternalLink (not next/link) since
 * typed routes would fail the build against pages that don't exist yet.
 */
export interface LandingPageEntry {
  slug: string;
  label: string;
  description: string;
  insuranceLine: InsuranceLine;
  /** Curated cross-sell pairings (slugs), not auto-derived — see docs/backlog.md build notes. */
  relatedSlugs: string[];
}

export const landingPages: LandingPageEntry[] = [
  {
    slug: "/collector-car-insurance",
    label: "Collector Car Insurance",
    description: "Classics, muscle cars, and exotics — agreed value coverage. Our flagship specialty.",
    insuranceLine: "collector-vehicle",
    relatedSlugs: ["/personal-auto-home-insurance", "/commercial-umbrella-insurance", "/short-term-rental-insurance"],
  },
  {
    slug: "/business-insurance",
    label: "Business Insurance",
    description: "One-on-one review of your operation to find the right coverage mix.",
    insuranceLine: "business",
    relatedSlugs: ["/general-liability-insurance", "/workers-comp-insurance", "/commercial-property-insurance"],
  },
  {
    slug: "/general-liability-insurance",
    label: "General Liability",
    description: "Protection against third-party bodily injury and property damage claims.",
    insuranceLine: "general-liability",
    relatedSlugs: ["/workers-comp-insurance", "/commercial-umbrella-insurance", "/contractors-insurance"],
  },
  {
    slug: "/workers-comp-insurance",
    label: "Workers' Compensation",
    description: "Required coverage for employee injuries — done right, without the guesswork.",
    insuranceLine: "workers-comp",
    relatedSlugs: ["/general-liability-insurance", "/commercial-auto-insurance", "/contractors-insurance"],
  },
  {
    slug: "/commercial-auto-insurance",
    label: "Commercial Auto",
    description: "Fleet, subs, and non-owned vehicle coverage for your business.",
    insuranceLine: "commercial-auto",
    relatedSlugs: ["/general-liability-insurance", "/workers-comp-insurance", "/commercial-umbrella-insurance"],
  },
  {
    slug: "/commercial-property-insurance",
    label: "Commercial Property",
    description: "Protect your building, inventory, and equipment.",
    insuranceLine: "commercial-property",
    relatedSlugs: ["/builders-risk-insurance", "/commercial-umbrella-insurance", "/business-insurance"],
  },
  {
    slug: "/builders-risk-insurance",
    label: "Builder's Risk",
    description: "Coverage for new construction and renovation projects.",
    insuranceLine: "builders-risk",
    relatedSlugs: ["/commercial-property-insurance", "/contractors-insurance", "/general-liability-insurance"],
  },
  {
    slug: "/commercial-umbrella-insurance",
    label: "Commercial Umbrella",
    description: "Extra liability protection above your underlying commercial policies.",
    insuranceLine: "commercial-umbrella",
    relatedSlugs: ["/general-liability-insurance", "/commercial-auto-insurance", "/commercial-property-insurance"],
  },
  {
    slug: "/contractors-insurance",
    label: "Contractors Insurance",
    description: "GL, workers' comp, commercial auto, and builder's risk — bundled for your trade.",
    insuranceLine: "contractors",
    relatedSlugs: ["/general-liability-insurance", "/workers-comp-insurance", "/commercial-auto-insurance", "/builders-risk-insurance"],
  },
  {
    slug: "/short-term-rental-insurance",
    label: "Short-Term Rental & Vacation Home",
    description: "Airbnb, cabins, and lake homes — including builder's risk for renovations.",
    insuranceLine: "rental-property",
    relatedSlugs: ["/builders-risk-insurance", "/personal-auto-home-insurance", "/commercial-umbrella-insurance"],
  },
  {
    slug: "/group-life-insurance",
    label: "Group Life Insurance",
    description: "Life coverage for your employees, as part of a competitive benefits package.",
    insuranceLine: "group-life",
    relatedSlugs: ["/business-insurance", "/workers-comp-insurance", "/commercial-umbrella-insurance"],
  },
  {
    slug: "/personal-auto-home-insurance",
    label: "Personal Auto & Home",
    description: "Family sedans to rollbacks, and the homes that go with them.",
    insuranceLine: "auto",
    relatedSlugs: ["/collector-car-insurance", "/short-term-rental-insurance", "/business-insurance"],
  },
];

export const priorityLandingPages = landingPages.filter((page) => priorityLines.includes(page.insuranceLine));
