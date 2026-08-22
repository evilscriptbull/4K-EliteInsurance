import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/commercial-auto-insurance")!;

export const metadata: Metadata = {
  title: `Commercial Auto Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "Fleet, subs, and non-owned vehicle coverage for your business — closing the gaps a personal auto policy leaves open.",
};

export default function CommercialAutoInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Commercial Auto Insurance"
      intro="If you or your employees drive for business — deliveries, service calls, hauling equipment — a personal auto policy typically won't cover you. Commercial auto closes that gap."
      coveragePoints={[
        "Owned, leased, and financed business vehicles",
        "Hired and non-owned auto liability (employees driving their own vehicles for work)",
        "Cargo and equipment in transit",
        "Fleet coverage for multiple vehicles and drivers",
        "Physical damage: collision and comprehensive",
        "Uninsured/underinsured motorist protection",
      ]}
      whyUs="We ask the questions that actually affect your rate and your protection — how vehicles are used, who's driving, what you're hauling — instead of a one-size policy that leaves gaps at the worst time."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
