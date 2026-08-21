import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { disclaimers } from "@/lib/compliance/disclaimers";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${agency.legalName} by phone, text, email, or the form below.`,
};

export default function ContactPage() {
  return (
    <Section background="brand">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Let&apos;s Get Started</h1>
          <p className="mt-4 text-lg text-brand-100">
            Let us know how we can help by filling out this form, or use the info below to call, text, or
            email us. We&apos;re happy to fulfill service requests or provide a full comprehensive insurance
            review at your convenience.
          </p>
          <div className="mt-6 space-y-1 text-brand-100">
            <p>
              <a href={`tel:${agency.phone}`} className="font-semibold text-white hover:underline">
                {agency.phoneDisplay}
              </a>{" "}
              — call or text
            </p>
            <p>
              <a href={`mailto:${agency.email}`} className="font-semibold text-white hover:underline">
                {agency.email}
              </a>
            </p>
            <p>
              {agency.address.street}, {agency.address.city}, {agency.address.state} {agency.address.zip}
            </p>
            <p>{agency.hours}</p>
          </div>
        </div>

        <Card className="bg-background text-foreground">
          <ContactForm />
          <p className="mt-4 text-xs text-brand-600">{disclaimers.noBindingViaForm}</p>
        </Card>
      </div>
    </Section>
  );
}
