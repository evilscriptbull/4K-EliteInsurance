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
- [x] Build homepage per "Homepage direction" in handoff doc — hero + AI-quote CTA, line selector (12 pages), carrier proof point (text, pending logo rights), collector-car authority, team credibility, reviews link-out. Design system (navy/gold, Inter/Fraunces) built from scratch in `src/app/globals.css`.
- [x] Core scaffolding pages built and wired to real content: `/about` (real mission/community copy + team), `/reviews` (Trusted Choice link-out only, no fabricated testimonials), `/contact`, `/claims`, `/quote` (family picker) + `/quote/[family]` (6 quote forms matching the old site's field sets — see `docs/site-audit/content-inventory.md`).
- [x] Contact/Claims/Quote forms submit to local API routes (`/api/contact`, `/api/claims`, `/api/quote`), validated server-side with zod. Only quote submissions map into the canonical `Lead` schema (`src/lib/leads/mappers.ts`) — contact and claims get their own simple schemas/stores since neither is genuinely new-business sales intent. Persistence is in-memory only this pass (explicitly commented as non-durable) — durable storage is separate from this item.
- [x] Build the 12 MVP line/vertical landing pages, **commercial-first per confirmed priority lines** (see `docs/sitemap-mvp.md`): Collector Car (flagship, reuses `CollectorCarAuthority`) → Business hub → General Liability → Workers Comp → Commercial Auto → Commercial Property → Builders Risk → Commercial Umbrella → Contractors → Short-Term Rental → Group Life → Personal Auto/Home. Built via a shared `LineLandingPage` template (`src/components/marketing/LineLandingPage.tsx`) with real audited copy for the 4 lines that had it and original, factual (no fabricated rates/carrier claims) educational copy for the 8 commercial lines that didn't. Each page's quote CTA links directly to its matching `/quote/[family]` form via `resolveQuoteFormFamily()`. `LineSelector` now links with `next/link` instead of the placeholder `<a>` tags.
- [ ] Durable persistence for leads/claims/contact messages (currently in-memory, resets on restart — see `src/lib/leads/store.ts`, `src/lib/claims/store.ts`, `src/lib/contact/store.ts`)
- [ ] Migrate 6 existing blog posts to `/blog` (content already inventoried, same Squarespace platform, no cross-CMS scrape needed; 3 are by ex-employee Tyler Vaught — migrate content, don't route future work to him)
- [ ] Publish the restaurant-insurance content-engine worked example at `/blog` (from `/new-page-2`, fix placeholder phone link first) as the first proof of the Phase 3 draft→compliance→approval→publish workflow
- [ ] Sanity CMS setup + schemas (articles, landing pages, campaign bundles, approval status, publication dates, insurance-line tags)
- [ ] AI Lead Warmer: 5 initial flows (Home/Auto, Boat/Recreational, Collector Vehicle, Commercial/Contractor, General Business) — replaces the static `/quote` forms with a conversational flow; update `AiQuoteCta.tsx`'s copy when this ships (currently deliberately not claiming AI qualification exists yet)
- [ ] EZLynx CRM adapter (lead push, system-of-record pattern) — **net-new integration**, confirmed by both the audit and the agency owner that no CRM/rater integration exists on the live site today. Leads currently only reach the in-memory store/console log.
- [ ] Twilio + Resend account setup and integration (10DLC campaign registration has review lag — start early)
- [ ] Analytics + source-to-lead attribution (event schema drafted, see `docs/event-tracking-schema.md`)
- [ ] AI-assisted content drafting/scheduling with human approval workflow — approver confirmed: Chaz Goodin (chazgoodin@gmail.com)
- [ ] 301 redirect map deployed at launch; Squarespace kept live until validated
- [ ] Carrier logo/usage rights (still open) — once confirmed, swap `CarrierStrip.tsx`'s text wordmarks for real logo assets

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
