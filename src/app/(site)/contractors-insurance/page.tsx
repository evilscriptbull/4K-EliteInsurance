import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/contractors-insurance")!;

export const metadata: Metadata = {
  title: `Contractors Insurance in ${agency.address.city}, ${agency.address.state}`,
  description: "General liability, workers' comp, commercial auto, and builder's risk — bundled for your trade.",
};

export default function ContractorsInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Contractors Insurance"
      intro="Contractors carry risk that spans several coverage types at once — general liability, workers' comp, commercial auto, and builder's risk. We bundle what your trade actually needs."
      coveragePoints={[
        "General liability for job-site injuries and property damage",
        "Workers' compensation for your crew",
        "Commercial auto for trucks and work vehicles",
        "Builder's risk for active construction and renovation projects",
        "Tools and equipment coverage",
        "Certificates of insurance for GCs and permits, when you need them fast",
      ]}
      whyUs="Most contractors juggle three or four separate policies with three or four separate agents. We put it all under one roof, so your coverage stays consistent and your certificates go out fast when a GC needs one."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
