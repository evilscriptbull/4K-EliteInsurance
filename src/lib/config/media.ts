/**
 * Curated real photography/logo assets, sourced from the old site's media
 * dump (kept locally at public/photos/Elite Media/, gitignored -- not
 * committed, since it's a 90+ file mix of duplicate headshot attempts, two
 * former employees no longer in `team`, and off-brand logo concepts). Only
 * the chosen files are copied into public/images/ and referenced here, so
 * nothing else in the codebase needs to know that source folder exists.
 *
 * Every path here is served from public/images/ -- next/image resizes and
 * re-encodes at request time, but the committed source files are already
 * downscaled (team/hero images run through sharp: portraits capped at
 * 640px tall, the hero shot at 1600px wide) to keep the repo light.
 */

import type { team, carriers } from "@/lib/config/agency";

export const teamPhotos: Record<(typeof team)[number]["name"], string> = {
  "Chaz Goodin": "/images/team/chaz-goodin.jpg",
  "Stephanie Goodin": "/images/team/stephanie-goodin.jpg",
  "Lori Wright": "/images/team/lori-wright.jpg",
  "Taylor Kitts": "/images/team/taylor-kitts.jpg",
  "Angela Mattson": "/images/team/angela-mattson.jpg",
  "Kyle Arnold": "/images/team/kyle-arnold.jpg",
  "Wes Mutta": "/images/team/wes-mutta.jpg",
  "Tyler Moore": "/images/team/tyler-moore.jpg",
};

/**
 * Real carrier logo files exist for 4 of the 5 confirmed appointments
 * (see `carriers` in agency.ts) -- none for Builders Mutual, so that one
 * stays a plain text mention wherever this map is consulted. These are
 * genuine trademarked marks, not the agency's own asset: same "confirm
 * usage rights before treating as final" caveat documented on `carriers`
 * itself and in docs/open-questions.md.
 */
export const carrierLogos: Partial<Record<(typeof carriers)[number], string>> = {
  "Erie Insurance": "/images/carriers/erie.png",
  "The Hartford": "/images/carriers/the-hartford.png",
  Travelers: "/images/carriers/travelers.jpg",
  Encova: "/images/carriers/encova.webp",
};

/**
 * Hero image -- a macro shot of a manual shifter, pulled from the old
 * site's media library. Doubles as the homepage's literal "Protect Your
 * Passion" visual and ties into the collector-car flagship story.
 */
export const heroImage = "/images/hero/gear-shifter.jpg";
