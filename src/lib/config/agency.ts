/**
 * Elite-specific business data, kept isolated from app/AI logic so this file
 * is the only thing that needs to change to retarget the platform at a
 * different independent agency (see productization thesis in the handoff doc).
 */

export const agency = {
  legalName: "Elite Insurance Group",
  dba: "Elite Insurance Group",
  // Site copy says "over 25 years" of collector-vehicle program experience
  // (not necessarily agency founding year) — confirm exact founding year
  // during audit rather than inferring one.
  yearsInBusinessClaim: "over 25 years",
  primaryDomain: "eliteinsuranceknoxville.com",
  // eliteinsurancegroup.org is an alias domain on the same Squarespace
  // account (confirmed via canonical tags during the Phase 0 crawl) — not a
  // separate site. Decide its DNS/redirect treatment post-rebuild.
  aliasDomains: ["eliteinsurancegroup.org"],
  phone: "+18656875140",
  phoneDisplay: "(865) 687-5140",
  email: "service@eliteinsgroup.org",
  hours: "Mon–Fri 9am–5pm, closed Sat/Sun",
  address: {
    street: "113 Legacy View Way",
    city: "Knoxville",
    state: "TN",
    zip: "37918",
    region: "East Tennessee",
  },
  social: {
    facebook: "https://www.facebook.com/EliteInsuranceKnoxville/",
    instagram: "https://www.instagram.com/eliteinsuranceknoxville/",
    linkedin: "https://www.linkedin.com/company/elite-insurance-group-knoxville/",
    twitter: "https://twitter.com/chazgoodin",
    trustedChoiceProfile: "https://www.trustedchoice.com/agency-profile/1397862/elite-insurance-group/",
  },
  /**
   * Third-party businesses referenced/partnered with on the current site —
   * NOT Elite properties. classicautoappraisal.com is a legally separate
   * business (different owner, phone, address; built on Hostinger, not
   * Squarespace) that lists Elite as a reciprocal partner. Treat as an
   * external integration for the collector-car vertical, not a migration
   * target.
   */
  partners: {
    collectorAppraisals: "https://classicautoappraisal.com",
  },
} as const;

/**
 * States Elite is licensed to write business in. TN is home state / primary
 * market; the rest are secondary. This list drives which state-specific
 * compliance disclaimers are required (see lib/compliance/states.ts) and,
 * longer-term, which state landing pages/paid campaigns make sense.
 *
 * Source: confirmed directly by agency owner, 2026-08-21. NOT scraped from
 * the current site, which only markets to Knoxville/East TN — that framing
 * undersells the real footprint and should be corrected in the new IA.
 */
export const licensedStates = [
  "TN", // primary / home state
  "KY",
  "NC",
  "SC",
  "VA",
  "WV",
  "FL",
  "GA",
  "AL",
  "OH",
  "IN",
  "TX",
  "AZ",
  "MT",
] as const;

export type LicensedState = (typeof licensedStates)[number];

export const insuranceLines = [
  "auto",
  "home",
  "business",
  "life",
  "collector-vehicle",
  "boat",
  "motorcycle",
  "rv",
  "rental-property",
  "commercial-auto",
  "contractors",
  "workers-comp",
  "cyber",
  "other",
] as const;

export type InsuranceLine = (typeof insuranceLines)[number];

export const team = [
  { name: "Terry Isbel", role: "Founder" },
  { name: "Chaz Goodin", role: "Agent / Owner — Sales and Marketing" },
  { name: "Stephanie Goodin", role: "Agent / Owner — HR and Finance" },
  { name: "Lori Wright", role: "Licensed Agent" },
  { name: "Taylor Kitts", role: "Account Manager" },
  { name: "Angela Mattson", role: "Account Manager" },
  { name: "Kyle Arnold", role: "Licensed Agent" },
  { name: "Wesley Mutta", role: "Licensed Agent" },
  { name: "Kelly Partin", role: "Licensed Agent" },
] as const;

/**
 * CRM/AMS this platform's lead adapter targets. Confirmed by agency owner,
 * 2026-08-21. See lib/compliance and future lib/integrations/crm for the
 * EZLynx-specific adapter.
 */
export const crm = {
  system: "EZLynx",
} as const;
