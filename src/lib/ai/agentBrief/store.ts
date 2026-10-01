import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { agentBriefs as agentBriefsTable } from "@/lib/db/schema";
import type { AgentBrief } from "@/lib/schemas/agentBrief";

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory array (not durable), same contract as
 * lib/leads/store.ts's inMemoryLeads.
 */
const inMemoryBriefs: AgentBrief[] = [];

export async function saveAgentBrief(brief: AgentBrief): Promise<void> {
  const db = getDb();
  if (db) {
    await db.insert(agentBriefsTable).values({
      id: brief.id,
      leadId: brief.leadId,
      conversationId: brief.conversationId,
      createdAt: new Date(brief.createdAt),
      origin: brief.origin,
      model: brief.model,
      promptVersion: brief.promptVersion,
      data: brief,
    });
    return;
  }
  inMemoryBriefs.push(brief);
}

/** The most recently generated brief for a lead, if any. */
export async function getAgentBriefForLead(leadId: string): Promise<AgentBrief | null> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(agentBriefsTable)
      .where(eq(agentBriefsTable.leadId, leadId))
      .orderBy(desc(agentBriefsTable.createdAt))
      .limit(1);
    return (rows[0]?.data as AgentBrief) ?? null;
  }
  const matches = inMemoryBriefs.filter((brief) => brief.leadId === leadId);
  if (matches.length === 0) return null;
  return matches.reduce((latest, brief) => (brief.createdAt > latest.createdAt ? brief : latest));
}

/**
 * One query for a batch of leads (e.g. the follow-up queue), not one lookup
 * per card -- same pattern as leads/outcomes.ts's getLeadOutcomesByIds.
 */
export async function getAgentBriefsForLeadIds(leadIds: string[]): Promise<Map<string, AgentBrief>> {
  if (leadIds.length === 0) return new Map();
  const db = getDb();
  const byLeadId = new Map<string, AgentBrief>();

  if (db) {
    const rows = await db
      .select()
      .from(agentBriefsTable)
      .where(inArray(agentBriefsTable.leadId, leadIds))
      .orderBy(desc(agentBriefsTable.createdAt));
    for (const row of rows) {
      // Rows are ordered newest-first; only keep the first (latest) per leadId.
      if (!byLeadId.has(row.leadId)) byLeadId.set(row.leadId, row.data as AgentBrief);
    }
    return byLeadId;
  }

  for (const leadId of leadIds) {
    const brief = await getAgentBriefForLead(leadId);
    if (brief) byLeadId.set(leadId, brief);
  }
  return byLeadId;
}
