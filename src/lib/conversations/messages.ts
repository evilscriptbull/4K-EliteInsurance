import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { conversationMessages as conversationMessagesTable } from "@/lib/db/schema";

export type StoredMessageRole = "user" | "assistant" | "system" | "associate";

export interface StoredMessage {
  id: string;
  conversationId: string;
  role: StoredMessageRole;
  content: string;
  authorAssociateId: string | null;
  createdAt: string;
}

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory map (not durable), same contract as
 * lib/conversations/store.ts.
 */
const inMemoryMessages = new Map<string, StoredMessage[]>();

function rowToStored(row: typeof conversationMessagesTable.$inferSelect): StoredMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role as StoredMessageRole,
    content: row.content,
    authorAssociateId: row.authorAssociateId,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Inserts one message as its own row — no read-then-write, so a customer's
 * reply and an associate's live message can never clobber each other the
 * way overwriting conversations.data as a whole blob could.
 */
export async function appendMessage(
  conversationId: string,
  input: { role: StoredMessageRole; content: string; authorAssociateId?: string | null },
): Promise<StoredMessage> {
  const message: StoredMessage = {
    id: crypto.randomUUID(),
    conversationId,
    role: input.role,
    content: input.content,
    authorAssociateId: input.authorAssociateId ?? null,
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  if (db) {
    await db.insert(conversationMessagesTable).values({
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      authorAssociateId: message.authorAssociateId,
      createdAt: new Date(message.createdAt),
    });
    return message;
  }

  const existing = inMemoryMessages.get(conversationId) ?? [];
  existing.push(message);
  inMemoryMessages.set(conversationId, existing);
  return message;
}

export async function listMessages(conversationId: string): Promise<StoredMessage[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(conversationMessagesTable)
      .where(eq(conversationMessagesTable.conversationId, conversationId))
      .orderBy(asc(conversationMessagesTable.createdAt));
    return rows.map(rowToStored);
  }
  return inMemoryMessages.get(conversationId) ?? [];
}
