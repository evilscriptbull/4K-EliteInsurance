import type { ScriptedFlow, ScriptedStep } from "@/lib/scripted-chat/types";

export type EngineResult =
  | { status: "invalid"; step: ScriptedStep; errors: string[] }
  | { status: "next"; step: ScriptedStep; answers: Record<string, unknown> }
  | { status: "complete"; answers: Record<string, unknown> };

function findStep(flow: ScriptedFlow, stepId: string): ScriptedStep {
  const step = flow.steps.find((candidate) => candidate.id === stepId);
  if (!step) {
    throw new Error(`Scripted flow "${flow.slug}" has no step "${stepId}"`);
  }
  return step;
}

export function getFirstStep(flow: ScriptedFlow): ScriptedStep {
  return findStep(flow, flow.firstStepId);
}

/**
 * Advances the flow by one answer. Runs server-side only — the client
 * never sees (or can tamper with) branch logic or validation, same posture
 * as every existing form route's server-side zod parsing.
 */
export function answerStep(
  flow: ScriptedFlow,
  currentStepId: string,
  rawAnswer: unknown,
  answersSoFar: Record<string, unknown>,
): EngineResult {
  const step = findStep(flow, currentStepId);

  if (step.optional && (rawAnswer === undefined || rawAnswer === "")) {
    return advance(flow, step, answersSoFar);
  }

  const parsed = step.schema.safeParse(rawAnswer);
  if (!parsed.success) {
    return { status: "invalid", step, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  if (step.spreadFields) {
    return advance(flow, step, { ...answersSoFar, ...(parsed.data as Record<string, unknown>) });
  }
  return advance(flow, step, { ...answersSoFar, [step.field]: parsed.data });
}

function advance(flow: ScriptedFlow, step: ScriptedStep, answers: Record<string, unknown>): EngineResult {
  const nextId = step.next(answers);
  if (nextId === null) {
    return { status: "complete", answers };
  }
  return { status: "next", step: findStep(flow, nextId), answers };
}
