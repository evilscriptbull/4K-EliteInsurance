import type { Lead } from "@/lib/schemas/lead";
import type { StoredContactMessage } from "@/lib/contact/store";
import type { StoredClaim } from "@/lib/claims/store";
import type { AgentBrief } from "@/lib/schemas/agentBrief";
import { sendSms } from "@/lib/integrations/goto/client";
import { sendEmail } from "@/lib/integrations/resend/client";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { siteUrl } from "@/lib/config/site";
import { agency } from "@/lib/config/agency";
import { formatLine } from "@/lib/format/insuranceLine";
import { AgentBriefEmail } from "@/components/emails/AgentBriefEmail";

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

/** US-centric: 10 digits -> assume +1; 11 digits starting with 1 -> as-is; already-"+"-prefixed -> digits only. Returns null if it can't produce something tel:-usable. */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const NEXT_ACTION_LABEL: Record<AgentBrief["content"]["recommendedNextAction"], string> = {
  "call-now": "Call now",
  "call-today": "Call today",
  "email-first": "Email first",
  "schedule-review": "Schedule review",
};

/**
 * Sends the internal email first (gated behind AGENT_BRIEF_EMAIL, default
 * off) so the SMS's "Brief emailed to ..." line can report what actually
 * happened, not what was merely attempted.
 */
async function maybeSendAgentBriefEmail(lead: Lead, brief: AgentBrief): Promise<boolean> {
  if (process.env.AGENT_BRIEF_EMAIL !== "true") return false;
  const result = await sendEmail(agency.email, `Agent brief: ${brief.content.headline}`, AgentBriefEmail({ lead, brief }));
  return result.sent;
}

/**
 * Fires once per Lead, scheduled via `after()` from finalizeConversation
 * and the static quote route (see tasks/archive's Agent Brief plan) --
 * replaces the old notifyScriptedChatLead/notifyNewLead one-liners now that
 * every lead gets a real brief instead. SMS capped at 4 lines; the full
 * detail goes to the optional internal email.
 */
export async function notifyAgentBrief(lead: Lead, brief: AgentBrief): Promise<void> {
  const emailSent = await maybeSendAgentBriefEmail(lead, brief);

  const to = getNotifyNumber();
  if (!to) return;

  const { content } = brief;
  const phoneLink = lead.contact.phone ? toE164(lead.contact.phone) : null;
  const missing = content.missingFields.slice(0, 2);

  const lines = [
    `${content.urgency.tier.toUpperCase()} ${formatLine(content.primaryLine)} lead — ${content.headline}`,
    `${lead.contact.firstName} ${lead.contact.lastName}${phoneLink ? ` · tel:${phoneLink}` : ""}`,
    `Next: ${NEXT_ACTION_LABEL[content.recommendedNextAction]} · Missing: ${missing.length > 0 ? missing.join(", ") : "nothing critical"}`,
    emailSent ? `Brief emailed to ${agency.email}` : null,
  ].filter((line): line is string => Boolean(line));

  await sendSms(to, lines.join("\n"));
}
