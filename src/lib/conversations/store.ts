import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import type { ConversationState } from "@/lib/schemas/conversation";
import { getDb } from "@/lib/db/client";
import { conversations as conversationsTable } from "@/lib/db/schema";

export type ConversationStatus = "in-progress" | "claimed" | "completed-unclaimed" | "completed-claimed" | "abandoned";

export interface StoredConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ConversationStatus;
  familySlug: string;
  claimedBy: string | null;
  claimedAt: string | null;
  leadId: string | null;
  state: ConversationState;
}

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory map (not durable), same contract as
 * lib/leads/store.ts.
 */
const inMemoryConversations = new Map<string, StoredConversation>();

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
  };
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
 * conversation. Used for every scripted-answer turn and for finalization —
 * NOT used for claiming, which has its own atomic path below.
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
 * Atomic claim: only succeeds if the conversation is currently unclaimed.
 * Returns false (not an error) if someone else claimed it first — the
 * caller is responsible for telling that associate "already claimed by
 * someone else" rather than silently overwriting. Uses a real
 * UPDATE ... WHERE claimed_by IS NULL, not a read-then-write, so two
 * associates clicking "take over" at the same moment can't both win.
 */
export async function claimConversation(id: string, associateId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({ claimedBy: associateId, claimedAt: now, status: "claimed", updatedAt: now })
      .where(and(eq(conversationsTable.id, id), isNull(conversationsTable.claimedBy)))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }
  const existing = inMemoryConversations.get(id);
  if (!existing || existing.claimedBy) return false;
  inMemoryConversations.set(id, {
    ...existing,
    claimedBy: associateId,
    claimedAt: now.toISOString(),
    status: "claimed",
    updatedAt: now.toISOString(),
  });
  return true;
}

/**
 * Undoes a claim — only succeeds if the caller is the one who claimed it.
 * Puts the conversation back in the live queue as unclaimed.
 */
export async function releaseConversation(id: string, associateId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({ claimedBy: null, claimedAt: null, status: "in-progress", updatedAt: now })
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.claimedBy, associateId)))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }
  const existing = inMemoryConversations.get(id);
  if (!existing || existing.claimedBy !== associateId) return false;
  inMemoryConversations.set(id, {
    ...existing,
    claimedBy: null,
    claimedAt: null,
    status: "in-progress",
    updatedAt: now.toISOString(),
  });
  return true;
}

/**
 * Closes out a claimed conversation the associate handled directly (e.g.
 * by phone) — drops it out of both the live queue and needs-follow-up,
 * same as a resolved inbox item. Only succeeds if the caller is the one
 * who claimed it. No Lead is created here — the associate already has
 * full context from handling it themselves.
 */
export async function completeConversation(id: string, associateId: string): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({ status: "completed-claimed", updatedAt: now })
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.claimedBy, associateId)))
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }
  const existing = inMemoryConversations.get(id);
  if (!existing || existing.claimedBy !== associateId) return false;
  inMemoryConversations.set(id, { ...existing, status: "completed-claimed", updatedAt: now.toISOString() });
  return true;
}

/** Completed-unclaimed and abandoned conversations — the "needs follow-up" dashboard view. */
export async function listNeedsFollowUp(): Promise<readonly StoredConversation[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(inArray(conversationsTable.status, ["completed-unclaimed", "abandoned"]))
      .orderBy(desc(conversationsTable.updatedAt));
    return rows.map(rowToStored);
  }
  return [...inMemoryConversations.values()]
    .filter((c) => c.status === "completed-unclaimed" || c.status === "abandoned")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** In-progress and claimed conversations — the live-queue dashboard view. */
export async function listLive(): Promise<readonly StoredConversation[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(inArray(conversationsTable.status, ["in-progress", "claimed"]))
      .orderBy(desc(conversationsTable.updatedAt));
    return rows.map(rowToStored);
  }
  return [...inMemoryConversations.values()]
    .filter((c) => c.status === "in-progress" || c.status === "claimed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
