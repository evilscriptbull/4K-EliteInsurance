"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";
import type { StoredMessage } from "@/lib/conversations/messages";

type LiveEntry = Pick<StoredMessage, "role" | "content"> & { authorName?: string };

/**
 * Shown on a conversation the current associate has claimed — the actual
 * live takeover: free-text messages sent here appear for the customer
 * immediately (Realtime Broadcast, src/lib/conversations/broadcast.ts),
 * and the customer's replies appear here the same way. Server-rendered
 * `initialMessages` (the conversation's history up to now) plus anything
 * that arrives live on the same per-conversation channel the customer's
 * ChatWidget subscribes to.
 */
export function LiveChatPanel({ conversationId, initialMessages }: { conversationId: string; initialMessages: StoredMessage[] }) {
  const [messages, setMessages] = useState<LiveEntry[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prev) => [...prev, { role: payload.role, content: payload.content, authorName: payload.authorName }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    setSending(true);
    setInputValue("");
    await fetch("/api/staff/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId, content }),
    });
    setSending(false);
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div ref={listRef} className="flex max-h-48 flex-col gap-2 overflow-y-auto text-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "self-start rounded-2xl bg-surface px-3 py-1.5 text-foreground"
                : message.role === "system"
                  ? "self-center rounded-full bg-surface px-3 py-1 text-xs italic text-brand-500"
                  : "self-end rounded-2xl bg-brand-800 px-3 py-1.5 text-white"
            }
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="flex-1 rounded-full border border-border px-4 py-2 text-sm"
          placeholder="Type a message…"
        />
        <Button type="submit" size="sm" disabled={sending}>
          Send
        </Button>
      </form>
    </div>
  );
}
