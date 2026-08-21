# Redirect Map (skeleton)

Rule from `docs/sitemap-mvp.md`: every URL currently indexed gets an explicit 301, even ones being consolidated into a single new landing page. This table will be finalized once Search Console access confirms actual indexed/ranked URLs (open question) — for now it's built from the live crawl.

| Old URL | New URL | Notes |
|---|---|---|
| `/home`, `/` | `/` | Homepage |
| `/local-insurance-agent-knoxville-tn` (About Us, current) | `/about` | Real content pulled 2026-08-21 — see `docs/site-audit/content-inventory.md` |
| `/insurance-agent-knoxville-tn` (About Us, old/dead) | `/about` | Still 404 live and still linked from the footer — redirect anyway since it was previously indexed |
| `/insurance-agency-knoxville` | `/contact` | |
| `/claims` | `/claims` | Path can stay the same |
| `/insurancequotes` | `/quote` | Static per-line forms replaced by the AI Lead Warmer entry point; each of the 6 product tiles' worth of fields must be collectible by the new flow (see `docs/site-audit/content-inventory.md` forms inventory) |
| `/elite-insurance-blog` | `/blog` | |
| `/elite-insurance-blog/*` (6 posts) | `/blog/<slug>` | Migrate all 6 posts, including the 3 by ex-employee Tyler Vaught; preserve or 301 old slugs individually |
| `/elite-insurance-blog/tag/*` (6 tags) | `/blog/tag/<tag>` or drop | Thin taxonomy (~1 post/tag in several cases) — consider consolidating tags rather than 1:1 redirecting during the content-engine rebuild |
| `/privacypolicy` | `/privacy` | Legal review before relaunch |
| `/termsandconditions` | `/sms-terms` (or fold into `/privacy`) | Content is actually SMS/TCPA consent language, not general terms — rename to match actual content; route through compliance approver Chaz Goodin before relaunch |
| `/new-page-1` | — | Empty stub, not indexed meaningfully; no redirect needed, exclude from new site |
| `/new-page-2` | — (content → `/blog/restaurant-insurance-knoxville`) | Not a landing page: owner confirmed (2026-08-21) this is a worked example for the Phase 3 content engine, published as a blog post, not redirected as a nav page — see `docs/content-calendar-90day.md` |

## Alias domain

`eliteinsurancegroup.org` — same Squarespace account, not separate content. Decide: keep as a redirect-to-primary alias domain post-launch, or drop entirely. Needs a DNS decision, not a per-page redirect.

## Not part of the redirect map

`classicautoappraisal.com` is a separate business's domain (see `docs/site-audit/url-inventory.md`) — no redirects apply; it's an external partner link, not primary-domain content.

## Still needed before this is final

- Search Console access to confirm which URLs actually have indexed pages/backlinks/ranking (open question — see `docs/open-questions.md`)
- Decision on `eliteinsurancegroup.org` alias domain DNS treatment post-launch (still open, see `docs/open-questions.md`)
