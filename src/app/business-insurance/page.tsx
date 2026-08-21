import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/business-insurance")!;

export const metadata: Metadata = {
  title: `Business Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "A one-on-one review of your operation to find the right coverage mix — general liability, workers' comp, commercial auto, property, and more.",
};

export default function BusinessInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Business Insurance"
      intro="Our one-on-one approach helps your business find a policy that actually fits your industry — and we'll walk through where your current coverage may be leaving exposures unaddressed. Take us up on a free top-to-bottom review."
      coveragePoints={[
        "General liability",
        "Workers' compensation",
        "Commercial auto and fleet",
        "Commercial property",
        "Builder's risk for new construction and renovation",
        "Commercial umbrella",
        "Equipment coverage",
        "Bonds",
      ]}
      whyUs="We work with multiple A+ rated commercial carriers, so we're not stuck fitting your business into one company's box. We look at your operation from the ground up — payroll, vehicles, subs, equipment, and locations — and build coverage around how you actually run your business."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
