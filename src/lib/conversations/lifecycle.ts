import { and, eq, inArray } from "drizzle-orm";
import type { ConversationState } from "@/lib/schemas/conversation";
import { getDb } from "@/lib/db/client";
import { conversations as conversationsTable } from "@/lib/db/schema";

export type ConversationStatus =
  | "in-progress"
  | "claimed"
  | "completed-unclaimed"
  | "completed-claimed"
  | "released"
  | "abandoned";

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
 * back to this in-memory map (not durable). Owned here rather than in
 * store.ts since transition() below and store.ts's CRUD both need it.
 */
export const inMemoryConversations = new Map<string, StoredConversation>();

/**
 * The only legal status transitions (matches tasks/todo.md's target flow,
 * section C). "in-progress" -> "in-progress" (a valid answer to the current
 * step) isn't a status transition at all -- see mergeAnswer in store.ts.
 */
export const conversationTransitions: Record<ConversationStatus, ConversationStatus[]> = {
  "in-progress": ["claimed", "completed-unclaimed", "abandoned"],
  claimed: ["completed-claimed", "released"],
  "completed-unclaimed": [],
  "completed-claimed": [],
  released: [],
  abandoned: [],
};

/**
 * One atomic conditional UPDATE (or in-memory equivalent) for every status
 * change except the per-answer merge (mergeAnswer, in store.ts) -- claim,
 * release, complete, and the future abandon sweeper all go through this.
 * Only applies if the conversation's current status is one of `from`, and
 * (when given) `claimedBy` matches the current row -- the ownership check
 * release/complete need, which a status-only guard can't express. Never
 * touches `data` (the transcript/collected-answers blob).
 */
export async function transition(
  id: string,
  options: {
    from: ConversationStatus[];
    to: ConversationStatus;
    /** Only applies the transition if the row's current claimedBy matches. */
    claimedBy?: string;
    set?: { claimedBy?: string | null; claimedAt?: string | null; leadId?: string | null };
  },
): Promise<boolean> {
  const now = new Date();
  const db = getDb();
  if (db) {
    const result = await db
      .update(conversationsTable)
      .set({
        status: options.to,
        updatedAt: now,
        ...(options.set?.claimedBy !== undefined ? { claimedBy: options.set.claimedBy } : {}),
        ...(options.set?.claimedAt !== undefined
          ? { claimedAt: options.set.claimedAt ? new Date(options.set.claimedAt) : null }
          : {}),
        ...(options.set?.leadId !== undefined ? { leadId: options.set.leadId } : {}),
      })
      .where(
        and(
          eq(conversationsTable.id, id),
          inArray(conversationsTable.status, options.from),
          options.claimedBy !== undefined ? eq(conversationsTable.claimedBy, options.claimedBy) : undefined,
        ),
      )
      .returning({ id: conversationsTable.id });
    return result.length > 0;
  }

  const existing = inMemoryConversations.get(id);
  if (!existing) return false;
  if (!options.from.includes(existing.status)) return false;
  if (options.claimedBy !== undefined && existing.claimedBy !== options.claimedBy) return false;

  inMemoryConversations.set(id, {
    ...existing,
    status: options.to,
    updatedAt: now.toISOString(),
    ...(options.set?.claimedBy !== undefined ? { claimedBy: options.set.claimedBy } : {}),
    ...(options.set?.claimedAt !== undefined ? { claimedAt: options.set.claimedAt } : {}),
    ...(options.set?.leadId !== undefined ? { leadId: options.set.leadId } : {}),
  });
  return true;
}
