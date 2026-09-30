import { describe, it, expect } from "vitest";
import { createLeadOutcome, getLeadOutcomesByIds, takeLeadOutcome, releaseLeadOutcome, logLeadOutcome } from "@/lib/leads/outcomes";

// DATABASE_URL is unset in the test environment, so this exercises the
// in-memory fallback branch (see lib/conversations/store.test.ts's note).

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
