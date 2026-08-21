import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/commercial-property-insurance")!;

export const metadata: Metadata = {
  title: `Commercial Property Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "Protect your building, inventory, and equipment from fire, storm damage, theft, and vandalism.",
};

export default function CommercialPropertyInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Commercial Property Insurance"
      intro="Commercial property insurance protects the building, inventory, and equipment your business depends on — from fire and storm damage to theft and vandalism."
      coveragePoints={[
        "Owned or leased buildings",
        "Business personal property: inventory, furniture, equipment",
        "Business income and extra expense after a covered loss",
        "Signage and outdoor property",
        "Equipment breakdown coverage",
        "Named-perils or all-risk (open perils) options",
      ]}
      whyUs="We'll review your actual replacement cost, not just an outdated number carried over from a prior policy, so you're not underinsured the day you need coverage most."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
