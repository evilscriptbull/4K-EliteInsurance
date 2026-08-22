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
- [x] SMS/email nurture provider decided — **GoTo Connect (SMS, existing service) + Resend (email)**, updated 2026-08-21 from the original Twilio assumption once the owner confirmed Elite already runs GoTo (see `docs/architecture.md`). GoTo SMS built and live for internal notifications (see below); Resend account still needed before Phase 2 nurture ships.
- [x] GoTo SMS integration built — `src/lib/integrations/goto/client.ts` (real Messaging V2 API client, Personal Access Token exchange) + `src/lib/notifications/leadNotify.ts` (internal staff SMS on new lead/contact/claim, wired into all 3 form API routes). No-ops cleanly without credentials, verified. Owner has generated a PAT; needs to set `GOTO_CLIENT_ID`/`GOTO_CLIENT_SECRET`/`GOTO_PERSONAL_ACCESS_TOKEN`/`GOTO_OWNER_PHONE_NUMBER`/`GOTO_NOTIFY_PHONE_NUMBER` in `.env.local` to go live — steps in `.env.example`.
- [x] Build homepage per "Homepage direction" in handoff doc — hero + AI-quote CTA, line selector (12 pages), carrier proof point (text, pending logo rights), collector-car authority, team credibility, reviews link-out. Design system (navy/gold, Inter/Fraunces) built from scratch in `src/app/globals.css`.
- [x] Core scaffolding pages built and wired to real content: `/about` (real mission/community copy + team), `/reviews` (Trusted Choice link-out only, no fabricated testimonials), `/contact`, `/claims`, `/quote` (family picker) + `/quote/[family]` (6 quote forms matching the old site's field sets — see `docs/site-audit/content-inventory.md`).
- [x] Contact/Claims/Quote forms submit to local API routes (`/api/contact`, `/api/claims`, `/api/quote`), validated server-side with zod. Only quote submissions map into the canonical `Lead` schema (`src/lib/leads/mappers.ts`) — contact and claims get their own simple schemas/stores since neither is genuinely new-business sales intent. Persistence is in-memory only this pass (explicitly commented as non-durable) — durable storage is separate from this item.
- [x] Build the 12 MVP line/vertical landing pages, **commercial-first per confirmed priority lines** (see `docs/sitemap-mvp.md`): Collector Car (flagship, reuses `CollectorCarAuthority`) → Business hub → General Liability → Workers Comp → Commercial Auto → Commercial Property → Builders Risk → Commercial Umbrella → Contractors → Short-Term Rental → Group Life → Personal Auto/Home. Built via a shared `LineLandingPage` template (`src/components/marketing/LineLandingPage.tsx`) with real audited copy for the 4 lines that had it and original, factual (no fabricated rates/carrier claims) educational copy for the 8 commercial lines that didn't. Each page's quote CTA links directly to its matching `/quote/[family]` form via `resolveQuoteFormFamily()`. `LineSelector` now links with `next/link` instead of the placeholder `<a>` tags.
- [x] Durable persistence for leads/claims/contact messages — **live and verified 2026-08-21**, not just built. Postgres via Supabase + Drizzle ORM (`src/lib/db/`). Real end-to-end test: submitted actual forms in the browser and confirmed the rows in Supabase directly (`leads`, `claims`, `contact_messages` tables all populated with correct data). Falls back to the original in-memory arrays automatically if `DATABASE_URL` isn't set. See `docs/architecture.md` ("Durable persistence") for the connection-string gotcha this surfaced (Supabase's literal "direct connection" is IPv6-only and fails from IPv4 networks — use the session pooler instead for migrations).
- [x] Migrate 6 existing blog posts to `/blog` — **live and verified 2026-08-22**, full body content pulled from the live Squarespace posts (not reconstructed) and pushed to Sanity as `status: "published"`. 3 are by ex-employee Tyler Vaught, migrated as-is per the earlier decision not to route future work to him.
- [x] Sanity CMS wired up — `src/lib/sanity/` (client, GROQ queries, Portable Text helper) + `/blog`, `/blog/[slug]`, `scripts/seed-sanity-posts.mjs`. Fallback-safe (renders 0 posts without credentials), verified.
- [x] Sanity Studio embedded at `/studio` — real editing UI (`sanity.config.ts`, `src/sanity/schemaTypes/`) for Chaz to review and publish the draft posts, instead of editing raw documents via script. Required moving the marketing site into a `(site)` route group so `/studio` isn't wrapped in the site's Header/Footer — see `docs/architecture.md` ("Blog / Sanity CMS"). One manual step left for the owner: register the CORS origin for local + production, per the same doc section.
- [x] 6 new high-ROI posts drafted covering priority lines — general liability, commercial auto, boat (East TN lakes), group life, workers' comp (TN-specific), builders risk. Reviewed and published via `/studio` by the agency owner, **2026-08-22** — all 6 now live on `/blog` alongside the 6 migrated posts (12 total).
- [ ] Publish the restaurant-insurance content-engine worked example at `/blog` — per the agency owner (2026-08-22), this stays a **structural reference** for future posts rather than being published itself; the 6 new drafts above already apply its section-based pattern to real priority lines.
- [ ] AI Lead Warmer: 5 initial flows (Home/Auto, Boat/Recreational, Collector Vehicle, Commercial/Contractor, General Business) — replaces the static `/quote` forms with a conversational flow; update `AiQuoteCta.tsx`'s copy when this ships (currently deliberately not claiming AI qualification exists yet)
- [x] EZLynx adapter scaffolded — `src/lib/integrations/ezlynx/adapter.ts`, wired into `/api/quote`. **Not connected**: EZLynx's API is partner/enterprise-gated and Elite only has a portal login today, not API credentials (see `docs/open-questions.md` for exactly what to request from EZLynx/Applied Systems). Honestly reports `{status: "not-connected"}` rather than faking a push against guessed endpoints.
- [ ] EZLynx live connection — blocked on API credentials (see open-questions.md); once granted, implement the real request logic in `pushLeadToEZLynx()`
- [ ] Resend account setup + domain verification (SPF/DKIM) for email nurture
- [x] GA4 analytics wired up (Measurement ID `NEXT_PUBLIC_GA_MEASUREMENT_ID`, see `.env.example`) — `page_view` automatic, `landing_page_view`/`lead_created`/`contact_submitted`/`claim_submitted` implemented and verified firing with real data (see `docs/event-tracking-schema.md`). `gclid` captured into `Lead.source.gclid` ahead of the agency owner's incoming Google Ads account access. Full source-to-lead attribution still needs durable persistence + EZLynx sync (see items above/below) — GA4 covers the marketing-visibility side, not the CRM side.
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
