import { desc } from "drizzle-orm";
import type { Lead } from "@/lib/schemas/lead";
import { getDb } from "@/lib/db/client";
import { leads as leadsTable } from "@/lib/db/schema";

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory array (not durable — resets on every server
 * restart, redeploy, or serverless cold start).
 */
const inMemoryLeads: Lead[] = [];

export async function addLead(lead: Lead): Promise<void> {
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
}

export async function getLeads(): Promise<readonly Lead[]> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
    return rows.map((row) => row.data as Lead);
  }
  return inMemoryLeads;
}
