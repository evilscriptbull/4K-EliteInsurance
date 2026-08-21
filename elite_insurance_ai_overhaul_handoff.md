# Elite Insurance Group — AI Growth Platform & Website Overhaul
## Implementation Handoff for Claude / Cowork

**Target business:** Elite Insurance Group, Knoxville, Tennessee  
**Current site:** https://eliteinsuranceknoxville.com/

## Mission
Rebuild Elite's digital presence as an AI-enabled customer acquisition and service platform, not merely a website redesign. The website is the front end of a system that combines targeted landing pages, an AI lead warmer, CRM routing, SMS/email nurture, automated seasonal content, paid campaigns, local SEO, and revenue attribution.

## Primary outcomes
- Increase qualified inbound quote opportunities.
- Convert more anonymous traffic into identifiable leads.
- Reduce agent time spent collecting basic prospect information.
- Automate follow-up after abandonment.
- Create a local SEO/content engine across insurance lines.
- Run campaigns by season, insurance line, geography, and business vertical.
- Attribute traffic/campaigns to quotes, policies, premium, and commission.
- Keep the architecture reusable enough to later productize for other independent agencies.

## Existing-site migration
Do **not** use Squarespace HTML as the new application codebase. Duplicate the current Squarespace site, crawl every URL, inventory all copy/assets/forms/metadata/team/carrier material/disclaimers, record analytics/Search Console/GBP/backlink/ranking baselines, preserve high-value URLs, and build explicit 301 redirects. Do not cancel Squarespace until replacement launch is validated.

## Core funnel
```
Traffic / Search / Ads / Social
  → Insurance-specific landing page
  → AI Lead Warmer
  → Structured lead + intent score
  → CRM + agent routing
  → SMS / Email nurture + appointment
  → Quote → Policy → Cross-sell → Review / Referral

Parallel: AI Content Engine → Blog / Local SEO / Social / Email / Ads → Traffic
```

## Website IA
Core lines: Auto, Home, Business, Life, Collector Car, Boat, Motorcycle, RV, Rental Property/Landlord, Commercial Auto, Contractors, Workers Comp, Cyber.

Commercial verticals: contractors, restaurants, transportation, commercial property owners, landlords, medical/professional offices, retail/service, automotive.

Local SEO should focus on Knoxville and valuable surrounding East Tennessee markets with genuinely differentiated content; avoid thin programmatic city-page spam.

## Strategic specialty: collector vehicles
Keep collector vehicles as a flagship. Develop high-quality content/landing pages around classic cars, muscle cars, specialty/exotic vehicles, enthusiast makes/models, collector trucks, agreed value, storage, and seasonal-use considerations. Use the niche for referrals and cross-sell into home/umbrella/daily-driver auto.

## AI Lead Warmer
Build structured insurance-specific conversational flows, not a generic chatbot. The assistant educates, qualifies, collects information, routes, schedules, and nurtures. It must not bind insurance or make definitive licensed coverage determinations.

Initial choice set: Home, Auto, Business, Collector Vehicle, Boat/RV/Motorcycle, Life, Other.

Example boat data: year/make/model/length/value, lake/coastal use, storage/trailer/marina, operator details, current carrier, renewal date, related home/auto/umbrella.

Example commercial data: business type, years in business, employees, payroll, revenue, vehicles, subs, equipment, locations, carrier, renewal date, pain point.

Canonical lead output: line, intent, insured assets, renewal urgency, carrier, cross-sell potential, preferred contact, conversation summary, missing fields, lead score, assigned agent/queue.

Lead score concept: 80–100 immediate; 60–79 same day; 30–59 nurture; below 30 marketing/education.

## Nurture
Resume abandoned conversations via consented SMS/email; preserve state. Follow with coverage-specific value, policy-review/upload offers, renewal reminders, agent outreach, then onboarding/cross-sell/review/referral after purchase.

## Policy/document intake — later phase
Allow secure upload of policy/declarations PDFs. Extract carrier, policy type, dates, limits, deductibles, insured assets, named insureds, endorsements, and missing fields. Produce a structured agent brief; do not autonomously decide coverage.

## CRM / AMS
Identify Elite's current stack before building integrations. Possibilities include Applied Epic, EZLynx, HawkSoft, AMS360, AgencyZoom, HubSpot, Salesforce, or informal tools. Existing CRM/AMS should remain the system of record when practical. Pattern: website → AI service → normalized lead → CRM/AMS → assignment/tasks/SMS/email/pipeline.

## AI content engine
Do not implement “one generic blog every Tuesday.” The engine should understand season, geography, insurance line, business priority, existing content, search opportunity, upcoming events, and past performance. Human approval initially.

### Seasonal examples
- Jan: business renewals, life, annual review
- Feb: valuables/umbrella/family protection
- Mar: motorcycle + boat pre-season
- Apr: boat
- May: boat/RV/recreational
- Jun: vacation/rental property
- Jul: boats/ATVs/collector vehicles
- Aug: college/renters/auto
- Sep: commercial property/contractors
- Oct: homeowners/weather
- Nov: collector vehicles/winter storage
- Dec: life/business year-end review

One campaign should fan out into SEO article, landing page, Google Business post, Facebook/Instagram/LinkedIn posts, email, SMS, ad variants, and optionally short video script.

Workflow: trigger → topic/keyword selection → draft → compliance/approved-language rules → fact check → human approval → publish → distribute → measure → refresh winners.

