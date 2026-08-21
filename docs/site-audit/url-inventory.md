# URL Inventory — Live Site Audit

**Audited:** 2026-08-21, live browser crawl of `eliteinsuranceknoxville.com` (primary), `eliteinsurancegroup.org` (alias domain), and `classicautoappraisal.com` (external partner, not an Elite property).

## Primary domain — pages in `sitemap.xml`

| URL | Status | Description |
|---|---|---|
| `/home` (canonical; `/` redirects here) | 200 | Homepage — 6 insurance-line anchor sections, team bios, bottom contact form |
| `/insurancequotes` | 200 | "Get a Quote" — 6 product tiles, each opening a native Squarespace lightbox form |
| `/elite-insurance-blog` | 200 | Blog index (same Squarespace site — see note below) |
| `/elite-insurance-blog/2025/5/3/the-hidden-risk-in-your-life-insurance-planand-how-to-fix-it` | 200 | Post: life insurance/IUL retirement planning |
| `/elite-insurance-blog/indexeduniversallife` | 200 | Post: "The Key to Tax-Free Retirement — Indexed Universal Life" |
| `/elite-insurance-blog/2023/8/25/the-history-of-insurance` | 200 | Post: history of insurance |
| `/elite-insurance-blog/2023/5/19/guide-to` | 200 | Post: "A Guide to Lower Insurance Rates" |
| `/elite-insurance-blog/2023/4/21/tips-to-a-financially-stress-free-life` | 200 | Post: personal-finance tips |
| `/elite-insurance-blog/2023/4/18/what-is-special-about-collector-car-insurance` | 200 | Post: collector car insurance |
| `/elite-insurance-blog/tag/Collector+car+insurance` | 200 | Tag archive |
| `/elite-insurance-blog/tag/Personal+finance` | 200 | Tag archive |
| `/elite-insurance-blog/tag/auto+insurance` | 200 | Tag archive |
| `/elite-insurance-blog/tag/Insurance` | 200 | Tag archive |
| `/elite-insurance-blog/tag/Homeowners+insurance` | 200 | Tag archive |
| `/elite-insurance-blog/tag/budget` | 200 | Tag archive |
| `/claims` | 200 | File a claim — native Squarespace form |
| `/privacypolicy` | 200 | Legal — standard privacy policy |
| `/termsandconditions` | 200 | Legal — actually SMS/TCPA marketing consent terms, not general site terms |
| `/new-page-1` | 200, orphaned | Empty stub, titled "Contractor Insurance Knoxville TN," no body content, not linked from nav |
| `/new-page-2` | 200, orphaned | Fully written but unlinked "Best Restaurant Insurance Coverage Knoxville TN" landing page; has a placeholder `tel:+1YOUR-PHONE` link and a mini-nav that only links to `#` |

## Primary domain — pages linked from nav but **absent from sitemap.xml**

| URL | Status | Description |
|---|---|---|
| `/insurance-agent-knoxville-tn` (About Us) | **404 — broken today** | Main nav "About Us" link is currently dead on the live site |
| `/insurance-agency-knoxville` (Contact) | 200 | Same "Let's Get Started!" lead form as the homepage |

Both are missing from `sitemap.xml` — check for `noindex` or manual sitemap exclusion before re-establishing SEO on the new build.

## Alias domain

`eliteinsurancegroup.org` is **not a separate site** — it's an alias domain on the same Squarespace account. `eliteinsurancegroup.org/elite-insurance-blog` returns the identical page with a canonical tag pointing back to `eliteinsuranceknoxville.com/elite-insurance-blog`, and `/termsandconditions` on the primary domain links to `eliteinsurancegroup.org/privacypolicy` as if interchangeable. No separate content to migrate from this domain — decide its DNS/redirect treatment (keep as an alias, or drop) as part of the launch plan.

## External partner (not an Elite property)

`classicautoappraisal.com` — legally separate business (Daniel Curtis & Mark Ochoa; different phone, address, and site builder — Hostinger, not Squarespace). Connected to Elite only via a one-way "Partners" page listing. Relevant to the collector-car vertical strategy as a referral partner, not as a migration or consolidation target.

## Homepage anchor sections (not separate URLs)

1. Business Insurance & Workers' Compensation
2. Life / Annuities / Medicare (Term, Whole, IUL, Final-Expense, Medicare A&B, Supplements & Advantage)
3. Personal Auto & Home Insurance
4. Boat, Motorcycle, Camper & ATV Insurance
5. Collector Car Insurance — Classics & Newer Exotics (flagship)
6. Short-Term Rental / Airbnb / Cabins / Lake Homes / Builder's Risk & Renovations

Plus: "What We're All About" (mission/community/faith statement, Farragut Chamber membership), "Meet the Team" (9 bios), "Let's Get Started!" contact form.

## Key flags

1. **Broken nav link** — About Us (`/insurance-agent-knoxville-tn`) 404s live today; no content to preserve at that URL, just needs a redirect target to the new `/about`.
2. **Orphaned draft pages** — `/new-page-1` (empty) and `/new-page-2` (built restaurant-insurance content, unlinked, has placeholder phone link) exist but aren't in navigation. `/new-page-2`'s copy is a useful head start for a future restaurant-vertical landing page (Phase 2, per `docs/backlog.md`); `/new-page-1`'s title ("Contractor Insurance Knoxville TN") signals contractor insurance was already identified as a priority page that was never finished — reinforces its place in the MVP set (see `docs/sitemap-mvp.md`).
3. **No CRM/rater integration exists today.** Every quote/contact/claim form is a native Squarespace form with no embedded EZLynx or rater widget, no external script tags to any rating vendor. Leads are captured only in Squarespace's form storage/email notifications — staff must manually re-key into EZLynx (or wherever) today. This means the EZLynx adapter in `docs/backlog.md` is a **new integration**, not a migration of an existing automated flow — there's no existing automation to preserve, which simplifies the cutover but means the "reduce agent time spent collecting basic prospect information" outcome in the handoff doc is currently unmet by a wide margin.
