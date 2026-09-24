import { z } from "zod";
import { insuranceLines } from "@/lib/config/agency";

/**
 * Conversation-state schema for the Scripted Lead Warmer (see
 * docs/backlog.md). Designed to be persisted and resumed (see "Nurture" in
 * the handoff doc: resume abandoned conversations via consented SMS/email,
 * preserving state — not yet built, this schema is ready for it).
 */

/**
 * @deprecated The transcript now lives in the conversation_messages table
 * (src/lib/conversations/messages.ts — appendMessage()/listMessages()),
 * one row per message, so it can be appended atomically and delivered live
 * via Realtime Broadcast. This schema is kept only so historical rows'
 * `data.messages` (written before this change) still validate; new code
 * must not read or write it — new conversations always persist `messages: []`.
 */
export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

/** @deprecated See messageRoleSchema's note above. */
export const messageSchema = z.object({
  role: messageRoleSchema,
  content: z.string(),
  timestamp: z.iso.datetime(),
});

/**
 * Must match the status vocabulary used by the `conversations` table
 * (src/lib/db/schema.ts) and lib/conversations/store.ts's
 * ConversationStatus type — kept as literal string unions in both places
 * rather than importing across the app/scripts boundary, so if this
 * changes, update both.
 */
export const conversationStatusSchema = z.enum([
  "in-progress",
  "claimed", // an associate has taken over; the script pauses
  "completed-unclaimed", // script finished, no associate ever claimed it
  "completed-claimed", // an associate handled it live to completion
  "abandoned", // customer left before the script finished, never claimed
]);

export const conversationStateSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  status: conversationStatusSchema,

  line: z.enum(insuranceLines).optional(), // set once the prospect's line is identified
  messages: z.array(messageSchema).default([]),

  // The step id the server last confirmed this conversation was on — the
  // /answer route checks the client's submitted stepId against this instead
  // of trusting it outright, so a client can't skip/replay steps.
  currentStepId: z.string().optional(),

  // Structured data collected so far, keyed by field name — partial and
  // growing over the course of the conversation. Reconciled into a Lead
  // (see lib/schemas/lead.ts) once enough fields are present or the
  // conversation is handed off/completed.
  collectedFields: z.record(z.string(), z.unknown()).default({}),

  leadId: z.string().optional(), // set once a Lead has been created/updated from this conversation

  resumeChannel: z.enum(["sms", "email"]).optional(),
  resumeConsent: z.boolean().default(false),

  // Marketing attribution captured at conversation start, mirroring
  // Lead["source"] (lib/schemas/lead.ts) — carried through to the Lead
  // this conversation eventually produces.
  source: z
    .object({
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      landingPage: z.string().optional(),
      gclid: z.string().optional(),
    })
    .optional(),
});

export type ConversationState = z.infer<typeof conversationStateSchema>;
export type Message = z.infer<typeof messageSchema>;
