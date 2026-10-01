import type { ScriptedFlow, ScriptedInputType } from "@/lib/scripted-chat/types";

export interface FieldLabel {
  prompt: string;
  type: ScriptedInputType;
}

/**
 * Maps each `collectedFields` key a flow can produce back to the step that
 * asked it, so the dashboard can label an answer with the actual question
 * instead of a humanized key. A normal step maps its own `field`; a
 * `spreadFields` step maps every key in `producedFields` (defaulting to
 * `[field]`) to the same prompt/type, since one question can fill more than
 * one target field (e.g. "what's your name?" -> firstName + lastName).
 */
export function buildFieldLabelLookup(flow: ScriptedFlow): Map<string, FieldLabel> {
  const lookup = new Map<string, FieldLabel>();
  for (const step of flow.steps) {
    const keys = step.producedFields ?? [step.field];
    for (const key of keys) {
      lookup.set(key, { prompt: step.prompt, type: step.type });
    }
  }
  return lookup;
}
