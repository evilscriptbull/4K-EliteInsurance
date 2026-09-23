import { pgTable, uuid, timestamp, text, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";

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
  status: text("status").notNull(), // "in-progress" | "claimed" | "completed-unclaimed" | "completed-claimed" | "abandoned"
  familySlug: text("family_slug").notNull(),
  claimedBy: uuid("claimed_by"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  leadId: uuid("lead_id"),
  data: jsonb("data").notNull(),
});

/**
 * One row per chat message (customer answer, scripted bot prompt, human
 * associate message, or a system hand-off notice) — replaces storing the
 * transcript inside conversations.data.messages, which was a full-column
 * overwrite (updateConversation()) with no atomic append: a real race once
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
