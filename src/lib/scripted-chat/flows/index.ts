import type { ScriptedFlow } from "@/lib/scripted-chat/types";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";

/**
 * Only the pilot flow is wired up so far (see docs/backlog.md — Scripted
 * Lead Warmer). The remaining 5 quoteFormFamilies slugs (collector-vehicle,
 * home, recreational, life, business) get their own ScriptedFlow config
 * here once the pilot is verified, each gated behind its own sign-off from
 * Chaz before going live, same as this one.
 */
export const scriptedFlows: Record<string, ScriptedFlow> = {
  auto: autoFlow,
};

export function getScriptedFlow(slug: string): ScriptedFlow | undefined {
  return scriptedFlows[slug];
}
