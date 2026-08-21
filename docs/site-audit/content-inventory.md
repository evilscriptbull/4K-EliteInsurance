# Content & Forms Inventory — Live Site Audit

**Audited:** 2026-08-21. Complements `docs/site-audit/url-inventory.md`.

## Business info (footer, verified live)

- **Address:** 113 Legacy View Way, Knoxville, TN 37918
- **Phone:** (865) 687-5140
- **Email:** service@eliteinsgroup.org
- **Hours:** Mon–Fri 9am–5pm, closed Sat/Sun
- **Trusted Choice profile:** `trustedchoice.com/agency-profile/1397862/elite-insurance-group/`
- No NPN or state license numbers disclosed anywhere on-site — needed for the new site's compliance footer; ask during CRM/compliance discovery.
- No additional office locations found.

All of the above is now encoded in `src/lib/config/agency.ts`.

## Team (Meet the Team section — 9 bios, all preserved in `src/lib/config/agency.ts`)

Terry Isbel (Founder), Chaz Goodin (Agent/Owner — Sales & Marketing), Stephanie Goodin (Agent/Owner — HR & Finance), Lori Wright (Licensed Agent), Taylor Kitts (Account Manager), Angela Mattson (Account Manager), Kyle Arnold (Licensed Agent), Wesley Mutta (Licensed Agent), Kelly Partin (Licensed Agent).

Note: blog posts are also credited to **Tyler Vaught** (3 of 6 posts) — not in the current team bios. Confirm whether Tyler is a past team member, a contracted content writer, or should be added to the About page during the rebuild.

## Blog content (6 posts total — full migration set, no cross-CMS scrape needed since it's the same Squarespace site)

| Post | Author | Date |
|---|---|---|
| The Hidden Risk in Your Life Insurance Plan (and How to Fix It) | Chaz Goodin | 2025-05-03 |
| The Key to Tax-Free Retirement — Indexed Universal Life | — | — |
| The History of Insurance | Tyler Vaught | 2023-08-25 |
| A Guide to Lower Insurance Rates | Tyler Vaught | 2023-05-19 |
| Tips to a Financially Stress-Free Life | Chaz Goodin | 2023-04-21 |
| What is Special About Collector Car Insurance? | Tyler Vaught | 2023-04-18 |

Tags: Collector car insurance, Personal finance, auto insurance, Insurance, Homeowners insurance, budget — thin taxonomy, likely 1 post per tag in several cases. Most recent post is 15+ months old as of the audit date — content cadence has stalled, reinforcing the case for the Phase 3 content engine.

## Orphaned page content worth reusing

- **`/new-page-2`** — full "Best Restaurant Insurance Coverage Knoxville TN" landing page copy already exists (BOP, liquor liability, Dram Shop Act, food spoilage, etc.). Unlinked, has a placeholder `tel:+1YOUR-PHONE` link and a dead mini-nav. Reusable as a head start for a restaurant-vertical landing page (Phase 2 per `docs/backlog.md`) after fixing the phone link and folding into the real site nav/design.
- **`/new-page-1`** — empty stub titled "Contractor Insurance Knoxville TN." No content to reuse, but the title confirms contractor insurance was already flagged as a priority page — consistent with its place in the MVP set.

## Legal/compliance copy already in use (candidates to carry forward, not rewrite from scratch)

- **Quote-form disclaimer:** "Coverage cannot be bound or altered using this form..." — carried forward into `src/lib/compliance/disclaimers.ts` (`noBindingViaForm`), verbatim.
- **`/termsandconditions`** is actually SMS/TCPA marketing consent language, not general site terms — reuse as the starting point for `smsConsent` copy in `src/lib/compliance/disclaimers.ts` once compliance sign-off is available (still TBD, see `docs/open-questions.md`).
- **`/privacypolicy`** — standard PII/payment/cookie policy; carry forward with legal review before relaunch.

## Forms inventory (exact fields — for lead-schema mapping and redirect/migration planning)

### 1. "Let's Get Started!" contact form (homepage + `/insurance-agency-knoxville`)
First Name*, Last Name*, Phone*, Email Address*, Message*. Posts to same page. No CRM webhook — captured via Squarespace only.

### 2. `/claims` — "File A Claim!" form
First Name*, Last Name*, Phone*, Email, Who is filing? (myself/someone else)*, Policy Number*, Incident date*, Incident time* (Central, estimate OK), Anyone injured? (Yes/No/Not sure)*, Need a rental? (Yes/No/Not sure)*, What happened?* (free text), Police report? (optional).

### 3. `/insurancequotes` — 6 separate per-line lightbox forms (all native Squarespace, no rater integration)

- **Collector Vehicle:** Name*, Phone*, Email*, Address* (+ Country dropdown), DOB, Vehicle Year/Make/Model*, Estimated Value*, Mileage Plan* (1k/3k/6k), Liability Limits* (500k/300k/100k/50k/Full Coverage), Additional Drivers/Vehicles/Coverage notes.
- **Auto (Personal & Commercial):** Name*, Phone*, Email*, Address*, DOB*, License #, Vehicle Year/Make/Model*, Liability Limits* (250/500/100, 100/300/100, 50/100/50, Other), Full Coverage or Liability Only*, notes.
- **Homeowners & Rental Dwelling:** Name*, DOB*, Email*, Phone*, Address*, Dwelling Coverage Amount*, Liability Limit* (500k/300k/100k), Deductible (1k/2.5k/5k/Other), notes.
- **Boat/Motorcycle/RV/ATV:** Name*, DOB*, Email*, Phone*, Address*, Vehicle Year/Make/Model*, Full Coverage or Liability*, Liability Limits* (250/500, 100/300, 50/100, Other), notes.
- **Life:** Name*, Email*, Phone*, DOB*, Amount Requested*, Product* (Term/Whole/Final Expense), Height*, Weight*, Tobacco User?*, Medications/Surgeries (5yr, optional).
- **Business & Workers' Comp:** Name*, Business Name*, Business Address*, Business Phone*, Email*, Description of Operations*, Business Entity* (Individual/Partnership/Corp/LLC/Other), Liability Coverage Requested (5M/3M/2M/1M/500K/300K/Other), notes.

`* = required`. All forms default to a full ISO country dropdown (unnecessary for a US-only agency — simplify in the rebuild) and use Squarespace internal field IDs rather than semantic `name` attributes, so there's no direct field-name mapping to inherit — map by label/purpose instead when building the new lead-intake forms and the AI Lead Warmer's structured-data collection (see `src/lib/schemas/lead.ts`, `insuredAssets[].details`).

This field list is the concrete basis for what the AI Lead Warmer needs to be able to collect per line — it should be at least as capable as these static forms, not a regression.
