import { agency, carriers, licensedStates } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { LineSelector } from "@/components/marketing/LineSelector";
import { CarrierStrip } from "@/components/marketing/CarrierStrip";
import { CollectorCarAuthority } from "@/components/marketing/CollectorCarAuthority";
import { TeamGrid } from "@/components/marketing/TeamGrid";
import { ReviewsLinkOut } from "@/components/marketing/ReviewsLinkOut";
import { AiQuoteCta } from "@/components/marketing/AiQuoteCta";
import { HomeChatLauncher } from "@/components/marketing/HomeChatLauncher";

const trustStats = [
  { value: agency.yearsInBusinessClaim, label: "of collector-car expertise" },
  { value: `${licensedStates.length}`, label: "states licensed to write business" },
  { value: `${carriers.length}+`, label: "A+ rated carrier partners" },
] as const;

export default function Home() {
  return (
    <>
      <Section background="brand" className="py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-accent-300">
              Independent Insurance Agency · {agency.address.city}, {agency.address.state}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Protect Your Passion</h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">
              Local, independent insurance advice for your home, auto, business, and the things you love most —
              backed by a flagship collector vehicle program with {agency.yearsInBusinessClaim} of experience.
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-brand-800">
                Talk to an Agent
              </Button>
            </div>
          </div>
          <HomeChatLauncher />
        </div>
      </Section>

      <Section background="surface" className="py-10">
        <div className="grid gap-6 text-center sm:grid-cols-3">
          {trustStats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-3xl font-semibold text-brand-900">{stat.value}</p>
              <p className="mt-1 text-sm text-brand-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">
            Coverage for What Matters Most
          </h2>
          <p className="mt-3 text-lg text-brand-700">
            From general liability to your favorite classic car, we&apos;ll help you find the right fit.
          </p>
        </div>
        <LineSelector />
      </Section>

      <Section background="surface">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Backed by A+ Rated Carriers
          </p>
        </div>
        <CarrierStrip />
      </Section>

      <Section>
        <CollectorCarAuthority />
      </Section>

      <Section background="surface">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">
            A Local Team You Can Trust
          </h2>
          <p className="mt-3 text-lg text-brand-700">
            We&apos;re proud members of the {agency.address.region} community, serving families and businesses
            across {agency.address.state} and beyond.
          </p>
        </div>
        <TeamGrid />
      </Section>

      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 sm:text-4xl">What Clients Say</h2>
          <div className="mt-6">
            <ReviewsLinkOut />
          </div>
        </div>
      </Section>

      <AiQuoteCta />
    </>
  );
}
