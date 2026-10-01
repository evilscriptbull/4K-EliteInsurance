"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

/** Shown on a follow-up lead the current associate has taken — release it back to the queue. */
export function ReleaseButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [releasing, setReleasing] = useState(false);

  async function handleRelease() {
    if (!supabase) return;
    setReleasing(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setReleasing(false);
      return;
    }

    await fetch("/api/staff/leads/release", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadId }),
    });

    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRelease} disabled={releasing}>
      {releasing ? "Releasing…" : "Release to queue"}
    </Button>
  );
}
