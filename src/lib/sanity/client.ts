import { createClient, type SanityClient } from "@sanity/client";

/**
 * Sanity Content Lake client. Fallback-safe like every other integration in
 * this project (GA4, GoTo, EZLynx, Postgres): returns null when env vars
 * aren't configured instead of throwing, so local dev without Sanity
 * credentials still works.
 */
function getClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2026-08-01",
    useCdn: !token,
  });
}

export const sanityClient = getClient();
