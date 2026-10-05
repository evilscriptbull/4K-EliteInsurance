import type { Lead } from "@/lib/schemas/lead";
import { priorityLines } from "@/lib/config/agency";

/**
 * Deterministic lead scoring (v2, Phase 6.2) -- still rules, not a learned
 * model, and NOT the future AI Lead Warmer scoring (tracked in
 * docs/backlog.md). Every point value lives in SCORE_WEIGHTS so tests, docs,
 * and the owner's tuning conversations all point at one table. Scores are
 * computed once, when a Lead is created, and stored -- changing a weight
 * does not rescore existing leads.
 *
 * Tiers come from scoreToTier (lib/schemas/lead.ts): >=80 immediate,
 * >=60 same-day, >=30 nurture, else marketing. Note the floor: base alone
 * is 35, so the "marketing" tier is unreachable today (it was under v1's
 * base of 40 too) -- a flagged observation, not something v2 changes.
 */
export const SCORE_WEIGHTS = {
  base: 35,
  hasPhone: 15,
  smsConsent: 10,
  priorityLine: 15,
  noActivePolicy: 15,
  renewalWithin45Days: 20,
  renewalWithin90Days: 10,
  /** Per commercial size signal; total capped at `commercialSizeCap`. */
  commercialSizeSignal: 5,
  commercialSizeCap: 15,
  paidSource: 5,
  /** A human engaged live (channel "chat-live") is the strongest intent signal we capture. */
  chatLive: 10,
} as const;

const MS_PER_DAY = 86_400_000;

// Size thresholds read from the business flow's insuredAssets[0].details
// (Phase 5.2 fields). "not-sure" and the lower bands score nothing.
const LARGE_PAYROLL_BANDS = new Set(["250k-500k", "500k-1m", "over-1m"]);
const LARGE_REVENUE_BANDS = new Set(["1m-5m", "over-5m"]);
const MIN_EMPLOYEES = 10;
const MIN_VEHICLES = 3;

const PAID_MEDIUM = /^(cpc|ppc|display|paid([-_ ]?(search|social))?)$/i;

export type ScoreInput = Pick<Lead, "line" | "contact" | "renewalUrgency" | "insuredAssets" | "source" | "channel">;
export type ScoreSignal = { signal: string; points: number };

/** Whole days from `now`'s UTC date to a YYYY-MM-DD date; negative when in the past. */
function daysUntil(isoDate: string, now: Date): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((Date.UTC(year, month - 1, day) - today) / MS_PER_DAY);
}

function commercialSizeSignalCount(lead: ScoreInput): number {
  const details = lead.insuredAssets.find((asset) => asset.kind === "business")?.details ?? {};
  let count = 0;
  if (typeof details.employees === "number" && details.employees >= MIN_EMPLOYEES) count++;
  if (typeof details.annualPayroll === "string" && LARGE_PAYROLL_BANDS.has(details.annualPayroll)) count++;
  if (typeof details.annualRevenue === "string" && LARGE_REVENUE_BANDS.has(details.annualRevenue)) count++;
  if (typeof details.vehicleCount === "number" && details.vehicleCount >= MIN_VEHICLES) count++;
  return count;
}

function isPaidSource(source: ScoreInput["source"]): boolean {
  return Boolean(source.gclid) || (source.utmMedium !== undefined && PAID_MEDIUM.test(source.utmMedium.trim()));
}

/** Every signal that fired for this lead, in table order (excludes the base). Exported so tests/docs can assert *why* a score is what it is. */
export function scoreSignals(lead: ScoreInput, now: Date = new Date()): ScoreSignal[] {
  const signals: ScoreSignal[] = [];
  const add = (signal: string, points: number) => signals.push({ signal, points });

  if (lead.contact.phone) add("hasPhone", SCORE_WEIGHTS.hasPhone);
  if (lead.contact.smsConsent) add("smsConsent", SCORE_WEIGHTS.smsConsent);
  if (priorityLines.includes(lead.line)) add("priorityLine", SCORE_WEIGHTS.priorityLine);
  if (lead.renewalUrgency.hasActivePolicy === false) add("noActivePolicy", SCORE_WEIGHTS.noActivePolicy);

  if (lead.renewalUrgency.renewalDate) {
    const days = daysUntil(lead.renewalUrgency.renewalDate, now);
    if (days >= 0 && days <= 45) add("renewalWithin45Days", SCORE_WEIGHTS.renewalWithin45Days);
    else if (days > 45 && days <= 90) add("renewalWithin90Days", SCORE_WEIGHTS.renewalWithin90Days);
  }

  const sizeSignals = commercialSizeSignalCount(lead);
  if (sizeSignals > 0) {
    add("commercialSize", Math.min(sizeSignals * SCORE_WEIGHTS.commercialSizeSignal, SCORE_WEIGHTS.commercialSizeCap));
  }

  if (isPaidSource(lead.source)) add("paidSource", SCORE_WEIGHTS.paidSource);
  if (lead.channel === "chat-live") add("chatLive", SCORE_WEIGHTS.chatLive);

  return signals;
}

export function estimateLeadScore(lead: ScoreInput, now: Date = new Date()): number {
  const total = scoreSignals(lead, now).reduce<number>((sum, { points }) => sum + points, SCORE_WEIGHTS.base);
  return Math.max(0, Math.min(100, total));
}
