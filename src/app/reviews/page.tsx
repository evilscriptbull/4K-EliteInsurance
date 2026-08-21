import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";
import { ReviewsLinkOut } from "@/components/marketing/ReviewsLinkOut";

export const metadata: Metadata = {
  title: "Reviews",
  description: `See what clients say about ${agency.legalName}.`,
};

export default function ReviewsPage() {
  return (
    <Section background="brand" className="min-h-[60vh]">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">What Clients Say</h1>
        <p className="mt-4 text-lg text-brand-100">
          We&apos;re still building out review collection on our new site — in the meantime, see verified
          reviews on our third-party profile below.
        </p>
        <div className="mt-8">
          <ReviewsLinkOut />
        </div>
      </div>
    </Section>
  );
}
