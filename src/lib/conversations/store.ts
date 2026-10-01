import { and, desc, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";
import type { ConversationState } from "@/lib/schemas/conversation";
import { getDb } from "@/lib/db/client";
import { conversations as conversationsTable } from "@/lib/db/schema";
import {
  inMemoryConversations,
  transition,
  type ConversationStatus,
  type StoredConversation,
} from "@/lib/conversations/lifecycle";

export type { ConversationStatus, StoredConversation };

export async function createConversation(conversation: StoredConversation): Promise<void> {
  const db = getDb();
  if (db) {
    await db.insert(conversationsTable).values({
      id: conversation.id,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      status: conversation.status,
      familySlug: conversation.familySlug,
      claimedBy: conversation.claimedBy,
      claimedAt: conversation.claimedAt ? new Date(conversation.claimedAt) : null,
      leadId: conversation.leadId,
      data: conversation.state,
      ipHash: conversation.ipHash,
    });
  } else {
    inMemoryConversations.set(conversation.id, conversation);
  }
}

function rowToStored(row: typeof conversationsTable.$inferSelect): StoredConversation {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status as ConversationStatus,
    familySlug: row.familySlug,
    claimedBy: row.claimedBy,
    claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
    leadId: row.leadId,
    state: row.data as ConversationState,
    ipHash: row.ipHash,
  };
}

/**
 * How many conversations a given IP hash has started in the last
 * `sinceMs` -- feeds /api/scripted-chat/start's abuse-protection check.
 * Counts by `createdAt` (not `updatedAt`), so answering more questions on
 * an existing conversation never inflates the count.
 */
export async function countRecentConversationsByIpHash(ipHash: string, sinceMs: number): Promise<number> {
  const cutoff = new Date(Date.now() - sinceMs);
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(and(eq(conversationsTable.ipHash, ipHash), gte(conversationsTable.createdAt, cutoff)));
    return rows.length;
  }
  return [...inMemoryConversations.values()].filter(
    (c) => c.ipHash === ipHash && new Date(c.createdAt) >= cutoff,
  ).length;
}

export async function getConversation(id: string): Promise<StoredConversation | null> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    return rows[0] ? rowToStored(rows[0]) : null;
  }
  return inMemoryConversations.get(id) ?? null;
}

/**
 * Updates the transcript/collected-answers and (usually) status of a
 * conversation. Used for finalization -- NOT used for claiming/releasing/
 * completing (lifecycle.ts's transition()) or per-answer merges (mergeAnswer
 * below), which both have their own atomic paths.
 */
export async function updateConversation(
  id: string,
  updates: { state: ConversationState; status?: ConversationStatus; leadId?: string },
): Promise<void> {
  const now = new Date().toISOString();
  const db = getDb();
  if (db) {
    await db
      .update(conversationsTable)
      .set({
        data: updates.state,
        updatedAt: new Date(now),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.leadId ? { leadId: updates.leadId } : {}),
      })
      .where(eq(conversationsTable.id, id));
    return;
  }
  const existing = inMemoryConversations.get(id);
  if (!existing) return;
  inMemoryConversations.set(id, {
    ...existing,
    state: updates.state,
    updatedAt: now,
    status: updates.status ?? existing.status,
    leadId: updates.leadId ?? existing.leadId,
  });
}

/**
 * Merges new answer fields into `data.collectedFields` and updates
 * `currentStepId` in one atomic statement, guarded by status = "in-progress"
 * -- replaces a whole-blob read-then-write on every answer. Returns false if
 * the guard didn't hold (the conversation was claimed or ended between the
 * caller's read and this write); the caller re-fetches and returns the real
 * current status instead of assuming the merge applied.
 */
export async function mergeAnswer(
  id: string,
  updates: { currentStepId: string | null; newFields: Record<string, unknown> },
): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const newFieldsJson = JSON.stringify(updates.newFields);
    const currentStepIdJson = JSON.stringify(updates.currentStepId);
    const result = await db
      .update(conversationsTable)
      .set({
        data: sql`jsonb_set(
          jsonb_set(${conversationsTable.data}, '{collectedFields}', (${conversationsTable.data}->'collectedFields') || ${newFieldsJson}::jsonb),
          '{currentStepId}', ${currentStepIdJson}::jsonb
        )`,
        updatedAt: now,
      })
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.status, "in-progress")))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }

  const existing = inMemoryConversations.get(id);
  if (!existing || existing.status !== "in-progress") return false;
  inMemoryConversations.set(id, {
    ...existing,
    updatedAt: now.toISOString(),
    state: {
      ...existing.state,
      currentStepId: updates.currentStepId ?? undefined,
      collectedFields: { ...existing.state.collectedFields, ...updates.newFields },
    },
  });
  return true;
}