## Local content
Prefer useful local intent such as “Boat Insurance in East Tennessee: What Norris Lake and Fort Loudoun Boat Owners Should Know,” “Does Homeowners Insurance Cover Storm Damage in Knoxville?”, “Insurance Checklist for Knoxville Roofing Contractors,” and “How to Insure a Classic Car in Tennessee.”

## Commercial growth
Create dedicated funnels for contractors, HVAC, electricians, plumbers, landscaping, restaurants, commercial landlords, trucking/transportation, medical/professional offices, automotive businesses, and property owners.

## Paid media
Send ads to dedicated intent pages, never the homepage by default. Search themes include commercial insurance Knoxville, contractor insurance Knoxville, boat insurance Knoxville, classic car insurance Tennessee, landlord insurance Knoxville, workers comp Knoxville. Retarget based on the exact line/content viewed.

## Homepage direction
Local independent-agency value proposition; primary quote/coverage CTA; line selector; multiple-carrier proof point; collector-car authority; local family/team credibility; reviews; prominent “2-minute” AI qualification CTA.

## Suggested stack
Next.js, TypeScript, Tailwind, Vercel, PostgreSQL/Supabase as needed, Sanity or Payload CMS (Sanity favored if automation is central), model-provider-agnostic AI gateway, CRM/AMS integration, robust analytics.

Logical AI modules: Lead Qualification, Content/Campaign, Service/FAQ, Policy Extraction, Agent Copilot/Internal Search, deterministic compliance layer, model gateway.

## Measurement
Track visitors → AI conversations → qualified leads → agent contacts → quotes → policies → written premium → estimated commission. Segment by line, campaign, keyword, landing page, geography, source, and agent. Optimize to revenue, not vanity traffic.

## Guardrails
- Never imply coverage is bound through chat.
- No definitive licensed coverage determinations.
- No guaranteed savings or unsupported comparisons.
- Never fabricate carrier products, rates, appetite, or underwriting rules.
- Use approved/state-appropriate language and disclaimers.
- Human review for higher-risk insurance recommendations/marketing.
- Track SMS/email consent.
- Apply least-privilege data access and appropriate PII handling.

## Roadmap
**Phase 0 — Preserve & Measure:** site backup, crawl, analytics baseline, CRM discovery, conversion baseline.

**Phase 1 — Foundation:** new site/CMS, SEO + redirects, landing pages, forms/CRM, analytics.

**Phase 2 — AI Lead Warmer:** line-specific flows, lead schema/scoring, routing, calendar, SMS/email continuation.

**Phase 3 — Content Engine:** seasonal calendar, AI drafting, compliance/fact-check, approval, publishing/distribution.

**Phase 4 — Paid Acquisition:** Google Search, Meta/retargeting, commercial/collector campaigns, A/B tests.

**Phase 5 — Internal AI:** document intake, renewal/cross-sell detection, agent briefs, copilot.

**Phase 6 — Optimization:** policy/revenue attribution, CRO, lead-score refinement, campaign feedback loops.

## MVP boundary
1. New website.
2. Roughly 8–12 strong line/vertical landing pages.
3. AI lead warmer.
4. CRM capture and routing.
5. SMS/email nurture.
6. AI-assisted content drafting/scheduling with human approval.
7. Analytics and source-to-lead attribution.

Defer sophisticated policy analysis, autonomous publishing, agent copilot, and broad cross-sell intelligence until the acquisition foundation proves value.

## Immediate actions for Claude / Cowork
1. Audit the current site and build a complete URL/content inventory.
2. Identify existing messaging/assets/testimonials/specialty positioning/SEO equity to preserve.
3. Produce the final MVP sitemap and redirect map.
4. Define canonical lead and conversation-state schemas.
5. Design five initial flows: Home/Auto, Boat/Recreational, Collector Vehicle, Commercial/Contractor, General Business.
6. Identify CRM/AMS, email/SMS, quote workflow, calendars, analytics, and carrier/contact processes before integration choices.
7. Produce MVP architecture diagram and repo structure.
8. Define CMS schemas for articles, landing pages, campaign bundles, approval status, publication dates, and insurance-line tags.
9. Draft first 90-day localized content/campaign calendar.
10. Define event tracking and dashboard schema from visitor through policy.
11. Create implementation backlog split into MVP / Phase 2 / later productization.
12. Do not build autonomous binding or definitive coverage recommendation workflows.

## Open questions
- What AMS/CRM does Elite use?
- What email/SMS provider?
- Who approves compliance language?
- Which carrier appointments/lines are highest priority and margin?
- Exact geographic service area?
- Which lines have the best close rate/commission potential?
- Existing online scheduling?
- Can quote/policy outcomes be programmatically returned for attribution?
- What access exists to analytics/Search Console/GBP/ad accounts?
- What permissions apply to carrier logos/images/content?

## Productization thesis
Treat Elite as the first agency-specific deployment of a reusable independent-insurance growth platform. Reusable primitives: landing-page framework, AI lead warmer, insurance qualification flows, scoring, CRM connectors, content engine, policy intake, renewal/cross-sell workflows, analytics, and agent copilots. Keep Elite-specific branding/business rules above reusable services rather than hard-coded throughout.

## Success definition
More qualified leads, higher conversion, faster response, less manual collection, consistent local content, measurable campaign/SEO performance by line, source-to-policy attribution, no duplicate data entry, and architecture that expands without a rewrite.
