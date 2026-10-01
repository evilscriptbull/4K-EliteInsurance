"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";
import { AgentBriefPanel } from "@/components/staff/AgentBriefPanel";
import type { AgentBriefContent } from "@/lib/schemas/agentBrief";

export function ClaimButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [status, setStatus] = useState<"idle" | "claiming" | "taken">("idle");
  const [instantBrief, setInstantBrief] = useState<AgentBriefContent | null>(null);

  async function handleClaim() {
    if (!supabase) return;
    setStatus("claiming");

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setStatus("idle");
      return;
    }

    const response = await fetch("/api/staff/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId }),
    });
    const json = await response.json();

    if (!json.ok || !json.claimed) {
      setStatus("taken");
      return;
    }

    // Inherently transient -- this component unmounts the moment the
    // refreshed server payload shows status "claimed" (LiveCard stops
    // rendering ClaimButton at all then), so there's no need to clear
    // this state afterward.
    if (json.instantBrief) setInstantBrief(json.instantBrief as AgentBriefContent);
    router.refresh();
  }

  if (status === "taken") {
    return <p className="text-sm text-brand-700">Someone else just claimed this — refresh to see the latest.</p>;
  }

  return (
    <div>
      <Button size="sm" onClick={handleClaim} disabled={status === "claiming"}>
        {status === "claiming" ? "Claiming…" : "Claim"}
      </Button>
      {instantBrief && (
        <div className="mt-2">
          <AgentBriefPanel content={instantBrief} />
        </div>
      )}
    </div>
  );
}
