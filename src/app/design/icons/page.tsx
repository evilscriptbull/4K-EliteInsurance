import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import type { IconProps } from "@/components/icons/Icon";
import * as uiIcons from "@/components/icons/ui";
import * as coverageIcons from "@/components/icons/coverage";
import * as featureIcons from "@/components/icons/features";
import { insuranceLineIcons, InsuranceLineIcon } from "@/components/icons/InsuranceLineIcon";
import { landingPages } from "@/lib/config/landing-pages";
import { agency } from "@/lib/config/agency";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Icon Library",
  robots: { index: false, follow: false },
};

const groups = [
  { title: "Interface", source: "ui", icons: uiIcons },
  { title: "Coverage", source: "coverage", icons: coverageIcons },
  { title: "Features", source: "features", icons: featureIcons },
];

/** Just the components — coverage.tsx also exports shared path data. */
function iconsIn(module: Record<string, unknown>) {
  return Object.entries(module).filter(
    (entry): entry is [string, ComponentType<IconProps>] => entry[0].endsWith("Icon") && typeof entry[1] === "function",
  );
}

const usage = `import { PhoneIcon } from "@/components/icons/ui";
import { InsuranceLineIcon } from "@/components/icons/InsuranceLineIcon";

<PhoneIcon className="size-5 text-accent-400" />
<InsuranceLineIcon line="boat" className="size-10 text-brand-800 duotone-accent-200" />`;

/**
 * Internal reference for building pages. Available locally and on Vercel
 * preview deployments (so it can be reviewed from a PR), never on the live
 * site.
 */
export default function IconLibraryPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  const example = landingPages[0];

  return (
    <main className="flex-1 bg-surface py-12 text-foreground">
      <Container className="space-y-14">
        <header className="max-w-3xl space-y-3">
          <h1 className="font-serif text-4xl font-semibold text-brand-900">Icon Library</h1>
          <p className="text-brand-700">
            Custom icons for the site, in <code className="text-sm">src/components/icons/</code>. 24px grid, 1.5
            stroke, colored by <code className="text-sm">text-*</code>, sized by{" "}
            <code className="text-sm">size-*</code>. Add a <code className="text-sm">duotone-*</code> color to fill
            each icon&apos;s main surfaces.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-brand-950 p-4 text-sm text-brand-100">{usage}</pre>
        </header>

        {groups.map((group) => (
          <section key={group.title} className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">
              {group.title}{" "}
              <code className="font-sans text-sm font-normal text-brand-600">@/components/icons/{group.source}</code>
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {iconsIn(group.icons).map(([name, Glyph]) => (
                <li key={name} className="overflow-hidden rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-center gap-5 px-4 py-5 text-brand-800">
                    <Glyph />
                    <Glyph className="size-10 duotone-accent-200" />
                  </div>
                  <div className="flex items-center justify-center gap-5 bg-brand-900 px-4 py-4 text-white">
                    <Glyph />
                    <Glyph className="size-10 text-accent-300 duotone-brand-700" />
                  </div>
                  <p className="border-t border-border px-3 py-2 text-center font-mono text-xs text-brand-700">
                    {name}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-brand-900">
            Insurance lines{" "}
            <code className="font-sans text-sm font-normal text-brand-600">insuranceLineIcons</code>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(insuranceLineIcons).map(([line, LineIcon]) => (
              <li key={line} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                <LineIcon className="text-brand-800" />
                <code className="text-sm text-brand-700">{line}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-brand-900">In context</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-6">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-800 duotone-accent-200">
                <InsuranceLineIcon line={example.insuranceLine} className="size-8" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-brand-900">{example.label}</h3>
              <p className="mt-2 text-sm text-brand-700">{example.description}</p>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-brand-900 p-6">
              <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-2 font-semibold text-white">
                <uiIcons.PhoneIcon className="size-5 text-accent-300" />
                {agency.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
