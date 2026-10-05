// Read-only funnel report: for leads created in the last 7 and 30 days,
// prints how many there were and how many progressed, broken down by source,
// landing page, line, and channel. Nothing is written or sent anywhere.
//
// Run with: npm run report:weekly   (or: node scripts/report-weekly.mjs)
//
// Definitions (a cohort view -- "of the leads created in this window, how
// many got where"):
//   - Window: leads.created_at within the last N days.
//   - leads: every lead in the window, including ones with no outcome row.
//   - contacted / quoted / bound: the lead's lead_outcomes row has that stage's
//     first-reached timestamp set (contacted_at / quoted_at / bound_at, stamped
//     once by logLeadOutcome, lib/leads/outcomes.ts). Funnel semantics: a lead
//     later marked "lost" still counts as having reached the stages it did.
//   - premium: SUM(written_premium) only where the outcome's CURRENT status is
//     "bound", so a bound -> lost reversal does not keep counting its premium.
//     (That means "bound" can exceed the count of premium-bearing rows.)
//   - source: utm_source (lowercased); else "google-ads (gclid)" when only a
//     gclid was captured; else "(direct)". landing page: Lead.source.landingPage
//     or "(none)" (static quote-form leads that sent no source).
//
// Requires DATABASE_URL in .env.local -- see .env.example.
import { fileURLToPath } from "node:url";
import path from "node:path";

// Relative to this script's own location, not cwd -- works from any checkout.
process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local"));

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local -- see .env.example. Nothing to report on.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const WINDOWS_DAYS = [7, 30];

// Whitelisted column names -> interpolated via sql(identifier), never user input.
const DIMENSIONS = [
  { column: "source", title: "By source" },
  { column: "landing_page", title: "By landing page" },
  { column: "line", title: "By line" },
  { column: "channel", title: "By channel" },
];

function dimensionRows(days, column) {
  return sql`
    with base as (
      select
        l.line,
        coalesce(l.data->>'channel', 'form') as channel,
        coalesce(nullif(l.data->'source'->>'landingPage', ''), '(none)') as landing_page,
        case
          when nullif(l.data->'source'->>'utmSource', '') is not null then lower(l.data->'source'->>'utmSource')
          when nullif(l.data->'source'->>'gclid', '') is not null then 'google-ads (gclid)'
          else '(direct)'
        end as source,
        o.status,
        o.contacted_at,
        o.quoted_at,
        o.bound_at,
        o.written_premium
      from leads l
      left join lead_outcomes o on o.lead_id = l.id
      where l.created_at > now() - make_interval(days => ${days})
    )
    select
      ${sql(column)} as key,
      count(*)::int as leads,
      count(contacted_at)::int as contacted,
      count(quoted_at)::int as quoted,
      count(bound_at)::int as bound,
      coalesce(sum(written_premium) filter (where status = 'bound'), 0)::float8 as premium
    from base
    group by 1
    order by leads desc, key asc
  `;
}

const money = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function printTable(title, rows) {
  console.log(`\n  ${title}`);
  if (rows.length === 0) {
    console.log("    (no leads)");
    return;
  }
  const total = rows.reduce(
    (t, r) => ({
      key: "TOTAL",
      leads: t.leads + r.leads,
      contacted: t.contacted + r.contacted,
      quoted: t.quoted + r.quoted,
      bound: t.bound + r.bound,
      premium: t.premium + r.premium,
    }),
    { key: "TOTAL", leads: 0, contacted: 0, quoted: 0, bound: 0, premium: 0 },
  );
  const keyWidth = Math.max(...[...rows, total].map((r) => String(r.key).length), 8);
  const line = (key, leads, contacted, quoted, bound, premium) =>
    `    ${String(key).padEnd(keyWidth)}  ${String(leads).padStart(5)}  ${String(contacted).padStart(9)}  ${String(quoted).padStart(6)}  ${String(bound).padStart(5)}  ${String(premium).padStart(10)}`;
  console.log(line("", "leads", "contacted", "quoted", "bound", "premium"));
  for (const r of rows) console.log(line(r.key, r.leads, r.contacted, r.quoted, r.bound, money(r.premium)));
  console.log(line("-".repeat(keyWidth), "-----", "---------", "------", "-----", "----------"));
  console.log(line(total.key, total.leads, total.contacted, total.quoted, total.bound, money(total.premium)));
}

try {
  console.log(`Elite Insurance weekly report -- generated ${new Date().toISOString()}`);
  for (const days of WINDOWS_DAYS) {
    console.log(`\n=== Leads created in the last ${days} days ===`);
    for (const { column, title } of DIMENSIONS) {
      printTable(title, await dimensionRows(days, column));
    }
  }
} finally {
  await sql.end();
}
