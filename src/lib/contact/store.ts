import type { ContactFormInput } from "@/lib/schemas/forms";

export interface StoredContactMessage extends ContactFormInput {
  id: string;
  createdAt: string;
}

/** In-memory only — same caveats as lib/leads/store.ts. */
const messages: StoredContactMessage[] = [];

export function addContactMessage(input: ContactFormInput): StoredContactMessage {
  const message: StoredContactMessage = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  messages.push(message);
  console.log(`[contact] ${message.id} — ${message.firstName} ${message.lastName}`);
  return message;
}

export function getContactMessages(): readonly StoredContactMessage[] {
  return messages;
}
