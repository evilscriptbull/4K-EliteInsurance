import { describe, it, expect } from "vitest";
import { estimateLeadScore, scoreSignals, SCORE_WEIGHTS, type ScoreInput } from "@/lib/leads/scoring";
import { scoreToTier } from "@/lib/schemas/lead";

// Fixed "today" so renewal-window tests are deterministic.
const NOW = new Date("2026-10-01T12:00:00Z");

function lead(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    line: "auto",
    channel: "form",
    contact: {
      firstName: "Jane",
      lastName: "Doe",
      phone: undefined,
      email: "jane@example.com",
      preferredContactMethod: "email",
      state: "TN",
      smsConsent: false,
    },
    renewalUrgency: {},
    insuredAssets: [],
    source: {},
    ...overrides,
  };
}

function withContact(overrides: Partial<ScoreInput["contact"]>): ScoreInput["contact"] {
  return { ...lead().contact, ...overrides };
}

function businessAssets(details: Record<string, unknown>): ScoreInput["insuredAssets"] {
  return [{ kind: "business", description: "Acme", details }];
}

describe("single-signal weights", () => {
  const base = SCORE_WEIGHTS.base;

  const cases: Array<[string, ScoreInput, number]> = [
    ["nothing", lead(), base],
    ["phone", lead({ contact: withContact({ phone: "8651234567" }) }), base + SCORE_WEIGHTS.hasPhone],
    ["sms consent", lead({ contact: withContact({ smsConsent: true }) }), base + SCORE_WEIGHTS.smsConsent],
    ["priority line", lead({ line: "general-liability" }), base + SCORE_WEIGHTS.priorityLine],
    ["non-priority line", lead({ line: "boat" }), base],
    [
      "no active policy",
      lead({ renewalUrgency: { hasActivePolicy: false } }),
      base + SCORE_WEIGHTS.noActivePolicy,
    ],
    ["has active policy (no bonus)", lead({ renewalUrgency: { hasActivePolicy: true } }), base],
    ["paid via gclid", lead({ source: { gclid: "abc" } }), base + SCORE_WEIGHTS.paidSource],
    ["paid via utm cpc", lead({ source: { utmMedium: "cpc" } }), base + SCORE_WEIGHTS.paidSource],
    ["paid via utm Paid-Social", lead({ source: { utmMedium: "Paid-Social" } }), base + SCORE_WEIGHTS.paidSource],
    ["organic utm (no bonus)", lead({ source: { utmMedium: "organic" } }), base],
    ["email utm (no bonus)", lead({ source: { utmMedium: "email" } }), base],
    ["chat-live", lead({ channel: "chat-live" }), base + SCORE_WEIGHTS.chatLive],
    ["plain chat (no bonus)", lead({ channel: "chat" }), base],
  ];

  it.each(cases)("%s", (_name, input, expected) => {
    expect(estimateLeadScore(input, NOW)).toBe(expected);
  });
});

describe("renewal windows", () => {
  const score = (renewalDate: string) =>
    estimateLeadScore(lead({ renewalUrgency: { renewalDate, hasActivePolicy: true } }), NOW);
  const base = SCORE_WEIGHTS.base;

  it.each([
    ["today (day 0)", "2026-10-01", base + SCORE_WEIGHTS.renewalWithin45Days],
    ["day 45", "2026-11-15", base + SCORE_WEIGHTS.renewalWithin45Days],
    ["day 46", "2026-11-16", base + SCORE_WEIGHTS.renewalWithin90Days],
    ["day 90", "2026-12-30", base + SCORE_WEIGHTS.renewalWithin90Days],
    ["day 91", "2026-12-31", base],
    ["yesterday (past)", "2026-09-30", base],
    ["far past", "2025-01-01", base],
  ])("%s", (_name, date, expected) => {
    expect(score(date)).toBe(expected);
  });

  it("tiers are exclusive -- never both bonuses", () => {
    const signals = scoreSignals(lead({ renewalUrgency: { renewalDate: "2026-10-20" } }), NOW).map((s) => s.signal);
    expect(signals).toEqual(["renewalWithin45Days"]);
  });
});

