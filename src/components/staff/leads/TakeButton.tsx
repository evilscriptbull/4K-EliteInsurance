"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

export function TakeButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [status, setStatus] = useState<"idle" | "taking" | "taken">("idle");

  async function handleTake() {
    if (!supabase) return;
    setStatus("taking");

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setStatus("idle");
      return;
    }

    const response = await fetch("/api/staff/leads/take", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadId }),
    });
    const json = await response.json();

    if (!json.ok || !json.taken) {
      setStatus("taken");
      return;
    }

    router.refresh();
  }

  if (status === "taken") {
    return <p className="text-sm text-brand-700">Someone else just took this — refresh to see the latest.</p>;
  }

  return (
    <Button size="sm" onClick={handleTake} disabled={status === "taking"}>
      {status === "taking" ? "Taking…" : "Take"}
    </Button>
  );
}
