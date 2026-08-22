import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/builders-risk-insurance")!;

export const metadata: Metadata = {
  title: `Builder's Risk Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "Coverage for new construction and renovation projects — protecting the structure, materials, and equipment while work is underway.",
};

export default function BuildersRiskInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Builder's Risk Insurance"
      intro="New construction and major renovation projects carry risk a standard property policy doesn't cover. Builder's risk protects the structure, materials, and equipment while the work is underway."
      coveragePoints={[
        "Materials and supplies on-site or in transit",
        "The structure under construction or renovation",
        "Theft and vandalism during the build",
        "Fire, wind, and weather damage mid-project",
        "Soft costs (permits, architect/engineering fees) on some policies",
        "Coverage tailored to project length and value",
      ]}
      whyUs="Builder's risk policies need to match your project's timeline and value — miss that and you can end up underinsured right as a claim happens. We build the policy around your actual project schedule, not a generic term."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
