import type { ComponentProps } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

type LinkHref = ComponentProps<typeof Link>["href"];

export function CTABanner({
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  id,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: LinkHref;
  id?: string;
}) {
  return (
    <Section background="brand" id={id}>
      <div className="flex flex-col items-center gap-6 text-center">
        {eyebrow && (
          <span className="text-sm font-semibold uppercase tracking-wide text-accent-300">{eyebrow}</span>
        )}
        <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{heading}</h2>
        <p className="max-w-2xl text-lg text-brand-100">{body}</p>
        <Button href={ctaHref} size="lg">
          {ctaLabel}
        </Button>
      </div>
    </Section>
  );
}
