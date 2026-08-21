# Event Tracking Schema

Tracks the full funnel called out in the handoff doc: **visitor → AI conversation → qualified lead → agent contact → quote → policy → written premium → estimated commission**, segmented by line, campaign, keyword, landing page, geography, source, and agent. Goal: optimize to revenue, not vanity traffic.

## Event taxonomy

| Event | Fired when | Key properties |
|---|---|---|
| `page_view` | Any page load | `path`, `utm_source`, `utm_medium`, `utm_campaign`, `referrer`, `geo_state` |
| `landing_page_view` | View of a line/vertical landing page specifically | `line`, `path` |
| `ai_conversation_started` | Lead warmer session begins | `conversation_id`, `entry_line` (if pre-selected from landing page) |
| `ai_conversation_message` | Each turn | `conversation_id`, `role`, `turn_index` |
| `ai_conversation_abandoned` | Session inactive past threshold, no lead produced | `conversation_id`, `last_collected_fields` |
| `ai_conversation_resumed` | Prospect returns via SMS/email nurture link | `conversation_id`, `resume_channel` |
| `lead_created` | Canonical `Lead` produced from conversation or form | `lead_id`, `conversation_id`, `line`, `lead_score`, `lead_score_tier` |
| `lead_pushed_to_crm` | Lead successfully posted to EZLynx | `lead_id`, `crm_reference_id` |
| `agent_contact_logged` | Agent logs first contact (from CRM webhook/sync, not directly trackable client-side) | `lead_id`, `agent`, `contact_method`, `time_to_contact_seconds` |
| `quote_issued` | Quote produced (from CRM/AMS data, synced not tracked client-side) | `lead_id`, `line`, `carrier`, `premium_estimate` |
| `policy_bound` | Policy written (from CRM/AMS sync) | `lead_id`, `line`, `carrier`, `written_premium`, `estimated_commission` |
| `content_published` | Content engine publishes an article/campaign asset | `content_id`, `line`, `channel`, `campaign_id` |
| `ad_click` | Paid click lands on a page | `campaign_id`, `keyword`, `landing_page`, `platform` |

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
- SMS/email consent must be tracked per `guardrails.trackSmsEmailConsent` (`src/lib/compliance/guardrails.ts`) — consent state should be an attribute on the `lead_created` event and stored on the `Lead` record (`contact.smsConsent`).
