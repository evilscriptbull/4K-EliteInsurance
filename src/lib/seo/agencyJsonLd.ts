import { agency, licensedStates } from "@/lib/config/agency";
import { siteUrl } from "@/lib/config/site";

/**
 * schema.org InsuranceAgency for the homepage. Every value comes from the
 * `agency` config -- deliberately no ratings, review counts, price range, or
 * opening hours (agency.hours is free text; structuring it would be
 * inventing data), so nothing here can drift from or overstate the truth.
 */
export function buildAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: agency.legalName,
    url: siteUrl(),
    telephone: agency.phone,
    email: agency.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: agency.address.street,
      addressLocality: agency.address.city,
      addressRegion: agency.address.state,
      postalCode: agency.address.zip,
      addressCountry: "US",
    },
    areaServed: [...licensedStates],
    sameAs: Object.values(agency.social),
  };
}

/** JSON for a <script type="application/ld+json">, with `<` escaped so a value can never close the tag (Next's JSON-LD guide). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
