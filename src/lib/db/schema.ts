import { pgTable, uuid, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core";

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
