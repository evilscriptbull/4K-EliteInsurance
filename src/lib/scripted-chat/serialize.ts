import type { ScriptedStep } from "@/lib/scripted-chat/types";

/** What the client is allowed to see — never the zod schema or the `next` branch function. */
export interface ClientStep {
  id: string;
  field: string;
  prompt: string;
  type: ScriptedStep["type"];
  options?: ScriptedStep["options"];
  optional?: boolean;
}

export function toClientStep(step: ScriptedStep): ClientStep {
  return {
    id: step.id,
    field: step.field,
    prompt: step.prompt,
    type: step.type,
    options: step.options,
    optional: step.optional,
  };
}
