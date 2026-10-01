import type { ScriptedFlow } from "@/lib/scripted-chat/types";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";
import { businessFlow } from "@/lib/scripted-chat/flows/business";

/**
 * The remaining 4 quoteFormFamilies slugs (collector-vehicle, home,
 * recreational, life) get their own ScriptedFlow config here once built
 * (see docs/backlog.md — Scripted Lead Warmer), each gated behind its own
 * sign-off from Chaz before going live, same as auto and business.
 */
export const scriptedFlows: Record<string, ScriptedFlow> = {
  auto: autoFlow,
  business: businessFlow,
};

export function getScriptedFlow(slug: string): ScriptedFlow | undefined {
  return scriptedFlows[slug];
}
