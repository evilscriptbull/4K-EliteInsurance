"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

/**
 * Renders nothing — just keeps the dashboard's server-rendered Live
 * Queue/Needs Follow-up lists fresh as conversations and lead outcomes
 * change (claimed, released, completed, a new one starts, Take/Log
 * outcome/Release on a follow-up lead), without every associate having to
 * manually reload. Subscribes to both tables' Realtime postgres_changes
 * (safe here — see the RLS policy comments in
 * migrations/0004_enable_conversations_realtime.sql and
 * migrations/0007_nappy_cable.sql for why these two tables can have a
 * public-to-authenticated SELECT policy while conversation_messages cannot)
 * and just calls router.refresh() on any change, re-running the dashboard's
 * Server Component. A short debounce coalesces bursts (e.g. claim + the
 * resulting message inserts) into one refresh.
 */
export function DashboardLiveRefresh() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    function refresh() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => router.refresh(), 300);
    }

    const channel = supabase
      .channel("dashboard:conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_outcomes" }, refresh)
      .subscribe();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
