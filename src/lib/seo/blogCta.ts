import { landingPages } from "@/lib/config/landing-pages";

export interface BlogCta {
  href: string;
  label: string;
}

const DEFAULT_CTA: BlogCta = { href: "/quote", label: "Get a Quote" };

/**
 * The closing CTA for a blog post. `ctaLandingPage` is an optional Sanity
 * field (a landing page slug); it's re-validated against the real
 * landingPages list here, so a slug that has since been removed or renamed
 * falls back to the general quote page instead of rendering a dead link.
 * The label changes with the target because a landing page isn't the quote
 * form -- "Get a Quote" would mislead.
 */
export function resolveBlogCta(ctaLandingPage: string | undefined): BlogCta {
  const page = ctaLandingPage ? landingPages.find((candidate) => candidate.slug === ctaLandingPage) : undefined;
  return page ? { href: page.slug, label: `Explore ${page.label}` } : DEFAULT_CTA;
}
