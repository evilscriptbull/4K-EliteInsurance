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
}

export const landingPages: LandingPageEntry[] = [
  {
    slug: "/collector-car-insurance",
    label: "Collector Car Insurance",
    description: "Classics, muscle cars, and exotics — agreed value coverage. Our flagship specialty.",
    insuranceLine: "collector-vehicle",
  },
  {
    slug: "/business-insurance",
    label: "Business Insurance",
    description: "One-on-one review of your operation to find the right coverage mix.",
    insuranceLine: "business",
  },
  {
    slug: "/general-liability-insurance",
    label: "General Liability",
    description: "Protection against third-party bodily injury and property damage claims.",
    insuranceLine: "general-liability",
  },
  {
    slug: "/workers-comp-insurance",
    label: "Workers' Compensation",
    description: "Required coverage for employee injuries — done right, without the guesswork.",
    insuranceLine: "workers-comp",
  },
  {
    slug: "/commercial-auto-insurance",
    label: "Commercial Auto",
    description: "Fleet, subs, and non-owned vehicle coverage for your business.",
    insuranceLine: "commercial-auto",
  },
  {
    slug: "/commercial-property-insurance",
    label: "Commercial Property",
    description: "Protect your building, inventory, and equipment.",
    insuranceLine: "commercial-property",
  },
  {
    slug: "/builders-risk-insurance",
    label: "Builder's Risk",
    description: "Coverage for new construction and renovation projects.",
    insuranceLine: "builders-risk",
  },
  {
    slug: "/commercial-umbrella-insurance",
    label: "Commercial Umbrella",
    description: "Extra liability protection above your underlying commercial policies.",
    insuranceLine: "commercial-umbrella",
  },
  {
    slug: "/contractors-insurance",
    label: "Contractors Insurance",
    description: "GL, workers' comp, commercial auto, and builder's risk — bundled for your trade.",
    insuranceLine: "contractors",
  },
  {
    slug: "/short-term-rental-insurance",
    label: "Short-Term Rental & Vacation Home",
    description: "Airbnb, cabins, and lake homes — including builder's risk for renovations.",
    insuranceLine: "rental-property",
  },
  {
    slug: "/group-life-insurance",
    label: "Group Life Insurance",
    description: "Life coverage for your employees, as part of a competitive benefits package.",
    insuranceLine: "group-life",
  },
  {
    slug: "/personal-auto-home-insurance",
    label: "Personal Auto & Home",
    description: "Family sedans to rollbacks, and the homes that go with them.",
    insuranceLine: "auto",
  },
];

export const priorityLandingPages = landingPages.filter((page) => priorityLines.includes(page.insuranceLine));
