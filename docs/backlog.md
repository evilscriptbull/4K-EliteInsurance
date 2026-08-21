# Implementation Backlog

Derived from the roadmap in the handoff doc. Split MVP / Phase 2+ / Later, per the doc's MVP boundary.

## MVP (ship the acquisition foundation)

- [x] Repo scaffold (Next.js + TS + Tailwind), buildable/lint-clean
- [x] Canonical `Lead` and `ConversationState` schemas
- [x] Compliance guardrails skeleton + 14-state disclaimer structure
- [x] Agency config isolated from app logic
- [x] Site audit complete (URL inventory, content inventory, redirect map) — see `docs/site-audit/`
- [x] Draft MVP sitemap + redirect map (cross-checked against the completed audit)
- [x] About Us nav link fixed live (now `/local-insurance-agent-knoxville-tn`); footer still points to the old dead URL — redirect both to `/about` (see `docs/site-audit/redirect-map.md`)
- [x] Fate of orphaned draft pages decided — `/new-page-1` (contractor stub) reinforces the Contractors MVP page; `/new-page-2` (restaurant) becomes a Phase 3 content-engine worked example, not a landing page
- [x] SMS/email nurture provider decided — Twilio + Resend (see `docs/architecture.md`); account provisioning (incl. 10DLC registration) still needed before Phase 2 nurture ships
- [ ] Build MVP line/vertical landing pages, **commercial-first per confirmed priority lines** (see `docs/sitemap-mvp.md`, reordered 2026-08-21): Collector Car (flagship) → Business hub → General Liability → Workers Comp → Commercial Auto → Commercial Property → Builders Risk → Commercial Umbrella → Contractors → Short-Term Rental → Group Life → Personal Auto/Home. Forms inventory in `docs/site-audit/content-inventory.md` defines the minimum field coverage per line.
- [ ] Build homepage per "Homepage direction" in handoff doc — lead with collector-car authority and commercial-line proof points (GL/Workers Comp/Commercial Auto/Commercial Property/Builders Risk/Commercial Umbrella), name real appointed carriers (Erie, The Hartford, Builders Mutual, Travelers, Encova — see `src/lib/config/agency.ts`) as the multi-carrier proof point once logo/usage rights are confirmed (still open)
- [ ] Migrate 6 existing blog posts to `/blog` (content already inventoried, same Squarespace platform, no cross-CMS scrape needed; 3 are by ex-employee Tyler Vaught — migrate content, don't route future work to him)
- [ ] Publish the restaurant-insurance content-engine worked example at `/blog` (from `/new-page-2`, fix placeholder phone link first) as the first proof of the Phase 3 draft→compliance→approval→publish workflow
- [ ] Sanity CMS setup + schemas (articles, landing pages, campaign bundles, approval status, publication dates, insurance-line tags)
- [ ] AI Lead Warmer: 5 initial flows (Home/Auto, Boat/Recreational, Collector Vehicle, Commercial/Contractor, General Business)
- [ ] EZLynx CRM adapter (lead push, system-of-record pattern) — **net-new integration**, confirmed by both the audit and the agency owner that no CRM/rater integration exists on the live site today
- [ ] Twilio + Resend account setup and integration (10DLC campaign registration has review lag — start early)
- [ ] Analytics + source-to-lead attribution (event schema drafted, see `docs/event-tracking-schema.md`)
- [ ] AI-assisted content drafting/scheduling with human approval workflow — approver confirmed: Chaz Goodin (chazgoodin@gmail.com)
- [ ] 301 redirect map deployed at launch; Squarespace kept live until validated

## Phase 2+ (after MVP proves value)

- [ ] Policy/document intake (secure upload, extraction, structured agent brief — no autonomous coverage decisions)
- [ ] Renewal/cross-sell detection
- [ ] Agent copilot / internal search
- [ ] Paid acquisition: Google Search, Meta/retargeting, commercial/collector campaigns, A/B tests
- [ ] Expand landing pages beyond MVP set: boat/motorcycle/RV (recreational, demoted from MVP per 2026-08-21 priority-lines data but still valuable collector-car cross-sell), personal life insurance (distinct from Group Life, which is in MVP), cyber, additional commercial verticals (restaurants — beyond the Phase 3 blog example — transportation, medical/professional offices, retail/service, automotive)
- [ ] Expand local content beyond Knoxville/East TN into other licensed states, with genuinely differentiated (non-programmatic) content per state
- [ ] Full policy/revenue attribution + CRO + lead-score refinement + campaign feedback loops

## Later / productization

- [ ] Extract reusable primitives (landing-page framework, lead warmer, qualification flows, scoring, CRM connectors, content engine, policy intake, renewal/cross-sell, analytics, copilots) into a platform other agencies could run
- [ ] Multi-tenant agency config pattern (generalize `src/lib/config/agency.ts`)

## Explicitly not building (guardrail)

- Autonomous binding of coverage
- Definitive/licensed coverage determination workflows
