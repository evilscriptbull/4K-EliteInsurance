import type { Lead } from "@/lib/schemas/lead";
import type { StoredContactMessage } from "@/lib/contact/store";
import type { StoredClaim } from "@/lib/claims/store";
import { sendSms } from "@/lib/integrations/goto/client";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { siteUrl } from "@/lib/config/site";

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
 * Fires once per conversation, on the first successfully-processed answer
 * (see markStaffPinged, lib/conversations/store.ts) -- not on /start, which
 * used to ping staff before there was anything to act on (see docs/backlog.md
 * and tasks/todo.md Phase 0's "stop the page-load SMS"). All associates
 * share one notify number for now, so this is a heads-up, not a claim
 * mechanism -- claiming happens in the staff dashboard.
 */
export async function notifyScriptedChatFirstAnswer(params: {
  familySlug: string;
  conversationId: string;
  firstName?: string;
}): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const familyName = getQuoteFormFamily(params.familySlug)?.label ?? params.familySlug;
  const who = params.firstName ? ` from ${params.firstName}` : "";
  const dashboardUrl = `${siteUrl()}/staff/dashboard`;
  const text = `New Quick Quote Chat in progress${who} (${familyName}) — ${dashboardUrl}`;
  await sendSms(to, text);
}

/**
 * Fires whenever a Quick Quote Chat conversation finalizes into a Lead —
 * completed alone, chatted live then completed/released, or abandoned. This
 * text is currently the *only* place an associate learns what the customer
 * actually said (no dashboard lead detail view yet), so it's deliberately
 * more detailed than notifyNewLead's one-liner above. `lead.conversationSummary`
 * (set per-path by finalizeConversation, lib/conversations/finalize.ts)
 * carries the completed/claimed/released/abandoned framing and who handled
 * it, so this doesn't need to know the reason itself.
 */
export async function notifyScriptedChatLead(lead: Lead): Promise<void> {
  const to = getNotifyNumber();
  if (!to) return;

  const contactInfo = lead.contact.phone ?? lead.contact.email ?? "no contact info";
  const asset = lead.insuredAssets[0]?.description ?? lead.insuredAssets[0]?.kind;
  const completenessNote = lead.completeness === "partial" ? " (partial)" : "";
  const lines = [
    `Quick Quote Chat lead${completenessNote} (${lead.leadScoreTier}) — ${lead.line}`,
    `${lead.contact.firstName} ${lead.contact.lastName} — ${contactInfo}`,
    asset ? `Asset: ${asset}` : null,
    lead.intent,
    lead.conversationSummary,
  ].filter((line): line is string => Boolean(line));

  await sendSms(to, lines.join("\n"));
}
