import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";

const page = landingPages.find((entry) => entry.slug === "/workers-comp-insurance")!;

export const metadata: Metadata = {
  title: `Workers' Compensation Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "Required coverage for employee injuries — medical care, lost wages, and employer's liability protection, done right without the guesswork.",
};

export default function WorkersCompInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Workers' Compensation Insurance"
      intro="Workers' compensation covers medical care and lost wages for employees injured on the job — and in most states, it's required by law once you have employees."
      coveragePoints={[
        "Medical expenses for work-related injuries and illnesses",
        "Partial wage replacement during recovery",
        "Disability benefits",
        "Death benefits for dependents",
        "Employer's liability protection",
        "Return-to-work and claims support",
      ]}
      whyUs="Workers' comp requirements and experience-mod calculations vary by state, and we write across 14 states. We'll help you understand your mod, avoid common classification mistakes, and keep your premium tied to your actual risk."
      relatedSlugs={page.relatedSlugs}
    />
  );
}
