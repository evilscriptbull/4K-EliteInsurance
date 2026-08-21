import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/group-life-insurance")!;

export const metadata: Metadata = {
  title: `Group Life Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "Life coverage for your employees, as part of a competitive benefits package.",
};

export default function GroupLifeInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Group Life Insurance"
      intro="Group life insurance gives your employees a meaningful benefit at a fraction of the cost of individual policies — a real differentiator when you're competing for talent."
      coveragePoints={[
        "Basic group term life coverage for employees",
        "Supplemental and voluntary life options",
        "Accidental death & dismemberment (AD&D) riders",
        "Guaranteed-issue coverage up to plan limits for most employees",
        "Portability options for employees who leave",
      ]}
      whyUs="We like to ask the hard questions with each business to help build a benefits package that actually helps you retain people — not just check a box. Group life is often one of the most affordable ways to do that."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
