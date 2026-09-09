"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.push("/staff/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
