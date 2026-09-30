import { describe, it, expect } from "vitest";
import {
  createLeadOutcome,
  getLeadOutcomesByIds,
  takeLeadOutcome,
  releaseLeadOutcome,
  logLeadOutcome,
  listOpenLeadsForFollowUp,
} from "@/lib/leads/outcomes";
import { addLead } from "@/lib/leads/store";
import type { Lead } from "@/lib/schemas/lead";

// DATABASE_URL is unset in the test environment, so this exercises the
// in-memory fallback branch (see lib/conversations/store.test.ts's note).

function makeLead(overrides: Partial<Lead> & { leadScoreTier: Lead["leadScoreTier"] }): Lead {
  const id = crypto.randomUUID();
  return {
    id,
    createdAt: new Date().toISOString(),
    channel: "form",
    completeness: "full",
    line: "auto",
    intent: "test",
    contact: { firstName: "Test", lastName: "Lead", preferredContactMethod: "phone", state: "TN", smsConsent: false },
    insuredAssets: [],
    renewalUrgency: {},
    crossSellPotential: [],
    conversationSummary: "test",
    missingFields: [],
    leadScore: 50,
    source: {},
    ...overrides,
  };
}

describe("createLeadOutcome / getLeadOutcomesByIds", () => {
  it("creates a 'new' row with the given assignedTo", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");

    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.status).toBe("new");
    expect(outcome.assignedTo).toBe("associate-a");
  });

  it("creates an unassigned row when assignedTo is null", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, null);

    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.assignedTo).toBeNull();
  });

  it("batches multiple ids in one call", async () => {
    const leadIds = [crypto.randomUUID(), crypto.randomUUID()];
    await Promise.all(leadIds.map((id) => createLeadOutcome(id, null)));

    const outcomes = await getLeadOutcomesByIds(leadIds);
    expect(outcomes).toHaveLength(2);
  });
});

describe("takeLeadOutcome", () => {
  it("succeeds when unassigned", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, null);

    expect(await takeLeadOutcome(leadId, "associate-a")).toBe(true);
    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.assignedTo).toBe("associate-a");
  });

  it("fails when already assigned", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");

    expect(await takeLeadOutcome(leadId, "associate-b")).toBe(false);
  });
});

describe("releaseLeadOutcome", () => {
  it("only succeeds for the associate who currently has it", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");

    expect(await releaseLeadOutcome(leadId, "associate-b")).toBe(false);
    expect(await releaseLeadOutcome(leadId, "associate-a")).toBe(true);

    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.assignedTo).toBeNull();
  });
});

describe("logLeadOutcome", () => {
  it("sets status and updatedBy, and contactedAt the first time it's reached", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");

    expect(await logLeadOutcome(leadId, "associate-a", { status: "contacted" })).toBe(true);
    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.status).toBe("contacted");
    expect(outcome.updatedBy).toBe("associate-a");
    expect(outcome.contactedAt).toBeTypeOf("string");
    expect(outcome.quotedAt).toBeNull();
  });

  it("doesn't overwrite a milestone timestamp once set", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");
    await logLeadOutcome(leadId, "associate-a", { status: "contacted" });
    const [afterFirst] = await getLeadOutcomesByIds([leadId]);

    await logLeadOutcome(leadId, "associate-a", { status: "quoted" });
    const [afterSecond] = await getLeadOutcomesByIds([leadId]);

    expect(afterSecond.contactedAt).toBe(afterFirst.contactedAt);
    expect(afterSecond.quotedAt).toBeTypeOf("string");
  });

  it("sets writtenPremium/carrier only when provided, and boundAt when bound", async () => {
    const leadId = crypto.randomUUID();
    await createLeadOutcome(leadId, "associate-a");

    await logLeadOutcome(leadId, "associate-a", { status: "bound", writtenPremium: 1200, carrier: "Progressive" });
    const [outcome] = await getLeadOutcomesByIds([leadId]);
    expect(outcome.status).toBe("bound");
    expect(outcome.writtenPremium).toBe(1200);
    expect(outcome.carrier).toBe("Progressive");
    expect(outcome.boundAt).toBeTypeOf("string");
  });

  it("returns false for a lead with no outcome row", async () => {
    expect(await logLeadOutcome(crypto.randomUUID(), "associate-a", { status: "contacted" })).toBe(false);
  });
});

describe("listOpenLeadsForFollowUp", () => {
  it("sorts by tier then age, oldest first within a tier", async () => {
    const now = Date.now();
    const nurtureOld = makeLead({ leadScoreTier: "nurture", createdAt: new Date(now - 3000).toISOString() });
    const nurtureNew = makeLead({ leadScoreTier: "nurture", createdAt: new Date(now - 1000).toISOString() });
    const immediate = makeLead({ leadScoreTier: "immediate", createdAt: new Date(now - 2000).toISOString() });
    await Promise.all([addLead(nurtureOld), addLead(nurtureNew), addLead(immediate)]);

    const results = await listOpenLeadsForFollowUp(50);
    const ids = results.map((r) => r.lead.id);
    const immediateIdx = ids.indexOf(immediate.id);
    const nurtureOldIdx = ids.indexOf(nurtureOld.id);
    const nurtureNewIdx = ids.indexOf(nurtureNew.id);

    expect(immediateIdx).toBeLessThan(nurtureOldIdx);
    expect(nurtureOldIdx).toBeLessThan(nurtureNewIdx);
  });

  it("excludes bound and lost leads", async () => {
    const bound = makeLead({ leadScoreTier: "nurture" });
    const lost = makeLead({ leadScoreTier: "nurture" });
    const open = makeLead({ leadScoreTier: "nurture" });
    await Promise.all([addLead(bound), addLead(lost), addLead(open)]);
    await logLeadOutcome(bound.id, "associate-a", { status: "bound", writtenPremium: 1000, carrier: "Test" });
    await logLeadOutcome(lost.id, "associate-a", { status: "lost" });

    const results = await listOpenLeadsForFollowUp(50);
    const ids = results.map((r) => r.lead.id);
    expect(ids).not.toContain(bound.id);
    expect(ids).not.toContain(lost.id);
    expect(ids).toContain(open.id);
  });

  it("signals overflow by returning limit + 1 rows", async () => {
    const leads = [makeLead({ leadScoreTier: "marketing" }), makeLead({ leadScoreTier: "marketing" }), makeLead({ leadScoreTier: "marketing" })];
    await Promise.all(leads.map((lead) => addLead(lead)));

    const results = await listOpenLeadsForFollowUp(2);
    expect(results.length).toBe(3); // limit + 1, caller slices to 2 and shows "more"
  });
});
