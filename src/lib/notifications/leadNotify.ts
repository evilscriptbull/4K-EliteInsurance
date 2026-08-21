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