/**
 * Sets `data.staffPingedAt` the first time it's called for a conversation,
 * atomically -- the guard for firing the staff SMS exactly once, on
 * whichever request happens to be the first valid answer (see
 * notifyScriptedChatFirstAnswer, lib/notifications/leadNotify.ts). Returns
 * false on every call after the first, including a concurrent/retried
 * request that raced the winning one.
 */
export async function markStaffPinged(id: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({
        data: sql`jsonb_set(${conversationsTable.data}, '{staffPingedAt}', ${JSON.stringify(now.toISOString())}::jsonb)`,
        updatedAt: now,
      })
      .where(and(eq(conversationsTable.id, id), sql`(${conversationsTable.data}->>'staffPingedAt') IS NULL`))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }

  const existing = inMemoryConversations.get(id);
  if (!existing || existing.state.staffPingedAt !== undefined) return false;
  inMemoryConversations.set(id, {
    ...existing,
    updatedAt: now.toISOString(),
    state: { ...existing.state, staffPingedAt: now.toISOString() },
  });
  return true;
}

/**
 * Links a Lead to a conversation, but only if it doesn't already have one --
 * guards finalizeConversation (lib/conversations/finalize.ts) against a
 * concurrent double-finalize creating two Leads for the same conversation.
 * Returns false if a leadId was already set.
 */
export async function setLeadIdIfMissing(id: string, leadId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({ leadId, updatedAt: now })
      .where(and(eq(conversationsTable.id, id), isNull(conversationsTable.leadId)))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }
  const existing = inMemoryConversations.get(id);
  if (!existing || existing.leadId) return false;
  inMemoryConversations.set(id, { ...existing, leadId, updatedAt: now.toISOString() });
  return true;
}

/**
 * Atomic claim: only succeeds if the conversation is currently in-progress.
 * Returns false (not an error) if it's already claimed or otherwise no
 * longer live -- the caller is responsible for telling the associate that,
 * rather than silently overwriting.
 */
export async function claimConversation(id: string, associateId: string): Promise<boolean> {
  const now = new Date().toISOString();
  return transition(id, { from: ["in-progress"], to: "claimed", set: { claimedBy: associateId, claimedAt: now } });
}

/**
 * Ends the associate's live takeover -- only succeeds for the associate who
 * claimed it. Transitions to "released", not back to "in-progress": the
 * customer's chat already ended (hand-off message sent), so there's nothing
 * left to resume, and this status heads toward a Lead via
 * finalizeConversation and Needs Follow-up instead of stranding as a
 * perpetually-unclaimed Live Queue item. claimedBy/claimedAt are left as-is,
 * a record of who handled it.
 */
export async function releaseConversation(id: string, associateId: string): Promise<boolean> {
  return transition(id, { from: ["claimed"], to: "released", claimedBy: associateId });
}

/**
 * Closes out a claimed conversation the associate handled directly (e.g. by
 * phone) -- only succeeds for the associate who claimed it.
 */
export async function completeConversation(id: string, associateId: string): Promise<boolean> {
  return transition(id, { from: ["claimed"], to: "completed-claimed", claimedBy: associateId });
}

/**
 * In-progress conversations that have gone quiet -- nobody claimed them and
 * the customer hasn't answered in a while. Feeds the abandon sweeper
 * (src/app/api/cron/sweep-conversations/route.ts); "idle" is measured by
 * updatedAt, which mergeAnswer bumps on every answer, so a conversation the
 * customer is actively working through never qualifies.
 */
export async function listIdleInProgress(olderThanMs: number): Promise<readonly StoredConversation[]> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(and(eq(conversationsTable.status, "in-progress"), lt(conversationsTable.updatedAt, cutoff)));
    return rows.map(rowToStored);
  }
  return [...inMemoryConversations.values()].filter(
    (c) => c.status === "in-progress" && new Date(c.updatedAt) < cutoff,
  );
}

/**
 * Caps the Live Queue's own query -- unlike the follow-up backlog (which
 * can genuinely pile up and needs its own "show more"), this is inherently
 * bounded to conversations actually active right now; a limit here is
 * pure defense against an unbounded query, not a UX feature, so no "show
 * more" affordance is needed for it.
 */
const LIVE_QUEUE_LIMIT = 100;

/** In-progress and claimed conversations — the live-queue dashboard view. */
export async function listLive(): Promise<readonly StoredConversation[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(inArray(conversationsTable.status, ["in-progress", "claimed"]))
      .orderBy(desc(conversationsTable.updatedAt))
      .limit(LIVE_QUEUE_LIMIT);
    return rows.map(rowToStored);
  }
  return [...inMemoryConversations.values()]
    .filter((c) => c.status === "in-progress" || c.status === "claimed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, LIVE_QUEUE_LIMIT);
}
