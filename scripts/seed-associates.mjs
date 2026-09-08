// One-time/re-runnable seed script: creates a Supabase Auth account (via
// invite email) for each sales-team associate, then upserts a matching row
// into the `associates` table (src/lib/db/schema.ts), keyed by the auth
// user id.
//
// Run with: node scripts/seed-associates.mjs                     (everyone)
//       or: node scripts/seed-associates.mjs cgoodin@eliteinsgroup.org  (just Chaz, for testing)
//       or: node scripts/seed-associates.mjs email1@... email2@...     (any subset)
//
// Roster confirmed as final by the agency owner, 2026-08-22 (also the
// source for the public /about page team roster — see src/lib/config/
// agency.ts). All pings go to the shared agency line, not per-person
// numbers, so no phone field is seeded here.
//
// Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and
// DATABASE_URL in .env.local — see .env.example. The service role key is
// required (not the anon key) because creating users via the Admin API
// needs elevated privileges; never expose it client-side.
process.loadEnvFile("C:\\Users\\cruze\\Code\\aiWork\\EliteInsurance\\.env.local");

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const roster = [
  { name: "Chaz Goodin", email: "cgoodin@eliteinsgroup.org" },
  { name: "Stephanie Goodin", email: "sgoodin@eliteinsgroup.org" },
  { name: "Lori Wright", email: "lwright@eliteinsgroup.org" },
  { name: "Wes Mutta", email: "wmutta@eliteinsgroup.org" },
  { name: "Kyle Arnold", email: "karnold@eliteinsgroup.org" },
  { name: "Tyler Moore", email: "tmoore@eliteinsgroup.org" },
  { name: "Taylor Kitts", email: "tkitts@eliteinsgroup.org" },
  { name: "Angela Mattson", email: "amattson@eliteinsgroup.org" },
];

const requestedEmails = process.argv.slice(2);
const targets = requestedEmails.length > 0 ? roster.filter((person) => requestedEmails.includes(person.email)) : roster;

const unknown = requestedEmails.filter((email) => !roster.some((person) => person.email === email));
if (unknown.length > 0) {
  console.error(`Not on the roster, skipping: ${unknown.join(", ")}`);
}
if (targets.length === 0) {
  console.error("No matching associates to seed. Check the email address(es) passed in.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL in .env.local — see .env.example. Not seeding.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const sql = postgres(databaseUrl, { prepare: false });

// The invite email's link redirects here after Supabase verifies it. Must
// be a URL the *recipient's* browser can actually reach — localhost only
// works for whoever is running this script on their own machine. Set
// NEXT_PUBLIC_SITE_URL to your deployed URL before inviting anyone else.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    `[associates] NEXT_PUBLIC_SITE_URL not set — invite links will redirect to ${siteUrl}, which only works on this machine. Set it to your deployed URL in .env.local before inviting real people.`,
  );
}
const redirectTo = `${siteUrl}/staff/set-password`;

const { data: existingUsersPage, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;

for (const person of targets) {
  const existing = existingUsersPage.users.find((u) => u.email === person.email);

  // Whether to skip is decided from OUR OWN password_set_at column, never
  // Supabase's email_confirmed_at/last_sign_in_at — those get set the
  // moment an invite link is merely *fetched*, which corporate email
  // security scanners (e.g. Microsoft Defender Safe Links) do
  // automatically, before the real recipient ever opens the email. That's
  // exactly what silently broke the first real invite sent from this
  // script — see docs/backlog.md. password_set_at only gets set by
  // /api/staff/complete-setup, after a real password update actually
  // succeeds, so it can't be spoofed by a bot fetching a URL.
  if (existing) {
    const [row] = await sql`select password_set_at from associates where id = ${existing.id}`;
    if (row?.password_set_at) {
      console.log(`[associates] ${person.name} <${person.email}> already finished setup — skipping invite.`);
      continue;
    }
    // Never actually completed (or Supabase's own state is stale/wrong,
    // as above) — Supabase refuses to re-invite an existing email, and
    // there's no official "resend invite" API, so clear it and start
    // clean. Nothing of theirs is lost; they never finished setting up.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      console.error(`[associates] Couldn't clear ${person.email}'s stale invite:`, deleteError.message);
      continue;
    }
    console.log(`[associates] Cleared ${person.name}'s never-completed invite.`);
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(person.email, { redirectTo });
  if (error) {
    console.error(`[associates] Failed to invite ${person.email}:`, error.message);
    continue;
  }
  console.log(`[associates] Invited ${person.name} <${person.email}> (${data.user.id}).`);

  await sql`
    insert into associates (id, name, email, active)
    values (${data.user.id}, ${person.name}, ${person.email}, true)
    on conflict (id) do update set name = excluded.name, email = excluded.email, active = true
  `;
}

await sql.end();
console.log(`[associates] Done — ${targets.length} of ${roster.length} associates processed.`);
