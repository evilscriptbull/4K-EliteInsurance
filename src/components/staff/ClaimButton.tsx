"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

export function ClaimButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [status, setStatus] = useState<"idle" | "claiming" | "taken">("idle");

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

    router.refresh();
  }

  if (status === "taken") {
    return <p className="text-sm text-brand-700">Someone else just claimed this — refresh to see the latest.</p>;
  }

  return (
    <Button size="sm" onClick={handleClaim} disabled={status === "claiming"}>
      {status === "claiming" ? "Claiming…" : "Claim"}
    </Button>
  );
}
