import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/commercial-umbrella-insurance")!;

export const metadata: Metadata = {
  title: `Commercial Umbrella Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "Extra liability protection above your underlying commercial policies, for when a serious claim exceeds standard limits.",
};

export default function CommercialUmbrellaInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Commercial Umbrella Insurance"
      intro="A single serious claim can exceed the limits of your general liability, auto, or employer's liability policy. Commercial umbrella adds an extra layer of protection above those underlying limits."
      coveragePoints={[
        "Extra liability limits above general liability, commercial auto, and employer's liability",
        "Broader coverage in some cases than the underlying policies alone",
        "Protection against catastrophic claims and lawsuits",
        "Coverage that follows across multiple underlying policies",
      ]}
      whyUs="One serious lawsuit can threaten everything you've built. An umbrella policy is often the most cost-effective way to add meaningful protection — we'll help you find the right limit for your actual risk, not just round up to a number that sounds safe."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
