import type { Metadata } from "next";
import Link from "next/link";
import { agency } from "@/lib/config/agency";
import { quoteFormFamilies } from "@/lib/config/quote-forms";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: `Request an insurance quote from ${agency.legalName} in minutes.`,
};

export default function QuotePage() {
  return (
    <Section background="brand">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Get a Quote in Minutes</h1>
        <p className="mt-4 text-lg text-brand-100">
          Choose the type of coverage you&apos;re looking for and we&apos;ll connect you with a licensed agent.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        {quoteFormFamilies.map((family) => (
          <Link key={family.slug} href={`/quote/${family.slug}`}>
            <Card className="h-full bg-background text-foreground transition-shadow hover:shadow-md">
              <h2 className="font-serif text-lg font-semibold text-brand-900">{family.label}</h2>
              <p className="mt-2 text-sm text-brand-700">{family.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
