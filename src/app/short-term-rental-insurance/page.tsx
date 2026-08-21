import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/short-term-rental-insurance")!;

export const metadata: Metadata = {
  title: `Short-Term Rental & Vacation Home Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "Coverage for Airbnb, cabins, and lake homes — including builder's risk for renovations. We work closely with your lender for a smooth closing on hard-to-place homes.",
};

export default function ShortTermRentalInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Short-Term Rental & Vacation Home Insurance"
      intro="We're the go-to place for hard-to-place homes, and we work closely with your lender to keep closing smooth. From lake homes to Airbnbs, we find coverage that brings real peace of mind."
      coveragePoints={[
        "Guaranteed replacement on roof and siding",
        "Broad liability covering short-term and long-term rentals (Airbnb)",
        "Student housing",
        "Condo and homeowner association coverage",
        "Townhomes, apartments, and flats",
        "Builder's risk for renovations",
      ]}
      whyUs="Hard-to-place doesn't mean impossible — it just means it takes an agent who knows which carriers actually want this business. We handle the lender coordination so your closing stays on schedule, and we can package your rental with your primary home and auto for real savings."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
