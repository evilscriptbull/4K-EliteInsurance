"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

/** Shown on a conversation the current associate has claimed — release it back to the queue, or mark it done. */
export function ClaimedActions({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [pending, setPending] = useState<"release" | "complete" | null>(null);

  async function callAction(path: "release" | "complete") {
    if (!supabase) return;
    setPending(path);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setPending(null);
      return;
    }

    await fetch(`/api/staff/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId }),
    });

    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => callAction("release")} disabled={pending !== null}>
        {pending === "release" ? "Releasing…" : "Release"}
      </Button>
      <Button size="sm" onClick={() => callAction("complete")} disabled={pending !== null}>
        {pending === "complete" ? "Closing…" : "Mark Complete"}
      </Button>
    </div>
  );
}
