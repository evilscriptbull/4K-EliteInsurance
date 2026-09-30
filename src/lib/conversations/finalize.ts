import type { Lead } from "@/lib/schemas/lead";
import type { StoredConversation } from "@/lib/conversations/lifecycle";
import { getConversation, setLeadIdIfMissing } from "@/lib/conversations/store";
import { addLead, getLeadById } from "@/lib/leads/store";
import { getAssociate } from "@/lib/associates/store";
import { getScriptedFlow } from "@/lib/scripted-chat/flows";
import { scriptedAnswersToLead, conversationToPartialLead, scriptedStepProgress } from "@/lib/scripted-chat/finalize";
import { notifyScriptedChatLead } from "@/lib/notifications/leadNotify";
import { sendQuoteConfirmationEmail } from "@/lib/notifications/emailNotify";
import { pushLeadToEZLynx } from "@/lib/integrations/ezlynx/adapter";

export type FinalizeReason = "completed-unclaimed" | "completed-claimed" | "released" | "abandoned";

/**
 * Per-path conversationSummary (2.5): who the customer talked to (if
 * anyone) and how far they got, since the generic summaries the mappers
 * produce don't know the terminal `reason` or the claiming associate.
 */
async function buildConversationSummary(reason: FinalizeReason, conversation: StoredConversation): Promise<string> {
  const associateName = conversation.claimedBy ? (await getAssociate(conversation.claimedBy))?.name : undefined;
  const flow = getScriptedFlow(conversation.familySlug);
  const progress = flow ? scriptedStepProgress(flow, conversation.state.currentStepId) : null;

  switch (reason) {
    case "completed-unclaimed":
      return `Completed the Quick Quote Chat (${conversation.familySlug}) — answered every question without an agent joining live.`;
    case "completed-claimed":
      return associateName
        ? `Chatted live with ${associateName}, who marked the conversation complete.`
        : "Chatted live with an associate, who marked the conversation complete.";
    case "released":
      return associateName
        ? `Released by ${associateName}${progress ? ` after ${progress.answeredCount} of ${progress.totalCount} questions` : ""} — the associate stepped away before finishing.`
        : "Released by an associate before finishing.";
    case "abandoned":
      return progress
        ? `Left the Quick Quote Chat (${conversation.familySlug}) after ${progress.answeredCount} of ${progress.totalCount} questions.`
        : `Left the Quick Quote Chat (${conversation.familySlug}) before finishing.`;
  }
}

/**
 * The single place every terminal conversation transition (flow completion,
 * Mark Complete, Release, the abandon sweeper) goes through to produce a
 * Lead. Idempotent -- a conversation that already has a leadId is left
 * alone (its existing Lead is returned), so calling this more than once for
 * the same conversation is safe. Tries a full parse first (every required
 * form field was actually answered); falls back to a best-effort partial
 * Lead otherwise. Returns null if there isn't even a name or a way to reach
 * the prospect -- nothing worth a Lead.
 */
export async function finalizeConversation(id: string, reason: FinalizeReason): Promise<Lead | null> {
  const conversation = await getConversation(id);
  if (!conversation) return null;
  if (conversation.leadId) return getLeadById(conversation.leadId);

  const answers = conversation.state.collectedFields;
  const source = conversation.state.source ?? {};

  let lead: Lead | null;
  try {
    lead = scriptedAnswersToLead(conversation.familySlug, answers, source);
  } catch {
    const flow = getScriptedFlow(conversation.familySlug);
    lead = flow
      ? conversationToPartialLead(flow, conversation.familySlug, answers, conversation.state.currentStepId, source)
      : null;
  }
  if (!lead) return null;

  lead = { ...lead, conversationSummary: await buildConversationSummary(reason, conversation) };

  const linked = await setLeadIdIfMissing(id, lead.id);
  if (!linked) {
    // A concurrent finalize already won -- return whatever it created.
    const current = await getConversation(id);
    return current?.leadId ? getLeadById(current.leadId) : null;
  }

  // Non-null exactly when an associate handled this chat -- satisfies
  // "leads reached from a claimed chat start as assigned to the claimer"
  // (tasks/todo.md 3.4).
  await addLead(lead, { assignedTo: conversation.claimedBy });

  const sideEffects: Promise<unknown>[] = [notifyScriptedChatLead(lead), pushLeadToEZLynx(lead)];
  if (reason === "completed-unclaimed") {
    // An associate who just handled the customer live already gave them
    // context in the moment -- Elite's own auto-confirmation email is only
    // for the fully self-serve path where nobody talked to them.
    sideEffects.push(sendQuoteConfirmationEmail(lead));
  }
  await Promise.all(sideEffects);

  return lead;
}
