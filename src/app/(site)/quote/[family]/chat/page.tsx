import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { Section } from "@/components/ui/Section";
import { ChatWidget } from "@/components/scripted-chat/ChatWidget";

type PageParams = { params: Promise<{ family: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { family: slug } = await params;
  const family = getQuoteFormFamily(slug);
  if (!family) return {};
  return { title: `${family.label} Quick Quote Chat`, description: family.description };
}

/**
 * Only families with a scripted flow built get a chat entry point — no
 * fake "coming soon" state (see docs/backlog.md). Anything else, including
 * a bad slug, sends the visitor straight to the real static form.
 */
export default async function QuoteChatPage({ params }: PageParams) {
  const { family: slug } = await params;
  const family = getQuoteFormFamily(slug);
  const flow = family ? getScriptedFlow(slug) : undefined;
  if (!family || !flow) {
    redirect(`/quote/${slug}`);
  }

  return (
    <Section background="brand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{family.label} — Quick Quote Chat</h1>
        <p className="mt-4 text-lg text-brand-100">
          Answer a few quick questions and a licensed agent will follow up. Prefer to fill out a form instead?{" "}
          <a href={`/quote/${slug}`} className="underline">
            Use the standard form
          </a>
          .
        </p>
        <div className="mt-8">
          <ChatWidget familySlug={slug} />
        </div>
      </div>
    </Section>
  );
}
