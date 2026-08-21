# Implementation Backlog

Derived from the roadmap in the handoff doc. Split MVP / Phase 2+ / Later, per the doc's MVP boundary.

## MVP (ship the acquisition foundation)

- [x] Repo scaffold (Next.js + TS + Tailwind), buildable/lint-clean
- [x] Canonical `Lead` and `ConversationState` schemas
- [x] Compliance guardrails skeleton + 14-state disclaimer structure
- [x] Agency config isolated from app logic
- [x] Site audit complete (URL inventory, content inventory, redirect map) — see `docs/site-audit/`
- [x] Draft MVP sitemap + redirect map (cross-checked against the completed audit)
- [ ] Fix broken `/insurance-agent-knoxville-tn` (About Us) nav link — currently 404 live, independent of the rebuild timeline
- [ ] Decide fate of orphaned draft pages `/new-page-1` and `/new-page-2` (see open questions)
- [ ] Build 8–12 line/vertical landing pages (see `docs/sitemap-mvp.md`) — forms inventory in `docs/site-audit/content-inventory.md` defines the minimum field coverage per line
- [ ] Build homepage per "Homepage direction" in handoff doc
- [ ] Migrate 6 existing blog posts to `/blog` (content already inventoried, same Squarespace platform — no cross-CMS scrape needed)
- [ ] Sanity CMS setup + schemas (articles, landing pages, campaign bundles, approval status, publication dates, insurance-line tags)
- [ ] AI Lead Warmer: 5 initial flows (Home/Auto, Boat/Recreational, Collector Vehicle, Commercial/Contractor, General Business)
- [ ] EZLynx CRM adapter (lead push, system-of-record pattern) — **net-new integration**, audit confirmed no existing CRM/rater integration on the live site today
- [ ] SMS/email nurture provider decision + integration (blocked — see open questions)
- [ ] Analytics + source-to-lead attribution (event schema drafted, see `docs/event-tracking-schema.md`)
- [ ] AI-assisted content drafting/scheduling with human approval workflow
- [ ] 301 redirect map deployed at launch; Squarespace kept live until validated

## Phase 2+ (after MVP proves value)

- [ ] Policy/document intake (secure upload, extraction, structured agent brief — no autonomous coverage decisions)
- [ ] Renewal/cross-sell detection
- [ ] Agent copilot / internal search
- [ ] Paid acquisition: Google Search, Meta/retargeting, commercial/collector campaigns, A/B tests
- [ ] Expand landing pages beyond MVP set (cyber, additional commercial verticals: restaurants, transportation, medical/professional offices, retail/service, automotive)
- [ ] Expand local content beyond Knoxville/East TN into other licensed states, with genuinely differentiated (non-programmatic) content per state
- [ ] Full policy/revenue attribution + CRO + lead-score refinement + campaign feedback loops

## Later / productization

- [ ] Extract reusable primitives (landing-page framework, lead warmer, qualification flows, scoring, CRM connectors, content engine, policy intake, renewal/cross-sell, analytics, copilots) into a platform other agencies could run
- [ ] Multi-tenant agency config pattern (generalize `src/lib/config/agency.ts`)

## Explicitly not building (guardrail)

- Autonomous binding of coverage
- Definitive/licensed coverage determination workflows
