# Architecture

## Stack

- **Frontend/app:** Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel
- **CMS:** Sanity (favored per handoff doc since automation/content-engine is central)
- **Data:** PostgreSQL/Supabase (project `ybdfaelmwtgvftuztxyy`) via Drizzle ORM — **live and verified** for leads/claims/contact messages, see "Durable persistence" below
- **AI:** model-provider-agnostic gateway (no hard dependency on a single LLM vendor)
- **CRM/AMS of record:** EZLynx (confirmed) — stays system of record; this platform normalizes and pushes leads to it rather than replacing it
- **SMS/Email nurture:** **GoTo Connect (SMS, existing service) + Resend (email)** — working decision, see rationale below
- **Internal notifications:** GoTo SMS to agency staff on new lead/contact/claim — see "GoTo integration" below
- **CRM push:** EZLynx adapter scaffolded (`src/lib/integrations/ezlynx/adapter.ts`), not yet connected — API access is gated, see "EZLynx integration status" below
- **Platform monitoring:** `@vercel/analytics` (page-view/visitor analytics) + `@vercel/speed-insights` (Core Web Vitals) — zero-config, auto-activate on Vercel deploys, no-op locally. Distinct from GA4: this is Vercel's own dashboard, not a replacement for the marketing-funnel tracking in `src/lib/analytics/track.ts`.

## Module diagram

```mermaid
flowchart LR
    subgraph Acquisition
        Traffic["Traffic: Search / Ads / Social"]
        Landing["Insurance-specific landing pages"]
    end

    subgraph AI["AI Modules"]
        LeadWarmer["AI Lead Warmer\n(line-specific flows)"]
        Compliance["Deterministic Compliance Layer\n(guardrails, state disclaimers)"]
        ContentEngine["AI Content Engine\n(seasonal calendar, drafting)"]
        Gateway["Model Gateway\n(provider-agnostic)"]
    end

    subgraph Data
        ConvState["Conversation State"]
        LeadSchema["Canonical Lead"]
        Events["Event Tracking"]
    end

    subgraph Systems
        CRM["EZLynx (system of record)\nadapter scaffolded, not connected"]
        Nurture["SMS / Email Nurture\nGoTo Connect + Resend"]
        Analytics["Analytics / Attribution Dashboard"]
        CMS["Sanity CMS\n(articles, landing pages, campaigns)"]
    end

    Traffic --> Landing --> LeadWarmer
    LeadWarmer <--> Gateway
    LeadWarmer --> Compliance
    LeadWarmer --> ConvState
    ConvState --> LeadSchema
    LeadSchema --> CRM
    CRM --> Nurture
    Nurture --> LeadWarmer
    LeadSchema --> Events
    Landing --> Events
    Events --> Analytics

    ContentEngine --> Gateway
    ContentEngine --> Compliance
    ContentEngine --> CMS
    CMS --> Landing
    CMS -.-> Traffic
```

## Repo structure (this app)

```
EliteInsuranceGroup/
├── docs/                     # planning artifacts (this audit/foundation pass)
├── src/
│   ├── app/                  # Next.js routes
│   ├── lib/
│   │   ├── schemas/          # lead.ts, conversation.ts (zod) — canonical shapes
│   │   ├── compliance/       # guardrails.ts, states.ts, disclaimers.ts
│   │   └── config/
│   │       └── agency.ts     # Elite-specific data — the one file to swap to retarget the platform
├── package.json, tsconfig.json, tailwind.config.ts
```

Elite-specific branding/business rules live only in `src/lib/config/agency.ts`; everything else should read from it rather than hardcoding agency details, per the doc's productization thesis (this is the first agency-specific deployment of a reusable platform).

## SMS/email nurture provider decision

**Superseded 2026-08-21: Elite already runs GoTo for phone service.** The original Twilio decision (below, kept for history) was made under the assumption that no SMS platform existed — that assumption was wrong. GoTo Connect has a real Messaging V2 API (`messaging.v1.send` OAuth scope, `POST https://api.goto.com/messaging/v1/messages`), so SMS goes through the phone system Elite already pays for instead of standing up a second account.

**Decision: GoTo Connect for SMS, Resend for email.** Resend is unchanged from the original decision — GoTo's Messaging V2 "Email channel" is a shared-inbox/reply feature for customer conversations, not a transactional/bulk sender, so it isn't a Resend replacement.

