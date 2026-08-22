import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { LineLandingPage } from "@/components/marketing/LineLandingPage";
import { CollectorCarAuthority } from "@/components/marketing/CollectorCarAuthority";
import { Section } from "@/components/ui/Section";

const page = landingPages.find((entry) => entry.slug === "/collector-car-insurance")!;

export const metadata: Metadata = {
  title: `Collector Car Insurance in ${agency.address.city}, ${agency.address.state}`,
  description:
    "Agreed value coverage for classics, muscle cars, hot rods, and exotics — our flagship specialty program with over 25 years of experience.",
};

export default function CollectorCarInsurancePage() {
  return (
    <LineLandingPage
      insuranceLine={page.insuranceLine}
      heading="Collector Car Insurance"
      intro="Our flagship program was built on a passion for muscle cars, hot rods, and exotics. Agreed value coverage means you're protected for what your vehicle is really worth — with the freedom to enjoy it any time of year."
      relatedSlugs={page.relatedSlugs}
      whyUs="We're not a generic auto policy stretched to fit — this program was purpose-built for people who cherish collector vehicles. From agreed value appraisals to seasonal-use and storage considerations, we understand what makes these vehicles different, and we underwrite them that way."
    >
      <Section>
        <CollectorCarAuthority cta={false} />
      </Section>
    </LineLandingPage>
  );
}
