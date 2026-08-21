import type { Lead } from "@/lib/schemas/lead";
import { priorityLines } from "@/lib/config/agency";

/**
 * Deterministic MVP placeholder — NOT the future AI Lead Warmer scoring
 * model (that's tracked in docs/backlog.md as separate Phase 2 work). This
 * exists only so form-submitted leads have a defensible score/tier rather
 * than a hardcoded constant, given leadSchema.leadScore is required.
 */
export function estimateLeadScore(lead: Pick<Lead, "line" | "contact" | "renewalUrgency">): number {
  let score = 40;

  if (lead.contact.phone) score += 15;
  if (lead.contact.smsConsent) score += 10;
  if (priorityLines.includes(lead.line)) score += 20;
  if (lead.renewalUrgency.hasActivePolicy === false) score += 15;

  return Math.max(0, Math.min(100, score));
}
