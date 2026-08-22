import type { NextConfig } from "next";

/**
 * 301s from the live Squarespace site (eliteinsuranceknoxville.com), per
 * docs/site-audit/redirect-map.md — every previously-indexed URL gets an
 * explicit redirect, even ones consolidated into a single new page, so
 * this must go live at the same time as the DNS cutover, not before.
 *
 * `/privacypolicy` and `/termsandconditions` redirect to `/privacy` and
 * `/sms-terms`, carrying forward the real text from the live site
 * (src/app/(site)/privacy, src/app/(site)/sms-terms) — still pending legal
 * review before the DNS cutover, per redirect-map.md.
 *
 * `eliteinsurancegroup.org` (alias domain) and `/new-page-1`/`/new-page-2`
 * are handled separately (DNS decision / no redirect needed — see the map).
 */
const legacyRedirects = [
  { source: "/home", destination: "/", permanent: true },
  { source: "/local-insurance-agent-knoxville-tn", destination: "/about", permanent: true },
  { source: "/insurance-agent-knoxville-tn", destination: "/about", permanent: true },
  { source: "/insurance-agency-knoxville", destination: "/contact", permanent: true },
  { source: "/insurancequotes", destination: "/quote", permanent: true },
  { source: "/elite-insurance-blog", destination: "/blog", permanent: true },
  {
    source: "/elite-insurance-blog/2025/5/3/the-hidden-risk-in-your-life-insurance-planand-how-to-fix-it",
    destination: "/blog/hidden-risk-in-your-life-insurance-plan",
    permanent: true,
  },
  {
    source: "/elite-insurance-blog/indexeduniversallife",
    destination: "/blog/key-to-tax-free-retirement-indexed-universal-life",
    permanent: true,
  },
  {
    source: "/elite-insurance-blog/2023/8/25/the-history-of-insurance",
    destination: "/blog/history-of-insurance",
    permanent: true,
  },
  {
    source: "/elite-insurance-blog/2023/5/19/guide-to",
    destination: "/blog/guide-to-lower-insurance-rates",
    permanent: true,
  },
  {
    source: "/elite-insurance-blog/2023/4/21/tips-to-a-financially-stress-free-life",
    destination: "/blog/tips-to-a-financially-stress-free-life",
    permanent: true,
  },
  {
    source: "/elite-insurance-blog/2023/4/18/what-is-special-about-collector-car-insurance",
    destination: "/blog/what-is-special-about-collector-car-insurance",
    permanent: true,
  },
  // Tag archives — thin taxonomy (~1 post/tag), consolidated into /blog
  // rather than 1:1 redirected, per redirect-map.md.
  { source: "/elite-insurance-blog/tag/Collector\\+car\\+insurance", destination: "/blog", permanent: true },
  { source: "/elite-insurance-blog/tag/Personal\\+finance", destination: "/blog", permanent: true },
  { source: "/elite-insurance-blog/tag/auto\\+insurance", destination: "/blog", permanent: true },
  { source: "/elite-insurance-blog/tag/Insurance", destination: "/blog", permanent: true },
  { source: "/elite-insurance-blog/tag/Homeowners\\+insurance", destination: "/blog", permanent: true },
  { source: "/elite-insurance-blog/tag/budget", destination: "/blog", permanent: true },
  { source: "/privacypolicy", destination: "/privacy", permanent: true },
  { source: "/termsandconditions", destination: "/sms-terms", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
