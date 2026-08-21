# 90-Day Content Calendar (Launch Quarter)

Seeded from the seasonal table in the handoff doc, mapped to a concrete first quarter. **Assumes launch in September** (adjust dates once the actual launch date is set — this is a placeholder starting point, not a commitment). Each row fans out per the doc's workflow: SEO article → landing-page tie-in → Google Business post → Facebook/Instagram/LinkedIn → email → SMS → ad variants → optional short video script. Human approval before publish: **Chaz Goodin** (chazgoodin@gmail.com), confirmed 2026-08-21.

Geographic scope corrected from the original TN/East-TN-only framing: Elite is licensed in 14 states (TN primary + KY, NC, SC, VA, WV, FL, GA, AL, OH, IN, TX, AZ, MT). This calendar keeps content **TN/Knoxville-first** for the launch quarter (existing market, existing content equity) — expand to other licensed states once the local engine is proven, per the doc's "avoid thin programmatic city-page spam" guidance.

**Line emphasis reprioritized 2026-08-21** to match confirmed top-performing lines (`src/lib/config/agency.ts` → `priorityLines`: Workers Comp, General Liability, Builders Risk, Commercial Property, Commercial Auto, Commercial Umbrella, Group Life — plus Short-Term Rental/Vacation Home and New Construction/Renovation). Personal auto/home content is reduced but not dropped, since it still supports cross-sell and the MVP's combined `/personal-auto-home-insurance` page.

## Month 1 — September: Contractors / General Liability / Workers Comp launch focus

| Week | Topic | Line(s) | Notes |
|---|---|---|---|
| 1 | "Insurance Checklist for Knoxville Roofing Contractors" | Contractors, Workers Comp, General Liability | Example topic from handoff doc — now doubly relevant since GL/WC are confirmed top lines |
| 2 | General liability basics for East TN small business owners: what it actually covers | General Liability | New — anchors the #3 MVP landing page |
| 3 | Workers' comp requirements and common mistakes for TN small businesses | Workers Comp | New — anchors the #4 MVP landing page |
| 4 | New construction & renovation: why builder's risk isn't optional | Builders Risk | Ties to owner-confirmed strength in new construction/renovation work |

## Month 2 — October: Commercial Property / Commercial Auto / storm season

| Week | Topic | Line(s) | Notes |
|---|---|---|---|
| 1 | "Does Commercial Property Insurance Cover Storm Damage in Knoxville?" | Commercial Property | Reframed from the original homeowners-only version of this example topic to lead with the confirmed priority line; a homeowners-angle companion post can follow for personal-lines cross-sell |
| 2 | Commercial auto: covering your fleet, subs, and non-owned vehicles | Commercial Auto | |
| 3 | Short-term rental & vacation home insurance for East TN lake properties | Short-Term Rental | Owner-confirmed strong performer; ties to Norris Lake/Fort Loudoun local-intent topic below |
| 4 | When a general liability policy isn't enough: intro to commercial umbrella | Commercial Umbrella | |

## Month 3 — November: Collector vehicles (flagship) + year-end commercial review

| Week | Topic | Line(s) | Notes |
|---|---|---|---|
| 1 | "How to Insure a Classic Car in Tennessee" | Collector Vehicle | Example topic from handoff doc; flagship specialty stays front and center regardless of commission ranking |
| 2 | Winter storage checklist for collector/seasonal vehicles | Collector Vehicle | |
| 3 | Agreed value coverage explained | Collector Vehicle | |
| 4 | Year-end business insurance review: GL, workers comp, and umbrella check-in; group life open enrollment reminder | General Liability, Workers Comp, Commercial Umbrella, Group Life | Sets up December's "life/business year-end review" seasonal slot, now correctly scoped to Group Life rather than personal life |

## Content-engine worked example: the restaurant insurance post

Per the agency owner (2026-08-21): the fully-written but unlinked "Best Restaurant Insurance Coverage Knoxville TN" copy sitting at the live site's orphaned `/new-page-2` (see `docs/site-audit/content-inventory.md`) should be used as a **worked example of a directed blog post** for the Phase 3 content engine — not built as its own MVP landing page, since restaurants aren't in the confirmed priority-lines list. Use it as the reference case when building the trigger → topic/keyword selection → draft → compliance/fact-check → approval → publish workflow: fix the placeholder `tel:+1YOUR-PHONE` link and dead mini-nav, run it through `src/lib/compliance/guardrails.ts`, and publish as a `/blog` post rather than a nav-linked page.

## Ongoing / evergreen (any week, fill gaps)

- "Boat Insurance in East Tennessee: What Norris Lake and Fort Loudoun Boat Owners Should Know" (example topic from handoff doc) — lower priority than commercial lines now, but still valuable for cross-sell content
- Collector-car storage/seasonal-use guides
- Renewal reminder templates per line
- Review/referral request campaigns post-purchase

## Notes for the content engine build (Phase 3)

- This calendar is a **manual seed**, not the automated engine. Phase 3 builds the trigger → topic/keyword selection → draft → compliance/fact-check → approval → publish → distribute → measure → refresh workflow described in the handoff doc.
- Every draft passes through `src/lib/compliance/guardrails.ts` before human approval (Chaz Goodin) — never fabricate carrier products, rates, appetite, or underwriting rules, even when naming real appointed carriers (`src/lib/config/agency.ts` → `carriers`).
