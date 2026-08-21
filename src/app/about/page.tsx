import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";
import { TeamGrid } from "@/components/marketing/TeamGrid";

export const metadata: Metadata = {
  title: `About Us — ${agency.address.city} Insurance Agency & Commercial Business Experts`,
  description: `Learn about ${agency.legalName}, an independent insurance agency serving ${agency.address.region} for ${agency.yearsInBusinessClaim}.`,
};

export default function AboutPage() {
  return (
    <>
      <Section background="brand">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">What We&apos;re All About</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-100">
          {agency.legalName} offers the very best selection of tailored insurance products to protect what
          matters most.
        </p>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-lg text-brand-800">
          <p>
            We are proud members of the {agency.address.region} community, are members of the Farragut Chamber
            of Commerce, and support local organizations like Hope Resource Center, Fellowship of Christian
            Athletes, Grace Christian Academy, and Fountain City Church.
          </p>
          <p>
            We&apos;ve been serving our clients for {agency.yearsInBusinessClaim} with a specialized program
            designed for those who cherish collector cars, offering peace of mind for your prized possessions.
          </p>
          <p>
            Our main mission is to serve the community with integrity and wisdom, honoring and exalting the
            Lord Jesus Christ.
          </p>
          <p>
            We are committed to walking alongside you through life&apos;s challenges, offering support,
            compassion, and guidance as we bear one another&apos;s burdens. We strive to make a lasting impact
            in the lives of those we serve. Let us be your trusted partner in safeguarding your future and
            protecting your passions.
          </p>
        </div>
      </Section>

      <Section background="surface">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">Meet the Team</h2>
        </div>
        <TeamGrid />
      </Section>
    </>
  );
}
