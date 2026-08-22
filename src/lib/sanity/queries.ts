import { sanityClient } from "@/lib/sanity/client";
import type { BlogPost } from "@/lib/sanity/types";

const postProjection = `{
  "_id": _id,
  title,
  "slug": slug.current,
  excerpt,
  author,
  publishedAt,
  insuranceLines,
  status,
  body,
  sourceUrl
}`;

/**
 * Only ever returns status == "published" posts — drafts exist in Sanity
 * for review but are never rendered on the public site. See
 * docs/architecture.md ("Blog / Sanity CMS") for the approval workflow.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(
    `*[_type == "post" && status == "published"] | order(publishedAt desc) ${postProjection}`,
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!sanityClient) return null;
  const post = await sanityClient.fetch(
    `*[_type == "post" && status == "published" && slug.current == $slug][0] ${postProjection}`,
    { slug },
  );
  return post ?? null;
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(`*[_type == "post" && status == "published"].slug.current`);
}
