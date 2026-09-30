import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getAssociate, listActiveAssociates } from "@/lib/associates/store";
import { listLive, type StoredConversation } from "@/lib/conversations/store";
import { listMessages, type StoredMessage } from "@/lib/conversations/messages";
import { listOpenLeadsForFollowUp, type FollowUpLead } from "@/lib/leads/outcomes";
import { getQuoteFormFamily } from "@/lib/config/quote-forms";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ClaimButton } from "@/components/staff/ClaimButton";
import { ClaimedActions } from "@/components/staff/ClaimedActions";
import { SignOutButton } from "@/components/staff/SignOutButton";
import { DashboardLiveRefresh } from "@/components/staff/DashboardLiveRefresh";
import { LiveChatPanel } from "@/components/staff/LiveChatPanel";

const DEFAULT_FOLLOW_UP_LIMIT = 50;

function familyLabel(slug: string): string {
  return getQuoteFormFamily(slug)?.label ?? slug;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/** "2026-09-30T12:00:00Z" -> "3h ago" */
function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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

export default async function StaffDashboardPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
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

  const requestedLimit = Number((await searchParams).limit) || DEFAULT_FOLLOW_UP_LIMIT;

  const [live, followUpLeadsPlusOne, associates] = await Promise.all([
    listLive(),
    listOpenLeadsForFollowUp(requestedLimit),
    listActiveAssociates(),
  ]);

  const associateNames = new Map(associates.map((a) => [a.id, a.name]));
  const hasMoreFollowUp = followUpLeadsPlusOne.length > requestedLimit;
  const followUpLeads = followUpLeadsPlusOne.slice(0, requestedLimit);

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
            Needs Follow-up ({followUpLeads.length}
            {hasMoreFollowUp ? "+" : ""})
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {followUpLeads.length === 0 && (
              <Card className="bg-background text-foreground">
                <p className="text-sm text-brand-700">Nothing waiting on follow-up.</p>
              </Card>
            )}
            {followUpLeads.map(({ lead, outcome }) => (
              <FollowUpCard
                key={lead.id}
                lead={lead}
                assigneeName={outcome.assignedTo ? associateNames.get(outcome.assignedTo) : undefined}
              />
            ))}
          </div>
          {hasMoreFollowUp && (
            <Link
              href={`?limit=${requestedLimit * 2}`}
              className="mt-3 inline-block text-sm text-brand-200 underline hover:text-white"
            >
              Show more
            </Link>
          )}
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

function FollowUpCard({ lead, assigneeName }: { lead: FollowUpLead["lead"]; assigneeName?: string }) {
  const name = `${lead.contact.firstName} ${lead.contact.lastName}`.trim();

  return (
    <Card className="bg-background text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-brand-900">
            {name || "No name collected"}
            <span className="ml-2 text-xs font-normal uppercase text-accent-600">{lead.leadScoreTier}</span>
          </p>
          {lead.contact.phone && (
            <p className="text-xs text-brand-600">
              <a href={`tel:${lead.contact.phone}`} className="underline">
                {lead.contact.phone}
              </a>
            </p>
          )}
          <p className="text-xs text-brand-600">
            {lead.line} · {lead.channel} · {lead.completeness === "partial" ? "partial" : "full"} · {timeAgo(lead.createdAt)}
          </p>
          <p className="text-xs text-brand-600">{assigneeName ? `Assigned to ${assigneeName}` : "Unclaimed"}</p>
        </div>
      </div>
    </Card>
  );
}
