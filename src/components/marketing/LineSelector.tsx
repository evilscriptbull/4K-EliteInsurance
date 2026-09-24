import Link from "next/link";
import { landingPages } from "@/lib/config/landing-pages";
import { priorityLines } from "@/lib/config/agency";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InsuranceLineIcon } from "@/components/icons/InsuranceLineIcon";

export function LineSelector() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {landingPages.map((page) => (
        <Link key={page.slug} href={page.slug}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <InsuranceLineIcon line={page.insuranceLine} className="size-10 text-brand-800 duotone-accent-200" />
            <div className="mt-4 flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-brand-900">{page.label}</h3>
              {priorityLines.includes(page.insuranceLine) && <Badge>Top Line</Badge>}
            </div>
            <p className="mt-2 text-sm text-brand-700">{page.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
