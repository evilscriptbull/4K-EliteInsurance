# Elite Insurance Group — AI Growth Platform

Next.js app for Elite Insurance Group's website + AI lead warmer + content engine rebuild. See [`elite_insurance_ai_overhaul_handoff.md`](./elite_insurance_ai_overhaul_handoff.md) for the full product spec, and [`docs/`](./docs) for the planning artifacts produced from it:

- [`docs/architecture.md`](./docs/architecture.md) — module diagram, stack, repo structure
- [`docs/sitemap-mvp.md`](./docs/sitemap-mvp.md) — target IA and redirect plan
- [`docs/site-audit/`](./docs/site-audit) — inventory of the current live site (Phase 0)
- [`docs/backlog.md`](./docs/backlog.md) — MVP / Phase 2 / later work, checkboxed
- [`docs/open-questions.md`](./docs/open-questions.md) — what's confirmed vs. still blocking, keep this current
- [`docs/content-calendar-90day.md`](./docs/content-calendar-90day.md), [`docs/event-tracking-schema.md`](./docs/event-tracking-schema.md)

## Structure

```
src/
├── app/            # Next.js routes
├── lib/
│   ├── schemas/    # canonical Lead + ConversationState (zod)
│   ├── compliance/ # guardrails, per-state disclaimer structure
│   └── config/
│       └── agency.ts  # Elite-specific data — the file to change to retarget this platform
```

## Development

```bash
npm run dev     # start dev server
npm run build   # production build
npm run lint    # eslint
```
