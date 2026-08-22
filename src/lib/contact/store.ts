import { desc } from "drizzle-orm";
import type { ContactFormInput } from "@/lib/schemas/forms";
import { getDb } from "@/lib/db/client";
import { contactMessages as contactMessagesTable } from "@/lib/db/schema";

export interface StoredContactMessage extends ContactFormInput {
  id: string;
  createdAt: string;
}

/**
 * Persists to Postgres when DATABASE_URL is configured; otherwise falls
 * back to this in-memory array (not durable — see lib/claims/store.ts for
 * the same pattern/caveats).
 */
const inMemoryMessages: StoredContactMessage[] = [];

export async function addContactMessage(input: ContactFormInput): Promise<StoredContactMessage> {
  const message: StoredContactMessage = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  console.log(`[contact] ${message.id} — ${message.firstName} ${message.lastName}`);

  const db = getDb();
  if (db) {
    await db.insert(contactMessagesTable).values({
      id: message.id,
      createdAt: new Date(message.createdAt),
      data: message,
    });
  } else {
    inMemoryMessages.push(message);
  }

  return message;
}

export async function getContactMessages(): Promise<readonly StoredContactMessage[]> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
    return rows.map((row) => row.data as StoredContactMessage);
  }
  return inMemoryMessages;
}
