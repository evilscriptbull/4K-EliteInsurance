import { describe, it, expect, vi } from "vitest";
import { createConversation, getConversation, type StoredConversation } from "@/lib/conversations/store";
import { finalizeConversation } from "@/lib/conversations/finalize";
import { getLeads } from "@/lib/leads/store";
import { getLeadOutcomesByIds } from "@/lib/leads/outcomes";

// after() throws outside a real request scope, which these direct,
// non-HTTP calls to finalizeConversation never have. Stubbed as a no-op
// (not "run the callback immediately") so these tests don't also depend
// on the real Anthropic API / GoTo SMS that generateAgentBrief and
// notifyAgentBrief would otherwise reach for -- the after()-scheduled
// brief/notification path itself is covered by the live verification,
// not this unit test file.
vi.mock("next/server", () => ({ after: vi.fn() }));

// DATABASE_URL is unset in the test environment, so this exercises the
// in-memory conversation/lead store fallback branches (see store.test.ts's
// note). getAssociate() also has no in-memory fallback (lib/associates/store.ts),
// so a claimed-by-someone conversation always resolves to the "no associate
// name known" copy here -- covered separately in the live verification
// against the real DB, same as PR 1's mergeAnswer.
function makeConversation(overrides: Partial<StoredConversation> & { collectedFields: Record<string, unknown>; currentStepId?: string | null }): StoredConversation {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { collectedFields, currentStepId, ...rest } = overrides;
  return {
    id,
    createdAt: now,
    updatedAt: now,
    status: "abandoned",
    familySlug: "auto",
    claimedBy: null,
    claimedAt: null,
    leadId: null,
    ipHash: null,
    ...rest,
    state: {
      id,
      createdAt: now,
      updatedAt: now,
      status: "abandoned",
      collectedFields,
      currentStepId: currentStepId ?? undefined,
      resumeConsent: false,
    },
  };
}

const fullAutoAnswers = {
  personalOrCommercial: "personal",
  vehicleYear: "2021",
  vehicleMake: "Honda",
  vehicleModel: "Civic",
  coverageType: "full",
  liabilityLimits: "250-500-100",
  dateOfBirth: "1990-01-01",
  firstName: "Jane",
  lastName: "Doe",
  phone: "8651234567",
  email: "jane@example.com",
  smsConsent: true,
};

describe("finalizeConversation", () => {
  it("creates a full Lead and links it for a fully-answered conversation", async () => {
    const conversation = makeConversation({ collectedFields: fullAutoAnswers, currentStepId: null });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "completed-unclaimed");
    expect(lead).not.toBeNull();
    expect(lead?.completeness).toBe("full");
    expect(lead?.conversationSummary).toContain("Completed the Quick Quote Chat");

    const updated = await getConversation(conversation.id);
    expect(updated?.leadId).toBe(lead?.id);
  });

  it("is idempotent -- calling it again returns the same Lead without creating a second one", async () => {
    const conversation = makeConversation({ collectedFields: fullAutoAnswers, currentStepId: null });
    await createConversation(conversation);

    const leadsBefore = (await getLeads()).length;
    const first = await finalizeConversation(conversation.id, "completed-unclaimed");
    const leadsAfterFirst = (await getLeads()).length;
    const second = await finalizeConversation(conversation.id, "completed-unclaimed");
    const leadsAfterSecond = (await getLeads()).length;

    expect(second?.id).toBe(first?.id);
    expect(leadsAfterFirst).toBe(leadsBefore + 1);
    expect(leadsAfterSecond).toBe(leadsAfterFirst);
  });

  it("falls back to a partial Lead and notes progress for an abandoned conversation", async () => {
    const conversation = makeConversation({
      collectedFields: { personalOrCommercial: "personal", vehicleYear: "2021", firstName: "Jane", lastName: "Doe" },
      currentStepId: "vehicleMake",
      status: "abandoned",
    });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "abandoned");
    expect(lead?.completeness).toBe("partial");
    // Phase 5.1 reordered the auto flow; "vehicleMake" is now index 6.
    expect(lead?.conversationSummary).toContain("6 of");
    expect(lead?.missingFields).toContain("vehicleMake");
  });

  it("notes the release in conversationSummary without stranding on an unknown associate", async () => {
    const conversation = makeConversation({
      collectedFields: { firstName: "Jane", lastName: "Doe", phone: "8651234567" },
      currentStepId: "vehicleYear",
      status: "released",
      claimedBy: "associate-not-in-db",
    });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "released");
    expect(lead?.conversationSummary).toContain("Released by an associate");
  });

  it("assigns the resulting lead's outcome to the claiming associate", async () => {
    const conversation = makeConversation({
      collectedFields: { firstName: "Jane", lastName: "Doe", phone: "8651234567" },
      currentStepId: "vehicleYear",
      status: "released",
      claimedBy: "associate-a",
    });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "released");
    const [outcome] = await getLeadOutcomesByIds([lead!.id]);
    expect(outcome.assignedTo).toBe("associate-a");
  });

  it("leaves the resulting lead's outcome unassigned when nobody claimed the chat", async () => {
    const conversation = makeConversation({ collectedFields: fullAutoAnswers, currentStepId: null });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "completed-unclaimed");
    const [outcome] = await getLeadOutcomesByIds([lead!.id]);
    expect(outcome.assignedTo).toBeNull();
  });

  it("returns null and links nothing when there's no name and no way to reach the prospect", async () => {
    const conversation = makeConversation({
      collectedFields: { personalOrCommercial: "personal" },
      currentStepId: "vehicleYear",
    });
    await createConversation(conversation);

    const lead = await finalizeConversation(conversation.id, "abandoned");
    expect(lead).toBeNull();

    const updated = await getConversation(conversation.id);
    expect(updated?.leadId).toBeNull();
  });
});
