import { pgTable, uuid, timestamp, text, integer, jsonb, boolean } from "drizzle-orm/pg-core";

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
 */
export const associates = pgTable("associates", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  active: boolean("active").notNull().default(true),
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
