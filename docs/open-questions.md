# Open Questions

Living doc. Update as answers come in — don't let this go stale once a question is resolved, move it to "Answered" with the date.

## Answered

- **What AMS/CRM does Elite use?** → **EZLynx.** Confirmed by agency owner, 2026-08-21. Drives `src/lib/config/agency.ts` (`crm.system`) and the (future) EZLynx-specific lead adapter.
- **Exact geographic service area?** → **TN (primary/home state) plus KY, NC, SC, VA, WV, FL, GA, AL, OH, IN, TX, AZ, MT** — 14 states total. Confirmed by agency owner, 2026-08-21. This is materially broader than the current site's Knoxville/East-TN-only framing; encoded in `src/lib/config/agency.ts` (`licensedStates`) and `src/lib/compliance/states.ts`. Content/SEO strategy for launch still prioritizes TN (see `docs/content-calendar-90day.md`), but the compliance layer and long-term paid/SEO scope now account for all 14.

## Still open — blocking

- **What email/SMS provider?** Owner said "Outlook" — but Outlook is a mailbox, not a marketing-automation or SMS platform; it cannot run the abandoned-conversation nurture sequences the handoff doc calls for (Phase 2). **Needs a real decision**: either (a) a dedicated ESP/SMS platform (e.g. Twilio for SMS + Postmark/SendGrid/Resend for transactional-and-nurture email), (b) an all-in-one marketing platform, or (c) building nurture on Microsoft Graph API against the existing 365/Outlook tenant for email while still needing a separate SMS provider (Outlook has no SMS capability at all). This blocks Phase 2 nurture build.
- **Who approves compliance/marketing language before it goes live?** Still TBD. Blocks publishing any AI-drafted content or lead-warmer copy per the guardrail requiring human review for higher-risk recommendations/marketing.
- **Which carrier appointments/lines are highest priority and margin?** Needed to prioritize the landing-page build order in `docs/sitemap-mvp.md` beyond the flagship collector-car assumption.
- **Which lines have the best close rate/commission potential?** Same as above — currently ordering the MVP landing pages by handoff-doc emphasis (collector car, then core personal lines, then contractors/workers comp), not by actual data.

## Still open — non-blocking for this session

- Existing online scheduling system, if any?
- Can quote/policy outcomes be programmatically returned from EZLynx for attribution? (Needed for the back half of `docs/event-tracking-schema.md` — `agent_contact_logged` onward.)
- What access exists to analytics/Search Console/Google Business Profile/ad accounts? (Needed before Phase 0 baseline metrics can actually be pulled, and before the redirect map can be validated against real indexed URLs.)
- What permissions exist for carrier logos/images/content use on the new site?

## Raised by the Phase 0 site audit (2026-08-21) — needs an answer/decision

- **Who is "Tyler Vaught"?** Credited author on 3 of the 6 existing blog posts but not listed among current team bios. Former team member, contractor, or ghostwriter? Matters for attribution and for who (if anyone) should keep writing content.
- **What should happen to `/new-page-1` and `/new-page-2`?** Two unlinked draft pages exist on the live site — an empty "Contractor Insurance Knoxville TN" stub and a fully-written but unfinished "Restaurant Insurance" landing page (placeholder phone number, dead mini-nav). Finish, discard, or fold into the new site's Phase 1/2 landing pages? (Leaning toward reusing the restaurant copy in Phase 2 and treating the contractor stub as confirmation contractor insurance was already a planned priority — see `docs/site-audit/content-inventory.md`.)
- **What should happen to the `eliteinsurancegroup.org` alias domain post-launch?** Currently just mirrors the primary Squarespace site; needs a DNS/redirect decision, not a content decision.
- **Does anyone have last-known content for the About Us page?** It 404s live today (`/insurance-agent-knoxville-tn`) — worth checking Search Console/cache before writing the new About page from scratch, in case there's existing copy/SEO equity to recover.
- **No CRM integration exists on the live site today** (confirmed — all quote/contact/claims forms are native Squarespace forms with no rater/AMS widget; leads are captured via Squarespace only and presumably re-keyed manually). This isn't a question so much as a finding: the EZLynx lead-push adapter in the backlog is genuinely new work, not a migration of an existing automated flow.
