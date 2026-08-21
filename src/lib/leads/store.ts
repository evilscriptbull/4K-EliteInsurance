import type { Lead } from "@/lib/schemas/lead";

/**
 * In-memory only — resets on every server restart, redeploy, or serverless
 * cold start. This is NOT real persistence. It exists so this pass has an
 * observable landing spot for submitted leads without standing up
 * Postgres/Supabase this session. Real persistence and the EZLynx push are
 * tracked in docs/backlog.md.
 */
const leads: Lead[] = [];

export function addLead(lead: Lead): void {
  leads.push(lead);
  console.log(`[lead] ${lead.id} — ${lead.line} — ${lead.contact.firstName} ${lead.contact.lastName}`);
}

export function getLeads(): readonly Lead[] {
  return leads;
}
