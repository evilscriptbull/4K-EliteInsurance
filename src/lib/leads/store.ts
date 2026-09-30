import { desc, eq } from "drizzle-orm";
import type { Lead } from "@/lib/schemas/lead";
import { getDb } from "@/lib/db/client";
import { leads as leadsTable } from "@/lib/db/schema";
import { createLeadOutcome } from "@/lib/leads/outcomes";

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory array (not durable — resets on every server
 * restart, redeploy, or serverless cold start).
 */
const inMemoryLeads: Lead[] = [];

/**
 * The only place a Lead is ever stored -- also the only place its
 * lead_outcomes row gets created (see createLeadOutcome), so neither of the
 * two call sites (the quote route, finalizeConversation) can forget it.
 * `assignedTo` is non-null exactly when the lead came from a chat an
 * associate had already claimed.
 */
export async function addLead(lead: Lead, options?: { assignedTo?: string | null }): Promise<void> {
  console.log(`[lead] ${lead.id} — ${lead.line} — ${lead.contact.firstName} ${lead.contact.lastName}`);

  const db = getDb();
  if (db) {
    await db.insert(leadsTable).values({
      id: lead.id,
      createdAt: new Date(lead.createdAt),
      line: lead.line,
      leadScore: lead.leadScore,
      leadScoreTier: lead.leadScoreTier,
      data: lead,
    });
  } else {
    inMemoryLeads.push(lead);
  }

  await createLeadOutcome(lead.id, options?.assignedTo ?? null);
}

export async function getLeads(): Promise<readonly Lead[]> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
    return rows.map((row) => row.data as Lead);
  }
  return inMemoryLeads;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(leadsTable).where(eq(leadsTable.id, id)).limit(1);
    return (rows[0]?.data as Lead) ?? null;
  }
  return inMemoryLeads.find((lead) => lead.id === id) ?? null;
}
