import { licensedStates, type LicensedState } from "@/lib/config/agency";

export function isLicensedState(state: string): state is LicensedState {
  return (licensedStates as readonly string[]).includes(state.toUpperCase());
}

/**
 * Per-state disclaimer/compliance notes. Every licensed state needs an entry
 * before its landing pages or lead flows go live — most are still TBD
 * pending sign-off from whoever owns compliance language at Elite (open
 * question, see docs/open-questions.md). Structure is intentionally filled
 * in for all 14 states now so a missing entry is a visible gap, not a
 * silent one.
 */
export const stateDisclaimers: Record<LicensedState, { status: "confirmed" | "tbd"; text: string | null }> = {
  TN: { status: "tbd", text: null },
  KY: { status: "tbd", text: null },
  NC: { status: "tbd", text: null },
  SC: { status: "tbd", text: null },
  VA: { status: "tbd", text: null },
  WV: { status: "tbd", text: null },
  FL: { status: "tbd", text: null },
  GA: { status: "tbd", text: null },
  AL: { status: "tbd", text: null },
  OH: { status: "tbd", text: null },
  IN: { status: "tbd", text: null },
  TX: { status: "tbd", text: null },
  AZ: { status: "tbd", text: null },
  MT: { status: "tbd", text: null },
};
