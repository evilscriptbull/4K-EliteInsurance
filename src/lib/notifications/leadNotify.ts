import type { Lead } from "@/lib/schemas/lead";
import type { StoredContactMessage } from "@/lib/contact/store";
import type { StoredClaim } from "@/lib/claims/store";
import { sendSms } from "@/lib/integrations/goto/client";

/**
 * Internal staff SMS notifications via GoTo — not customer-facing copy, so
 * lib/compliance/guardrails.ts's violatesGuardrails() doesn't apply here
 * (same reasoning as the API routes it's called from). No-ops safely if
 * GOTO_NOTIFY_PHONE_NUMBER or GoTo credentials aren't configured, via
 * sendSms's own no-op contract.
 */

function getNotifyNumber(): string | undefined {
  const to = process.env.GOTO_NOTIFY_PHONE_NUMBER;
  if (!to) {
    console.log("[goto] Notification not sent — GOTO_NOTIFY_PHONE_NUMBER not configured.");
  }
  return to;
}

export async function notifyNewLead(lead: Lead): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const contactInfo = lead.contact.phone ?? lead.contact.email ?? "no contact info";
  const text = `New ${lead.line} lead (${lead.leadScoreTier}): ${lead.contact.firstName} ${lead.contact.lastName}, ${contactInfo}`;
  await sendSms(to, text);
}

export async function notifyNewContactMessage(message: StoredContactMessage): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const text = `New contact form message: ${message.firstName} ${message.lastName}, ${message.phone}`;
  await sendSms(to, text);
}

export async function notifyNewClaim(claim: StoredClaim): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const text = `New claim filed: ${claim.firstName} ${claim.lastName}, policy ${claim.policyNumber}`;
  await sendSms(to, text);
}

/**
 * Fires the moment a Quick Quote Chat starts — before any answers exist,
 * so there's no lead data yet to include. All associates share one notify
 * number for now (see docs/backlog.md), so this is a heads-up, not a claim
 * mechanism; claiming happens in the staff dashboard once it's built.
 */
export async function notifyScriptedChatStarted(familySlug: string, conversationId: string): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const text = `New Quick Quote Chat started (${familySlug}). No details yet — conversation ${conversationId.slice(0, 8)}.`;
  await sendSms(to, text);
}

/**
 * Fires when a Quick Quote Chat finishes with nobody having claimed it —
 * this text is currently the *only* place an associate learns what the
 * customer actually said (no staff dashboard yet), so it's deliberately
 * more detailed than notifyNewLead's one-liner above.
 */
export async function notifyScriptedChatLead(lead: Lead): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const contactInfo = lead.contact.phone ?? lead.contact.email ?? "no contact info";
  const asset = lead.insuredAssets[0]?.description ?? lead.insuredAssets[0]?.kind;
  const lines = [
    `Quick Quote Chat completed, unclaimed (${lead.leadScoreTier}) — ${lead.line}`,
    `${lead.contact.firstName} ${lead.contact.lastName} — ${contactInfo}`,
    asset ? `Asset: ${asset}` : null,
    lead.intent,
  ].filter((line): line is string => Boolean(line));

  await sendSms(to, lines.join("\n"));
}
