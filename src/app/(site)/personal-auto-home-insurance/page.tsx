import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/personal-auto-home-insurance")!;

export const metadata: Metadata = {
  title: `Personal Auto & Home Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "From family sedans to rollbacks, and the homes that go with them — A+ rated carriers, closed coverage gaps, and real confidence on the road.",
};

export default function PersonalAutoHomeInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Personal Auto & Home Insurance"
      intro="From family sedans to rollbacks, we have a policy that fits your needs. We work with a wide range of A+ rated auto and home insurers to close coverage gaps and bring protection and affordability together."
      coveragePoints={[
        "Personal auto — family vehicles and daily drivers",
        "Homeowners and rental dwelling",
        "Non-emergency medical transportation, Lyft, Uber, and Instacart drivers",
        "Bundled auto + home discounts",
        "Liability and coverage-gap review",
      ]}
      whyUs="We strive to close the coverage gaps that leave families exposed, and we'll tell you plainly where a cheaper policy is cutting corners. As an independent agency, we shop your auto and home across multiple carriers instead of selling you whatever one company offers."
      relatedSlugs={page.relatedSlugs}
      secondaryCta={{ label: "Get a Home Quote", href: "/quote/home" }}
    />
  );
}
