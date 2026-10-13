import { pgTable, uuid, timestamp, text, integer, numeric, jsonb, boolean, index } from "drizzle-orm/pg-core";

/**
 * Durable storage for the 3 form-submission types. Deliberately JSONB +
 * a handful of indexed columns rather than a fully normalized schema —
 * `data` holds the full zod-validated object (Lead / StoredClaim /
 * StoredContactMessage, see src/lib/schemas/) so schema evolution in those
 * types doesn't require a migration for every field change. The real
 * columns exist only for the filtering/sorting queries that actually
 * matter.
 */

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  line: text("line").notNull(),
  leadScore: integer("lead_score").notNull(),
  leadScoreTier: text("lead_score_tier").notNull(),
  data: jsonb("data").notNull(),
});

/**
 * One row per Lead, created the moment the Lead is (see addLead,
 * lib/leads/store.ts, the single place that happens) — tracks what an
 * associate has actually done with it, which `leads`/`data` itself has no
 * concept of. `leadId` is a real FK since `leads` is owned entirely by this
 * app (same reasoning as conversationMessages.conversationId below);
 * `assignedTo`/`updatedBy` are plain non-FK uuids referencing associates.id,
 * matching conversations.claimedBy's established convention (associates.id
 * mirrors Supabase auth.users.id, not a table this schema itself owns).
 *
 * RLS: enabled with a SELECT policy for active associates, reusing
 * public.is_active_associate() (migrations/0005_active_associate_realtime_policy.sql)
 * -- a deliberate deviation from a stricter "no policies" default, made
 * because the follow-up queue's Take/Log outcome/Release actions need to
 * update a *second* associate's dashboard live, and DashboardLiveRefresh's
 * only mechanism is a client-side Realtime postgres_changes subscription,
 * which needs a SELECT policy to receive anything. Safe for the same reason
 * migration 0004 accepted it for `conversations`: every active associate
 * can already see every open lead's outcome via the server-rendered
 * follow-up queue, so this introduces no new exposure -- it only unblocks
 * the browser's own subscription.
 */
export const leadOutcomes = pgTable("lead_outcomes", {
  leadId: uuid("lead_id")
    .primaryKey()
    .references(() => leads.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to"),
  status: text("status").notNull().default("new"), // "new" | "contacted" | "quoted" | "bound" | "lost" | "unreachable"
  writtenPremium: numeric("written_premium", { mode: "number" }),
  carrier: text("carrier"),
  notes: text("notes"),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  contactedAt: timestamp("contacted_at", { withTimezone: true }),
  quotedAt: timestamp("quoted_at", { withTimezone: true }),
  boundAt: timestamp("bound_at", { withTimezone: true }),
});

/**
 * One row per generated Agent Brief (see src/lib/ai/agentBrief/generate.ts)
 * -- an internal, staff-only pre-call brief, never shown to the customer.
 * `leadId` is a real FK, same reasoning as `leadOutcomes.leadId` above
 * (`leads` is owned entirely by this app). `conversationId` stays a plain
 * nullable uuid, no FK -- the static quote-form path has no conversation
 * at all. `data` holds the full zod-validated `AgentBrief`
 * (src/lib/schemas/agentBrief.ts).
 *
 * RLS: enabled with NO policies -- unlike `leadOutcomes`, nothing here
 * ever needs a client-side Realtime subscription (the dashboard reads
 * briefs via a normal server-rendered fetch, not a live update), so this
 * matches `conversationMessages`' stricter default-deny precedent instead.
 */
export const agentBriefs = pgTable(
  "agent_briefs",
  {
    id: uuid("id").primaryKey(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    origin: text("origin").notNull(), // "model" | "fallback"
    model: text("model"),
    promptVersion: text("prompt_version").notNull(),
    data: jsonb("data").notNull(),
  },
  (table) => [index("agent_briefs_lead_id_idx").on(table.leadId)],
);

export const claims = pgTable("claims", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  policyNumber: text("policy_number").notNull(),
  data: jsonb("data").notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  data: jsonb("data").notNull(),
});

/**
 * Sales-team roster for the Scripted Lead Warmer's live-chat ping/takeover
 * feature (see docs/backlog.md). `id` matches the Supabase Auth user id
 * (auth.users.id) for that person — this table only holds the profile
 * fields Supabase Auth doesn't, not credentials. Seeded from
 * scripts/seed-associates.mjs.
 *
 * `passwordSetAt` is our own source of truth for "did this person actually
 * finish setup" — deliberately NOT derived from Supabase's
 * email_confirmed_at/last_sign_in_at, because those get set the moment an
 * invite link is merely *fetched*, which corporate email security scanners
 * (e.g. Microsoft Defender Safe Links) do automatically and silently,
 * before the real recipient ever sees the email. Set by
 * /api/staff/complete-setup once /staff/set-password's updateUser() call
 * actually succeeds — see that route for why this can't be trusted from
 * Supabase's own metadata.
 */
export const associates = pgTable("associates", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  active: boolean("active").notNull().default(true),
  passwordSetAt: timestamp("password_set_at", { withTimezone: true }),
});

/**
 * Scripted Lead Warmer conversation state — one row per chat session.
 * `familySlug` matches quoteFormFamilies' slugs (src/lib/config/quote-forms.ts).
 * `claimedBy` references associates.id; null means unclaimed. `data` holds
 * the full ConversationState (src/lib/schemas/conversation.ts) — transcript
 * plus collected answers — same JSONB-plus-a-few-columns pattern as leads/
 * claims/contact_messages above.
 */
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  status: text("status").notNull(), // "in-progress" | "claimed" | "completed-unclaimed" | "completed-claimed" | "released" | "abandoned"
  familySlug: text("family_slug").notNull(),
  claimedBy: uuid("claimed_by"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  leadId: uuid("lead_id"),
  data: jsonb("data").notNull(),
  // Salted SHA-256 of the client IP that started this conversation (see
  // RATE_LIMIT_SALT, .env.example) -- lets /api/scripted-chat/start rate-limit
  // by IP without storing the IP itself. Null for conversations created
  // before this column existed.
  ipHash: text("ip_hash"),
});

/**
 * One row per chat message (customer answer, scripted bot prompt, human
 * associate message, or a system hand-off notice) — replaces storing the
 * transcript inside the conversations.data jsonb blob (a `messages` key that
 * no longer exists in the schema; old rows may still carry one, ignored on
 * parse), which was a full-column overwrite (updateConversation()) with no
 * atomic append: a real race once
 * both a customer and an associate can write near-simultaneously (see the
 * live-takeover plan, docs/backlog.md). `authorAssociateId` is set only
 * when role === "associate"; null otherwise.
 *
 * RLS is enabled with NO policies — default-deny for every role, including
 * `authenticated`. This table holds customer PII (names, phone, DOB,
 * vehicle info) and customers hold no Supabase Auth session, so it must
 * only ever be touched by the service-role admin client server-side, or
 * delivered live via Realtime Broadcast on a per-conversation channel
 * (never postgres_changes, and never a client-side SELECT policy).
 */
export const conversationMessages = pgTable(
  "conversation_messages",
  {
    id: uuid("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant" | "system" | "associate"
    content: text("content").notNull(),
    authorAssociateId: uuid("author_associate_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("conversation_messages_conversation_id_created_at_idx").on(table.conversationId, table.createdAt)],
);
