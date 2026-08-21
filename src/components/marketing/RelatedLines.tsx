import Link from "next/link";
import { landingPages } from "@/lib/config/landing-pages";
import { Card } from "@/components/ui/Card";

/**
 * Compact cross-sell cards for a curated slug list — distinct from the
 * homepage's full 12-page LineSelector grid, which would be redundant
 * repeated on every landing page.
 */
export function RelatedLines({ slugs }: { slugs: string[] }) {
  const pages = slugs
    .map((slug) => landingPages.find((page) => page.slug === slug))
    .filter((page): page is NonNullable<typeof page> => page !== undefined);

  if (pages.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {pages.map((page) => (
        <Link key={page.slug} href={page.slug}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <h3 className="font-serif text-base font-semibold text-brand-900">{page.label}</h3>
            <p className="mt-1 text-sm text-brand-600">{page.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
