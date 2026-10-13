import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";
import { landingPages } from "@/lib/config/landing-pages";
import { quoteFormFamilies } from "@/lib/config/quote-forms";
import { getPublishedPostIndex } from "@/lib/sanity/queries";

// Newly published posts show up within an hour (the blog pages themselves
// revalidate every 5 minutes).
export const revalidate = 3600;

const STATIC_PATHS = ["/", "/about", "/contact", "/claims", "/reviews", "/quote", "/blog", "/privacy", "/sms-terms"];

/**
 * Deliberately NOT listed: /quote/{family}/chat (interactive tool pages with
 * no standalone content -- thin pages that would compete with the real
 * landing and form pages), and everything robots.ts disallows (/staff,
 * /studio, /api) plus the noindex /design pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await getPublishedPostIndex();

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path === "/" ? "" : path}` })),
    ...landingPages.map((page) => ({ url: `${base}${page.slug}` })),
    ...quoteFormFamilies.map((family) => ({ url: `${base}/quote/${family.slug}` })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: new Date(post.publishedAt) })),
  ];
}