describe("commercial size signals", () => {
  const points = (details: Record<string, unknown>) =>
    scoreSignals(lead({ insuredAssets: businessAssets(details) }), NOW).find((s) => s.signal === "commercialSize")?.points ?? 0;

  it("scores nothing for a small business", () => {
    expect(points({ employees: 3, annualPayroll: "under-100k", annualRevenue: "under-250k", vehicleCount: 1 })).toBe(0);
  });

  it("treats 'not-sure' bands as no signal", () => {
    expect(points({ annualPayroll: "not-sure", annualRevenue: "not-sure" })).toBe(0);
  });

  it.each([
    ["employees at threshold", { employees: 10 }, 5],
    ["employees just under", { employees: 9 }, 0],
    ["payroll band", { annualPayroll: "250k-500k" }, 5],
    ["revenue band", { annualRevenue: "1m-5m" }, 5],
    ["revenue below band", { annualRevenue: "500k-1m" }, 0],
    ["vehicles at threshold", { vehicleCount: 3 }, 5],
    ["vehicles just under", { vehicleCount: 2 }, 0],
  ])("%s", (_name, details, expected) => {
    expect(points(details)).toBe(expected);
  });

  it("caps at 15 even when all four signals fire", () => {
    expect(points({ employees: 50, annualPayroll: "over-1m", annualRevenue: "over-5m", vehicleCount: 10 })).toBe(
      SCORE_WEIGHTS.commercialSizeCap,
    );
  });

  it("ignores size fields on a non-business asset", () => {
    const input = lead({ insuredAssets: [{ kind: "vehicle", details: { employees: 99 } }] });
    expect(scoreSignals(input, NOW).some((s) => s.signal === "commercialSize")).toBe(false);
  });
});

describe("clamping", () => {
  it("never exceeds 100", () => {
    const stacked = lead({
      line: "workers-comp",
      channel: "chat-live",
      contact: withContact({ phone: "8651234567", smsConsent: true }),
      renewalUrgency: { hasActivePolicy: false, renewalDate: "2026-10-10" },
      insuredAssets: businessAssets({ employees: 50, annualPayroll: "over-1m", annualRevenue: "over-5m", vehicleCount: 9 }),
      source: { gclid: "abc" },
    });
    expect(estimateLeadScore(stacked, NOW)).toBe(100);
  });
});

describe("representative leads", () => {
  const phoneSms = withContact({ phone: "8651234567", smsConsent: true });

  const cases: Array<[string, ScoreInput, number, ReturnType<typeof scoreToTier>]> = [
    ["plain personal auto, phone + consent", lead({ contact: phoneSms }), 60, "same-day"],
    ["personal auto, phone only", lead({ contact: withContact({ phone: "8651234567" }) }), 50, "nurture"],
    ["partial chat lead, name + email only", lead({ channel: "chat" }), 35, "nurture"],
    ["plain general liability, phone + consent", lead({ line: "general-liability", contact: phoneSms }), 75, "same-day"],
    [
      "general liability renewing in 30 days",
      lead({
        line: "general-liability",
        contact: phoneSms,
        renewalUrgency: { renewalDate: "2026-10-31", hasActivePolicy: true },
      }),
      95,
      "immediate",
    ],
    [
      "live-chat auto lead renewing in 60 days",
      lead({
        channel: "chat-live",
        contact: phoneSms,
        renewalUrgency: { renewalDate: "2026-11-30", hasActivePolicy: true },
      }),
      80,
      "immediate",
    ],
    [
      // 35 + 15 phone + 10 sms + 15 uninsured + 15 size (3 signals, capped) + 5 paid.
      // "contractors" is not in priorityLines (agency.ts), so no priority bonus.
      "large uninsured contractor from a paid click",
      lead({
        line: "contractors",
        contact: phoneSms,
        renewalUrgency: { hasActivePolicy: false },
        insuredAssets: businessAssets({ employees: 12, annualPayroll: "250k-500k", vehicleCount: 3 }),
        source: { gclid: "abc" },
      }),
      95,
      "immediate",
    ],
  ];

  it.each(cases)("%s", (_name, input, expectedScore, expectedTier) => {
    const score = estimateLeadScore(input, NOW);
    expect(score).toBe(expectedScore);
    expect(scoreToTier(score)).toBe(expectedTier);
  });
});