What's actually built this pass (`src/lib/integrations/goto/client.ts`): Personal Access Token exchange (`grant_type=personal_access_token`) + `sendSms()`. There's no nurture/resume engine yet (that's the AI Lead Warmer, still Phase 2), so the immediate use is **internal SMS notifications to agency staff** on new leads/contact messages/claims (`src/lib/notifications/leadNotify.ts`, wired into all 3 form API routes) — directly serves "reduce agent time / faster response" without needing the full nurture engine to exist first.

**2026-08-21: switched from OAuth Authorization Code to Personal Access Token.** The original refresh-token flow required a one-time browser login through a local callback route and carried the risk of GoTo rotating the refresh token out from under an env var with no persistence layer to catch it. A PAT (generated once at myaccount.goto.com > Developer Tools, on an OAuth client with "Personal Access Token" enabled at developer.logmeininc.com/clients) is long-lived and doesn't rotate — verified against GoTo's own docs, not guessed — so the `oauth/start`/`oauth/callback` helper routes were removed as dead code. Full setup steps in `.env.example`.

<details>
<summary>Original Twilio decision (2026-08-21, superseded same day)</summary>

Both Twilio and Resend were considered programmable, code-first APIs rather than templated marketing-blast tools — the right fit given `ConversationState` (`src/lib/schemas/conversation.ts`) needs to be resumed via an inbound SMS reply or an email click, not just receive a one-way campaign send. Twilio specifically was picked over all-in-one local-service platforms (Podium, Birdeye — built around their own inbox UI, a poor fit for a custom stateful resume flow) and marketing-automation suites (HubSpot, ActiveCampaign — cost/lock-in for capability this build already owns). Moot now that GoTo covers SMS; Resend's reasoning (better React/Next.js DX than SendGrid via `react-email`) still stands for email.

</details>

Still required before Phase 2 nurture ships: Resend account + domain verification (SPF/DKIM), and wiring `contact.smsConsent`/consent tracking (already in `src/lib/schemas/lead.ts`) through to GoTo's opt-out handling.

## Durable persistence

Leads, claims, and contact messages persist to Postgres (Supabase project `ybdfaelmwtgvftuztxyy`) via Drizzle ORM — **live and verified this pass**, not just built. Replaces the earlier in-memory-only stores flagged throughout `src/lib/leads/store.ts` etc. as non-durable.

**Connection setup, verified against current Supabase behavior (not assumed):**
- `DATABASE_URL` — the transaction pooler (Supavisor, port 6543), used by the app at runtime. Required for serverless: Postgres has a low connection limit and Vercel functions open a new connection per invocation.
- `DIRECT_URL` — used only by `drizzle-kit` for migrations. **Not** Supabase's literal "direct connection" (`db.[ref].supabase.co:5432`) — that hostname is IPv6-only now and fails DNS resolution (`ENOTFOUND`) from IPv4-only networks, which is exactly what happened when this was first wired up. Uses the **session pooler** instead (same pooler host as `DATABASE_URL`, port 5432 instead of 6543) — IPv4-compatible and supports the session-level behavior migrations need, per Supabase's own documented fix for this.
- `prepare: false` is required on the `postgres.js` driver — transaction-mode pooling doesn't support prepared statements, which the driver uses by default.

**Schema shape:** JSONB + a few indexed columns (`src/lib/db/schema.ts`), not a fully normalized schema. `data jsonb` holds the full zod-validated object (`Lead`/`StoredClaim`/`StoredContactMessage`) so the DB doesn't need a migration every time those types evolve; a handful of real columns (`line`, `lead_score_tier` on leads; `policy_number` on claims) exist only for the filtering/sorting queries that actually matter.

**Fallback-safe**: if `DATABASE_URL` isn't set, `src/lib/db/client.ts` returns `null` and the 3 store modules fall back to their original in-memory arrays — same no-op-safe contract as every other integration in this project (GA4, GoTo, EZLynx). Confirmed with a build run with the env var unset.

**Migrations**: `npm run db:generate` (writes SQL to `migrations/`, committed to the repo) then `npm run db:migrate` (applies against `DIRECT_URL`).

## EZLynx integration status

Per the CRM/AMS pattern in the handoff doc: `website → AI service → normalized lead → CRM/AMS → assignment/tasks/SMS/email/pipeline`. The AI lead warmer (and today, the quote forms) produce a canonical `Lead` (see `src/lib/schemas/lead.ts`), and `src/lib/leads/mappers.ts`/`src/app/api/quote/route.ts` call an EZLynx adapter to push it.

**Scaffolded, not connected.** `src/lib/integrations/ezlynx/adapter.ts` exists and is wired into the quote flow, but EZLynx's API is partner/enterprise-gated (OAuth2, not self-serve — confirmed via EZLynx's own published API solutions page) and Elite currently only has a portal login, not API credentials. Building real request logic against guessed endpoints would fabricate something that looks connected but isn't, so the adapter honestly reports `{status: "not-connected"}` until real credentials exist. What to request from EZLynx/Applied Systems is in `docs/open-questions.md`.
