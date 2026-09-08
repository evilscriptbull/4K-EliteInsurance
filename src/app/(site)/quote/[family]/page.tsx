import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuoteFormFamily, quoteFormFamilies } from "@/lib/config/quote-forms";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CollectorVehicleQuoteForm } from "@/components/forms/quote/CollectorVehicleQuoteForm";
import { AutoQuoteForm } from "@/components/forms/quote/AutoQuoteForm";
import { HomeQuoteForm } from "@/components/forms/quote/HomeQuoteForm";
import { RecreationalQuoteForm } from "@/components/forms/quote/RecreationalQuoteForm";
import { LifeQuoteForm } from "@/components/forms/quote/LifeQuoteForm";
import { BusinessQuoteForm } from "@/components/forms/quote/BusinessQuoteForm";

const formComponents: Record<string, ComponentType> = {
  "collector-vehicle": CollectorVehicleQuoteForm,
  auto: AutoQuoteForm,
  home: HomeQuoteForm,
  recreational: RecreationalQuoteForm,
  life: LifeQuoteForm,
  business: BusinessQuoteForm,
};

type PageParams = { params: Promise<{ family: string }> };

export function generateStaticParams() {
  return quoteFormFamilies.map((family) => ({ family: family.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { family: slug } = await params;
  const family = getQuoteFormFamily(slug);
  if (!family) return {};
  return { title: `${family.label} Quote`, description: family.description };
}

export default async function QuoteFamilyPage({ params }: PageParams) {
  const { family: slug } = await params;
  const family = getQuoteFormFamily(slug);
  if (!family) notFound();

  const FormComponent = formComponents[slug];
  const hasChat = Boolean(getScriptedFlow(slug));

  return (
    <Section background="brand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{family.label} Quote</h1>
        <p className="mt-4 text-lg text-brand-100">{family.description}</p>
        {hasChat && (
          <div className="mt-6">
            <Button href={`/quote/${slug}/chat`} variant="secondary">
              Try the Quick Quote Chat instead
            </Button>
          </div>
        )}
        <Card className="mt-8 bg-background text-foreground">
          <FormComponent />
        </Card>
      </div>
    </Section>
  );
}
