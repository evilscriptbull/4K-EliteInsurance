import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getAssociate, listActiveAssociates } from "@/lib/associates/store";
import { listLive, listNeedsFollowUp, type StoredConversation } from "@/lib/conversations/store";
import { listMessages, type StoredMessage } from "@/lib/conversations/messages";
import { getLeadById } from "@/lib/leads/store";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ClaimButton } from "@/components/staff/ClaimButton";
import { ClaimedActions } from "@/components/staff/ClaimedActions";
import { SignOutButton } from "@/components/staff/SignOutButton";
import { DashboardLiveRefresh } from "@/components/staff/DashboardLiveRefresh";
import { LiveChatPanel } from "@/components/staff/LiveChatPanel";

function familyLabel(slug: string): string {
  return getQuoteFormFamily(slug)?.label ?? slug;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/** "vehicleYear" -> "Vehicle Year" */
function humanizeFieldName(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function CollectedAnswers({ fields }: { fields: Record<string, unknown> }) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined && value !== "");
  if (entries.length === 0) {
    return <p className="mt-2 text-xs italic text-brand-500">No answers collected yet.</p>;
  }
  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-brand-500">{humanizeFieldName(key)}</dt>
          <dd className="text-brand-800">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
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
  if (!associate || !associate.active) {
    return (
      <Section background="brand">
        <p className="text-white">You don&apos;t have staff dashboard access. Contact your administrator.</p>
      </Section>
    );
  }

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

  // Only fetched for conversations claimed by the viewer themselves — the
  // live-chat panel needs full transcript context, but nobody else's
  // dashboard card needs it (avoids an N+1 fetch across the whole queue).
  const claimedByMeMessages = new Map<string, StoredMessage[]>(
    await Promise.all(
      live
        .filter((conversation) => conversation.status === "claimed" && conversation.claimedBy === user.id)
        .map(async (conversation) => [conversation.id, await listMessages(conversation.id)] as const),
    ),
  );

  return (
    <Section background="brand">
      <DashboardLiveRefresh />
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            Welcome, {associate.name.split(" ")[0]}
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
              <LiveCard
                key={conversation.id}
                conversation={conversation}
                claimedByName={conversation.claimedBy ? associateNames.get(conversation.claimedBy) : undefined}
                currentUserId={user.id}
                initialMessages={claimedByMeMessages.get(conversation.id)}
              />
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
  currentUserId,
  initialMessages,
}: {
  conversation: StoredConversation;
  claimedByName?: string;
  currentUserId: string;
  initialMessages?: StoredMessage[];
}) {
  const claimedByMe = conversation.claimedBy === currentUserId;

  return (
    <Card className="bg-background text-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-semibold text-brand-900">{familyLabel(conversation.familySlug)}</p>
          <p className="text-xs text-brand-600">
            {conversation.status === "claimed" ? `Claimed by ${claimedByMe ? "you" : (claimedByName ?? "someone")}` : "Unclaimed"} ·
            Started {formatTime(conversation.createdAt)}
          </p>
          <CollectedAnswers fields={conversation.state.collectedFields as Record<string, unknown>} />
          {claimedByMe && initialMessages && (
            <LiveChatPanel conversationId={conversation.id} initialMessages={initialMessages} />
          )}
        </div>
        {conversation.status !== "claimed" && <ClaimButton conversationId={conversation.id} />}
        {claimedByMe && <ClaimedActions conversationId={conversation.id} />}
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
