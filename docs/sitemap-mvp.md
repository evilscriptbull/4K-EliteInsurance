# MVP Sitemap

Per the handoff doc's MVP boundary: roughly 8–12 strong line/vertical landing pages, plus the core scaffolding pages. This list will be finalized once `docs/site-audit/url-inventory.md` confirms exact existing-URL mappings for the redirect map.

## Core / scaffolding pages

| Path | Purpose | Old-site equivalent |
|---|---|---|
| `/` | Homepage — local value prop, line selector, AI qualification CTA, collector-car authority, reviews | `/` |
| `/about` | Team, history, mission, licensed states | `/insurance-agent-knoxville-tn` |
| `/contact` | Contact form, phone/text/email, office info | `/insurance-agency-knoxville` |
| `/claims` | File a claim | `/claims` |
| `/quote` | AI Lead Warmer entry point (replaces static quote form) | `/insurancequotes` |
| `/reviews` | Testimonials / review aggregation | — new |
| `/blog` | Content engine output (SEO articles) | `/elite-insurance-blog` (already on the primary domain — `eliteinsurancegroup.org` is just an alias, not a separate CMS; see site audit) |

## MVP line/vertical landing pages (8–12 target)

Priority order reflects flagship specialty + highest-intent commercial lines called out in the handoff doc. Confirm against actual close-rate/commission data once available (open question).

1. `/collector-car-insurance` — flagship specialty (classics, muscle cars, exotics, agreed value)
2. `/auto-insurance` — personal auto
3. `/home-insurance` — homeowners
4. `/boat-insurance` — boat/marine
5. `/motorcycle-insurance`
6. `/rv-insurance`
7. `/business-insurance` — general commercial umbrella page, links to verticals below
8. `/contractors-insurance` — contractor vertical (largest commercial vertical opportunity per doc)
9. `/workers-comp-insurance`
10. `/landlord-insurance` — rental property/short-term rental (matches existing homepage section)
11. `/life-insurance`
12. `/commercial-auto-insurance`

Deferred to Phase 2+: `/cyber-insurance`, dedicated pages per commercial vertical (restaurants, transportation, medical/professional offices, retail/service, automotive businesses) beyond contractors — build these once the first wave proves conversion.

## Redirect map

See `docs/site-audit/redirect-map.md` — built from the completed Phase 0 crawl. Still needs a final pass once Search Console access confirms actually-indexed/ranked URLs (open question). Rule: every URL currently indexed gets an explicit 301, even ones being consolidated into a single new landing page.
