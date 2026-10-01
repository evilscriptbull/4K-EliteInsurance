import type { ScriptedFlow } from "@/lib/scripted-chat/types";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";
import { businessFlow } from "@/lib/scripted-chat/flows/business";
import { collectorVehicleFlow } from "@/lib/scripted-chat/flows/collector-vehicle";
import { homeFlow } from "@/lib/scripted-chat/flows/home";
import { recreationalFlow } from "@/lib/scripted-chat/flows/recreational";
import { lifeFlow } from "@/lib/scripted-chat/flows/life";

/**
 * All 6 quoteFormFamilies slugs now have a ScriptedFlow (see docs/backlog.md
 * — Scripted Lead Warmer). Each is gated behind its own sign-off from Chaz
 * before going live, tracked per-flow in that flow file's header comment.
 */
export const scriptedFlows: Record<string, ScriptedFlow> = {
  auto: autoFlow,
  business: businessFlow,
  "collector-vehicle": collectorVehicleFlow,
  home: homeFlow,
  recreational: recreationalFlow,
  life: lifeFlow,
};

export function getScriptedFlow(slug: string): ScriptedFlow | undefined {
  return scriptedFlows[slug];
}
