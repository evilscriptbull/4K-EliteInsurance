import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getAssociate, listActiveAssociates } from "@/lib/associates/store";
import { listLive, listNeedsFollowUp, type StoredConversation } from "@/lib/conversations/store";
import { getLeadById } from "@/lib/leads/store";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ClaimButton } from "@/components/staff/ClaimButton";
import { SignOutButton } from "@/components/staff/SignOutButton";

function familyLabel(slug: string): string {
  return getQuoteFormFamily(slug)?.label ?? slug;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function StaffDashboardPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return (
      <Section background="brand">
        <p className="text-white">Staff accounts aren&apos;t set up yet.</p>
      </Section>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/staff/login");
  }

  const associate = await getAssociate(user.id);
  const [live, needsFollowUp, associates] = await Promise.all([
    listLive(),
    listNeedsFollowUp(),
    listActiveAssociates(),
  ]);

  const associateNames = new Map(associates.map((a) => [a.id, a.name]));

  const followUpWithLeads = await Promise.all(
    needsFollowUp.map(async (conversation) => ({
      conversation,
      lead: conversation.leadId ? await getLeadById(conversation.leadId) : null,
    })),
  );

  return (
    <Section background="brand">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            {associate ? `Welcome, ${associate.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <SignOutButton />
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Live Queue ({live.length})
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {live.length === 0 && (
              <Card className="bg-background text-foreground">
                <p className="text-sm text-brand-700">No active conversations right now.</p>
              </Card>
            )}
            {live.map((conversation) => (
              <LiveCard key={conversation.id} conversation={conversation} claimedByName={conversation.claimedBy ? associateNames.get(conversation.claimedBy) : undefined} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Needs Follow-up ({followUpWithLeads.length})
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {followUpWithLeads.length === 0 && (
              <Card className="bg-background text-foreground">
                <p className="text-sm text-brand-700">Nothing waiting on follow-up.</p>
              </Card>
            )}
            {followUpWithLeads.map(({ conversation, lead }) => (
              <FollowUpCard key={conversation.id} conversation={conversation} lead={lead} />
            ))}
          </div>
        </section>
      </div>
    </Section>
  );
}

function LiveCard({
  conversation,
  claimedByName,
}: {
  conversation: StoredConversation;
  claimedByName?: string;
}) {
  return (
    <Card className="bg-background text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-brand-900">{familyLabel(conversation.familySlug)}</p>
          <p className="text-xs text-brand-600">
            {conversation.status === "claimed" ? `Claimed by ${claimedByName ?? "someone"}` : "Unclaimed"} · Started{" "}
            {formatTime(conversation.createdAt)}
          </p>
        </div>
        {conversation.status !== "claimed" && <ClaimButton conversationId={conversation.id} />}
      </div>
    </Card>
  );
}

function FollowUpCard({ conversation, lead }: { conversation: StoredConversation; lead: Awaited<ReturnType<typeof getLeadById>> }) {
  const collected = conversation.state.collectedFields as Record<string, unknown>;
  const name = lead ? `${lead.contact.firstName} ${lead.contact.lastName}` : [collected.firstName, collected.lastName].filter(Boolean).join(" ");
  const contactInfo = lead?.contact.phone ?? lead?.contact.email ?? (collected.phone as string) ?? (collected.email as string);

  return (
    <Card className="bg-background text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-brand-900">
            {familyLabel(conversation.familySlug)}
            {lead && <span className="ml-2 text-xs font-normal uppercase text-accent-600">{lead.leadScoreTier}</span>}
          </p>
          <p className="text-sm text-brand-800">{name || "No contact info collected"}</p>
          {contactInfo && <p className="text-xs text-brand-600">{contactInfo}</p>}
          <p className="text-xs text-brand-600">
            {conversation.status === "abandoned" ? "Abandoned" : "Completed, unclaimed"} · {formatTime(conversation.updatedAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
