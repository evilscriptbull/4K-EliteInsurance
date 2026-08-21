import { z } from "zod";
import { insuranceLines } from "@/lib/config/agency";

/**
 * Conversation-state schema for the AI lead warmer. Designed to be
 * persisted and resumed (see "Nurture" section of the handoff doc: resume
 * abandoned conversations via consented SMS/email, preserving state).
 */

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

export const messageSchema = z.object({
  role: messageRoleSchema,
  content: z.string(),
  timestamp: z.iso.datetime(),
});

export const conversationStatusSchema = z.enum([
  "in-progress",
  "abandoned",
  "completed",
  "handed-off", // routed to a human agent mid-conversation
]);

export const conversationStateSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  status: conversationStatusSchema,

  line: z.enum(insuranceLines).optional(), // set once the prospect's line is identified
  messages: z.array(messageSchema).default([]),

  // Structured data collected so far, keyed by field name — partial and
  // growing over the course of the conversation. Reconciled into a Lead
  // (see lib/schemas/lead.ts) once enough fields are present or the
  // conversation is handed off/completed.
  collectedFields: z.record(z.string(), z.unknown()).default({}),

  leadId: z.string().optional(), // set once a Lead has been created/updated from this conversation

  resumeChannel: z.enum(["sms", "email"]).optional(),
  resumeConsent: z.boolean().default(false),
});

export type ConversationState = z.infer<typeof conversationStateSchema>;
export type Message = z.infer<typeof messageSchema>;
