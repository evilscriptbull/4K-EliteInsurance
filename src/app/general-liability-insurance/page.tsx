import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/general-liability-insurance")!;

export const metadata: Metadata = {
  title: `General Liability Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "Protection against third-party bodily injury, property damage, and advertising injury claims — the foundation most commercial policies are built on.",
};

export default function GeneralLiabilityInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="General Liability Insurance"
      intro="General liability insurance protects your business against claims of third-party bodily injury, property damage, and advertising injury — the foundation most commercial policies are built on."
      coveragePoints={[
        "Third-party bodily injury claims",
        "Property damage caused by your business operations",
        "Products and completed operations liability",
        "Personal and advertising injury (libel, slander, copyright claims)",
        "Legal defense costs, even if a claim is later found groundless",
        "Medical payments for minor injuries on your premises",
      ]}
      whyUs="General liability is often required before you can bid a job, sign a lease, or land a contract. We make sure your limits actually match what your contracts and landlords require — not just a default number."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
