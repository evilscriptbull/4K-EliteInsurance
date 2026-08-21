import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ClaimsForm } from "@/components/forms/ClaimsForm";

export const metadata: Metadata = {
  title: "File a Claim",
  description: `File an insurance claim with ${agency.legalName}.`,
};

export default function ClaimsPage() {
  return (
    <Section background="brand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">File a Claim</h1>
        <p className="mt-4 text-lg text-brand-100">
          Let us know what happened and our team will follow up as soon as possible. If this is a
          life-threatening emergency, call 911 first.
        </p>
        <Card className="mt-8 bg-background text-foreground">
          <ClaimsForm />
        </Card>
      </div>
    </Section>
  );
}
