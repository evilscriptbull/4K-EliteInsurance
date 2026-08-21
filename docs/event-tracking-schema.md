# Event Tracking Schema

Tracks the full funnel called out in the handoff doc: **visitor → AI conversation → qualified lead → agent contact → quote → policy → written premium → estimated commission**, segmented by line, campaign, keyword, landing page, geography, source, and agent. Goal: optimize to revenue, not vanity traffic.

**GA4 wired up 2026-08-21** (Measurement ID configured via `NEXT_PUBLIC_GA_MEASUREMENT_ID`, see `.env.example` — real value lives in `.env.local`, gitignored, and must be set separately in the production deploy host). `@next/third-parties`'s `<GoogleAnalytics>` component is mounted in `src/app/layout.tsx`; custom events go through `src/lib/analytics/track.ts`.

## Event taxonomy

| Event | Fired when | Key properties | Status |
|---|---|---|---|
| `page_view` | Any page load | `path`, `utm_source`, `utm_medium`, `utm_campaign`, `referrer`, `geo_state` | **Implemented** — automatic via `<GoogleAnalytics>`, including client-side route changes |
| `landing_page_view` | View of a line/vertical landing page specifically | `line`, `path` | **Implemented** — `trackLandingPageView()`, fired once from `LineLandingPage.tsx` (covers all 12 pages) |
| `lead_created` | Canonical `Lead` produced from a quote-form submission | `line`, `lead_score_tier` | **Implemented** for form-based leads — `trackLeadCreatedFromResponse()`, fired from all 6 quote forms using the real `line`/`leadScoreTier` `/api/quote` returns. Not yet wired for AI-conversation-based leads (AI Lead Warmer doesn't exist yet) |
| `contact_submitted` | Contact form submitted successfully | — | **Implemented**, added beyond the original taxonomy — `trackContactSubmitted()` in `ContactForm.tsx`. Worth tracking for Ads conversion measurement even though it isn't a scored sales lead (see `lib/leads/mappers.ts` for why contact doesn't map into `Lead`) |
| `claim_submitted` | Claims form submitted successfully | — | **Implemented**, added beyond the original taxonomy — `trackClaimSubmitted()` in `ClaimsForm.tsx` |
| `ai_conversation_started` | Lead warmer session begins | `conversation_id`, `entry_line` (if pre-selected from landing page) | Not built — AI Lead Warmer is separate future work |
| `ai_conversation_message` | Each turn | `conversation_id`, `role`, `turn_index` | Not built |
| `ai_conversation_abandoned` | Session inactive past threshold, no lead produced | `conversation_id`, `last_collected_fields` | Not built |
| `ai_conversation_resumed` | Prospect returns via SMS/email nurture link | `conversation_id`, `resume_channel` | Not built |
| `lead_pushed_to_crm` | Lead successfully posted to EZLynx | `lead_id`, `crm_reference_id` | Not built — blocked on the EZLynx adapter |
| `agent_contact_logged` | Agent logs first contact (from CRM webhook/sync, not directly trackable client-side) | `lead_id`, `agent`, `contact_method`, `time_to_contact_seconds` | Not built — blocked on EZLynx data flowing back out |
| `quote_issued` | Quote produced (from CRM/AMS data, synced not tracked client-side) | `lead_id`, `line`, `carrier`, `premium_estimate` | Not built |
| `policy_bound` | Policy written (from CRM/AMS sync) | `lead_id`, `line`, `carrier`, `written_premium`, `estimated_commission` | Not built |
| `content_published` | Content engine publishes an article/campaign asset | `content_id`, `line`, `channel`, `campaign_id` | Not built — content engine is Phase 3 |
| `ad_click` | Paid click lands on a page | `campaign_id`, `keyword`, `landing_page`, `platform` | Handled by Google Ads/GA4 account linking (not app code) once that's set up in the Google UI. `gclid` is separately captured into `Lead.source.gclid` for internal attribution — see `lib/forms/useLeadFormSubmit.ts` |

## Segmentation dimensions (apply across all funnel reporting)

- `line` (insurance line)
- `campaign_id`
- `keyword`
- `landing_page`
- `geo_state` (of the 14 licensed states)
- `source` / `medium`
- `agent` (assigned)

## Notes

- Everything from `agent_contact_logged` onward depends on data flowing back **out of** EZLynx (or wherever quote/policy outcomes live) — this is explicitly an open question in the handoff doc ("Can quote/policy outcomes be programmatically returned for attribution?"). Until that's confirmed, those events are a target schema, not something built this session.
- SMS/email consent is tracked per `guardrails.trackSmsEmailConsent` (`src/lib/compliance/guardrails.ts`) — stored on the `Lead` record (`contact.smsConsent`) but not currently passed as a GA4 event property; add it to `trackLeadCreated()` if consent-rate segmentation in GA4 becomes useful.
- Cookie-consent banner: not built. Likely unnecessary for a Tennessee-based agency with US-only traffic (no GDPR exposure, and CA isn't among the 14 licensed states), but that's a legal judgment call, not an engineering one — flagged in `docs/open-questions.md` rather than silently decided.
- Durable server-side event/lead history still depends on the separate durable-persistence backlog item (`docs/backlog.md`) — GA4 gives you the marketing-side view; it isn't a substitute for the in-app lead record.
