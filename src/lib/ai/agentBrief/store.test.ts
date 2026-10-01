import { describe, it, expect } from "vitest";
import { saveAgentBrief, getAgentBriefForLead, getAgentBriefsForLeadIds } from "@/lib/ai/agentBrief/store";
import type { AgentBrief } from "@/lib/schemas/agentBrief";

// DATABASE_URL is unset in the test environment, so this exercises the
// in-memory fallback branch (see lib/conversations/store.test.ts's note).

function makeBrief(overrides: Partial<AgentBrief> & { leadId: string }): AgentBrief {
  return {
    id: crypto.randomUUID(),
    conversationId: null,
    createdAt: new Date().toISOString(),
    origin: "fallback",
    model: null,
    promptVersion: "test",
    usage: null,
    content: {
      headline: "Test headline",
      summary: "Test summary.",
      primaryLine: "auto",
      crossSellCandidates: [],
      urgency: { tier: "nurture", reasons: [] },
      keyFacts: [],
      missingFields: [],
      suggestedQuestions: [],
      riskFlags: [],
      classOfBusinessHint: null,
      recommendedNextAction: "email-first",
    },
    ...overrides,
  };
}

describe("saveAgentBrief / getAgentBriefForLead", () => {
  it("round-trips a saved brief", async () => {
    const leadId = crypto.randomUUID();
    const brief = makeBrief({ leadId });
    await saveAgentBrief(brief);

    const fetched = await getAgentBriefForLead(leadId);
    expect(fetched?.id).toBe(brief.id);
    expect(fetched?.content.headline).toBe("Test headline");
  });

  it("returns null for a lead with no brief", async () => {
    expect(await getAgentBriefForLead(crypto.randomUUID())).toBeNull();
  });

  it("returns the most recently created brief when more than one exists", async () => {
    const leadId = crypto.randomUUID();
    const older = makeBrief({ leadId, createdAt: new Date(Date.now() - 1000).toISOString() });
    const newer = makeBrief({ leadId, createdAt: new Date().toISOString() });
    await saveAgentBrief(older);
    await saveAgentBrief(newer);

    const fetched = await getAgentBriefForLead(leadId);
    expect(fetched?.id).toBe(newer.id);
  });
});

describe("getAgentBriefsForLeadIds", () => {
  it("batches multiple leads in one call", async () => {
    const leadIds = [crypto.randomUUID(), crypto.randomUUID()];
    await Promise.all(leadIds.map((leadId) => saveAgentBrief(makeBrief({ leadId }))));

    const result = await getAgentBriefsForLeadIds(leadIds);
    expect(result.size).toBe(2);
    expect(result.get(leadIds[0])).toBeDefined();
    expect(result.get(leadIds[1])).toBeDefined();
  });

  it("omits leads with no brief", async () => {
    const withBrief = crypto.randomUUID();
    const withoutBrief = crypto.randomUUID();
    await saveAgentBrief(makeBrief({ leadId: withBrief }));

    const result = await getAgentBriefsForLeadIds([withBrief, withoutBrief]);
    expect(result.has(withBrief)).toBe(true);
    expect(result.has(withoutBrief)).toBe(false);
  });

  it("returns an empty map for an empty input", async () => {
    expect((await getAgentBriefsForLeadIds([])).size).toBe(0);
  });
});
