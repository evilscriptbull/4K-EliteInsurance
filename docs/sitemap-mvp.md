# MVP Sitemap

Per the handoff doc's MVP boundary: roughly 8–12 strong line/vertical landing pages, plus the core scaffolding pages. This list will be finalized once `docs/site-audit/url-inventory.md` confirms exact existing-URL mappings for the redirect map.

## Core / scaffolding pages

| Path | Purpose | Old-site equivalent |
|---|---|---|
| `/` | Homepage — local value prop, line selector, AI qualification CTA, collector-car authority, reviews | `/` |
| `/about` | Team, history, mission, licensed states | `/local-insurance-agent-knoxville-tn` (live nav now points here; content pulled — see `docs/site-audit/content-inventory.md`. Also redirect the old dead `/insurance-agent-knoxville-tn`, still linked from the live footer) |
| `/contact` | Contact form, phone/text/email, office info | `/insurance-agency-knoxville` |
| `/claims` | File a claim | `/claims` |
| `/quote` | Quote request entry point — family picker + 6 forms, built and live. Will become the AI Lead Warmer entry point once that ships (Phase 2); replaces the old static quote forms functionally in the meantime | `/insurancequotes` |
| `/reviews` | Testimonials / review aggregation | — new |
| `/blog` | Content engine output (SEO articles) | `/elite-insurance-blog` (already on the primary domain — `eliteinsurancegroup.org` is just an alias, not a separate CMS; see site audit) |

## MVP line/vertical landing pages (8–12 target) — built 2026-08-21

**Reprioritized 2026-08-21** based on the agency owner's actual close-rate/commission data (`src/lib/config/agency.ts` → `priorityLines`), which corrects the handoff doc's personal-lines-heavy assumption. Elite is effectively a **commercial-first shop** behind its collector-car flagship branding: Workers Comp, General Liability, Builders Risk, Commercial Property, Commercial Auto, Commercial Umbrella, and Group Life outperform, alongside strong Short-Term Rental/Vacation Home and New Construction/Renovation activity.

1. `/collector-car-insurance` — flagship specialty (classics, muscle cars, exotics, agreed value). Kept #1 per the handoff doc's explicit instruction to lead with this for brand/authority/referral value, independent of raw commission ranking.
2. `/business-insurance` — commercial hub/overview page, entry point into the lines below (replaces the old homepage's "Business Insurance & Workers' Comp" anchor section as a real page)
3. `/general-liability-insurance` — confirmed top-performing line
4. `/workers-comp-insurance` — confirmed top-performing line
5. `/commercial-auto-insurance` — confirmed top-performing line
6. `/commercial-property-insurance` — confirmed top-performing line
7. `/builders-risk-insurance` — confirmed top-performing line; also covers new construction/renovation risk, which the owner flagged as doing well
8. `/commercial-umbrella-insurance` — confirmed top-performing line
9. `/contractors-insurance` — vertical bundling GL + Workers Comp + Commercial Auto + Builders Risk; revives the topic already staged (unfinished) at the live site's orphaned `/new-page-1`
10. `/short-term-rental-insurance` — STR/vacation homes/lake homes; owner-confirmed strong performer, matches the existing homepage's "Short-Term Rental, Airbnb, Cabins, Lake Homes" section
11. `/group-life-insurance` — confirmed top-performing line (distinct from personal life — see #12)
12. `/personal-auto-home-insurance` — combined single page for personal auto + homeowners. Demoted from separate top-level pages given the new priority data, but kept in the MVP set since these remain necessary cross-sell/completeness lines and appear in the AI Lead Warmer's initial flow set (`docs/backlog.md`)

Deferred to Phase 2+: `/boat-insurance`, `/motorcycle-insurance`, `/rv-insurance` (recreational — still valuable, especially as collector-car cross-sell, but not in the confirmed priority-lines list), `/life-insurance` (personal, as distinct from Group Life), `/cyber-insurance`, and dedicated pages per additional commercial vertical (restaurants, transportation, medical/professional offices, retail/service, automotive businesses). The restaurant-insurance content already drafted at the live site's orphaned `/new-page-2` is being repurposed as a **worked example for the Phase 3 content engine** (a directed blog post, not a landing page) rather than built out here — see `docs/content-calendar-90day.md`.

## Redirect map

See `docs/site-audit/redirect-map.md` — built from the completed Phase 0 crawl. Still needs a final pass once Search Console access confirms actually-indexed/ranked URLs (open question). Rule: every URL currently indexed gets an explicit 301, even ones being consolidated into a single new landing page.
