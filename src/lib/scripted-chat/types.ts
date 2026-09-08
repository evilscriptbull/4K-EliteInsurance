import type { z } from "zod";

/**
 * The Scripted Lead Warmer — a decision-tree questionnaire that stands in
 * for a real conversation, not an LLM (see docs/backlog.md). Each flow's
 * steps ask for exactly the fields its matching static form
 * (src/lib/schemas/forms.ts) requires, one at a time, so a completed
 * conversation's answers assemble into a payload that schema already
 * validates — no separate extraction step needed.
 */

export type ScriptedInputType = "text" | "select" | "number" | "boolean" | "date";

export interface ScriptedOption {
  value: string;
  label: string;
}

export interface ScriptedStep {
  id: string;
  /** Key this answer is stored under in ConversationState.collectedFields — matches the target form schema's field name. */
  field: string;
  prompt: string;
  type: ScriptedInputType;
  options?: ScriptedOption[];
  /** Validates the raw answer for this step; on success, its output is what gets stored. */
  schema: z.ZodTypeAny;
  optional?: boolean;
  /** Given all answers collected so far (including this step's), returns the next step id, or null if the flow is complete. */
  next: (answers: Record<string, unknown>) => string | null;
}

export interface ScriptedFlow {
  /** Matches a quoteFormFamilies slug (src/lib/config/quote-forms.ts). */
  slug: string;
  intro: string;
  firstStepId: string;
  steps: ScriptedStep[];
}
