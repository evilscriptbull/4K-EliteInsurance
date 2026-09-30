import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { leadOutcomes as leadOutcomesTable } from "@/lib/db/schema";

export type LeadOutcomeStatus = "new" | "contacted" | "quoted" | "bound" | "lost" | "unreachable";

export interface LeadOutcome {
  leadId: string;
  assignedTo: string | null;
  status: LeadOutcomeStatus;
  writtenPremium: number | null;
  carrier: string | null;
  notes: string | null;
  updatedBy: string | null;
  updatedAt: string;
  contactedAt: string | null;
  quotedAt: string | null;
  boundAt: string | null;
}

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory map (not durable), same contract as
 * lib/leads/store.ts's inMemoryLeads.
 */
const inMemoryLeadOutcomes = new Map<string, LeadOutcome>();

function rowToLeadOutcome(row: typeof leadOutcomesTable.$inferSelect): LeadOutcome {
  return {
    leadId: row.leadId,
    assignedTo: row.assignedTo,
    status: row.status as LeadOutcomeStatus,
    writtenPremium: row.writtenPremium,
    carrier: row.carrier,
    notes: row.notes,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
    contactedAt: row.contactedAt ? row.contactedAt.toISOString() : null,
    quotedAt: row.quotedAt ? row.quotedAt.toISOString() : null,
    boundAt: row.boundAt ? row.boundAt.toISOString() : null,
  };
}

/**
 * Called once per Lead, from addLead() (lib/leads/store.ts) -- the single
 * place a Lead is ever stored is the single place its outcome row gets
 * created, so no caller can forget it. `assignedTo` is non-null exactly
 * when the lead came from a chat an associate had already claimed.
 */
export async function createLeadOutcome(leadId: string, assignedTo: string | null): Promise<void> {
  const now = new Date();
  const db = getDb();
  if (db) {
    await db.insert(leadOutcomesTable).values({ leadId, assignedTo, status: "new", updatedAt: now });
    return;
  }
  inMemoryLeadOutcomes.set(leadId, {
    leadId,
    assignedTo,
    status: "new",
    writtenPremium: null,
    carrier: null,
    notes: null,
    updatedBy: null,
    updatedAt: now.toISOString(),
    contactedAt: null,
    quotedAt: null,
    boundAt: null,
  });
}

/** One query for a batch of leads (e.g. the follow-up queue), not one lookup per card. */
export async function getLeadOutcomesByIds(leadIds: string[]): Promise<LeadOutcome[]> {
  if (leadIds.length === 0) return [];
  const db = getDb();
  if (db) {
    const rows = await db.select().from(leadOutcomesTable).where(inArray(leadOutcomesTable.leadId, leadIds));
    return rows.map(rowToLeadOutcome);
  }
  return leadIds.map((id) => inMemoryLeadOutcomes.get(id)).filter((outcome): outcome is LeadOutcome => Boolean(outcome));
}

/** Atomic claim: only succeeds if the lead is currently unassigned. */
export async function takeLeadOutcome(leadId: string, associateId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(leadOutcomesTable)
      .set({ assignedTo: associateId, updatedAt: now })
      .where(and(eq(leadOutcomesTable.leadId, leadId), isNull(leadOutcomesTable.assignedTo)))
      .returning({ leadId: leadOutcomesTable.leadId });
    return result.length > 0;
  }
  const existing = inMemoryLeadOutcomes.get(leadId);
  if (!existing || existing.assignedTo !== null) return false;
  inMemoryLeadOutcomes.set(leadId, { ...existing, assignedTo: associateId, updatedAt: now.toISOString() });
  return true;
}

/** Atomic release: only succeeds for the associate who currently has it. */
export async function releaseLeadOutcome(leadId: string, associateId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(leadOutcomesTable)
      .set({ assignedTo: null, updatedAt: now })
      .where(and(eq(leadOutcomesTable.leadId, leadId), eq(leadOutcomesTable.assignedTo, associateId)))
      .returning({ leadId: leadOutcomesTable.leadId });
    return result.length > 0;
  }
  const existing = inMemoryLeadOutcomes.get(leadId);
  if (!existing || existing.assignedTo !== associateId) return false;
  inMemoryLeadOutcomes.set(leadId, { ...existing, assignedTo: null, updatedAt: now.toISOString() });
  return true;
}

/**
 * Logs progress on a lead -- open to any active associate regardless of
 * assignment (matches this queue's existing shared-visibility model; taking
 * a lead isn't a prerequisite for logging what happened). Sets
 * contacted/quoted/bound timestamps the first time (and only the first
 * time) that status is reached, via a guarded UPDATE mirroring mergeAnswer's
 * conditional-write style -- no read-then-write. Returns false only if the
 * lead has no outcome row at all (shouldn't happen; every Lead gets one).
 */
export async function logLeadOutcome(
  leadId: string,
  associateId: string,
  updates: { status: LeadOutcomeStatus; writtenPremium?: number; carrier?: string; notes?: string },
): Promise<boolean> {
  const now = new Date();
  const nowIso = now.toISOString();
  const { status, writtenPremium, carrier, notes } = updates;
  const db = getDb();
  if (db) {
    const result = await db
      .update(leadOutcomesTable)
      .set({
        status,
        updatedBy: associateId,
        updatedAt: now,
        ...(writtenPremium !== undefined ? { writtenPremium } : {}),
        ...(carrier !== undefined ? { carrier } : {}),
        ...(notes !== undefined ? { notes } : {}),
        contactedAt: sql`CASE WHEN ${status} IN ('contacted','quoted','bound') AND ${leadOutcomesTable.contactedAt} IS NULL THEN ${nowIso}::timestamptz ELSE ${leadOutcomesTable.contactedAt} END`,
        quotedAt: sql`CASE WHEN ${status} IN ('quoted','bound') AND ${leadOutcomesTable.quotedAt} IS NULL THEN ${nowIso}::timestamptz ELSE ${leadOutcomesTable.quotedAt} END`,
        boundAt: sql`CASE WHEN ${status} = 'bound' AND ${leadOutcomesTable.boundAt} IS NULL THEN ${nowIso}::timestamptz ELSE ${leadOutcomesTable.boundAt} END`,
      })
      .where(eq(leadOutcomesTable.leadId, leadId))
      .returning({ leadId: leadOutcomesTable.leadId });
    return result.length > 0;
  }

  const existing = inMemoryLeadOutcomes.get(leadId);
  if (!existing) return false;
  inMemoryLeadOutcomes.set(leadId, {
    ...existing,
    status,
    updatedBy: associateId,
    updatedAt: now.toISOString(),
    writtenPremium: writtenPremium ?? existing.writtenPremium,
    carrier: carrier ?? existing.carrier,
    notes: notes ?? existing.notes,
    contactedAt: ["contacted", "quoted", "bound"].includes(status) ? (existing.contactedAt ?? now.toISOString()) : existing.contactedAt,
    quotedAt: ["quoted", "bound"].includes(status) ? (existing.quotedAt ?? now.toISOString()) : existing.quotedAt,
    boundAt: status === "bound" ? (existing.boundAt ?? now.toISOString()) : existing.boundAt,
  });
  return true;
}
