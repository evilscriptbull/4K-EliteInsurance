# Redirect Map (skeleton)

Rule from `docs/sitemap-mvp.md`: every URL currently indexed gets an explicit 301, even ones being consolidated into a single new landing page. This table will be finalized once Search Console access confirms actual indexed/ranked URLs (open question) — for now it's built from the live crawl.

| Old URL | New URL | Notes |
|---|---|---|
| `/home`, `/` | `/` | Homepage |
| `/insurance-agent-knoxville-tn` | `/about` | **Currently 404 live** — no content to preserve, just needs the redirect target established |
| `/insurance-agency-knoxville` | `/contact` | |
| `/claims` | `/claims` | Path can stay the same |
| `/insurancequotes` | `/quote` | Static per-line forms replaced by the AI Lead Warmer entry point; each of the 6 product tiles' worth of fields must be collectible by the new flow (see `docs/site-audit/content-inventory.md` forms inventory) |
| `/elite-insurance-blog` | `/blog` | |
| `/elite-insurance-blog/*` (6 posts) | `/blog/<slug>` | Migrate all 6 posts; preserve or 301 old slugs individually |
| `/elite-insurance-blog/tag/*` (6 tags) | `/blog/tag/<tag>` or drop | Thin taxonomy (~1 post/tag in several cases) — consider consolidating tags rather than 1:1 redirecting during the content-engine rebuild |
| `/privacypolicy` | `/privacy` | Legal review before relaunch |
| `/termsandconditions` | `/sms-terms` (or fold into `/privacy`) | Content is actually SMS/TCPA consent language, not general terms — rename to match actual content |
| `/new-page-1` | — | Empty stub, not indexed meaningfully; no redirect needed, exclude from new site |
| `/new-page-2` | `/contractors-insurance` restaurant content → hold for future `/restaurant-insurance` (Phase 2) | Unlinked draft; not worth a redirect since it was never indexed/linked, but copy is reusable (see content inventory) |

## Alias domain

`eliteinsurancegroup.org` — same Squarespace account, not separate content. Decide: keep as a redirect-to-primary alias domain post-launch, or drop entirely. Needs a DNS decision, not a per-page redirect.

## Not part of the redirect map

`classicautoappraisal.com` is a separate business's domain (see `docs/site-audit/url-inventory.md`) — no redirects apply; it's an external partner link, not primary-domain content.

## Still needed before this is final

- Search Console access to confirm which URLs actually have indexed pages/backlinks/ranking (open question — see `docs/open-questions.md`)
- Decision on `/new-page-1` and `/new-page-2` (finish, exclude, or repurpose — see content inventory)
- Confirm About Us page content to restore at `/about` given the live 404 — check if Search Console/cache has the last-known content, or if it needs to be written fresh
