"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ClientStep {
  id: string;
  field: string;
  prompt: string;
  type: "text" | "select" | "number" | "boolean" | "date";
  options?: { value: string; label: string }[];
  optional?: boolean;
}

type TranscriptEntry = { role: "assistant" | "user" | "associate" | "system"; content: string; authorName?: string };
type Status = "loading" | "active" | "live" | "complete" | "ended" | "unavailable" | "error";

/**
 * Quick Quote Chat — a scripted decision-tree questionnaire, not a real AI
 * conversation (see docs/backlog.md). Every question/branch comes from the
 * server (lib/scripted-chat), so this component just renders whatever step
 * it's told about; it has no logic of its own about what to ask next.
 *
 * Once an associate claims the conversation, it switches to a live
 * free-text mode (status "live") — see the Realtime Broadcast subscription
 * below, which is what makes the switch immediate without the customer
 * having to submit anything first.
 */
export function ChatWidget({ familySlug }: { familySlug: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [step, setStep] = useState<ClientStep | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = {
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      gclid: params.get("gclid") ?? undefined,
      landingPage: window.location.pathname,
    };

    fetch("/api/scripted-chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familySlug, source }),
    })
      .then(async (response) => {
        if (!response.ok) {
          setStatus("unavailable");
          return;
        }
        const json = await response.json();
        setConversationId(json.conversationId);
        setTranscript([
          { role: "assistant", content: json.intro },
          { role: "assistant", content: json.step.prompt },
        ]);
        setStep(json.step);
        setStatus("active");
      })
      .catch(() => setStatus("error"));
  }, [familySlug]);

  useEffect(() => {
    // Joined the moment conversationId is known — i.e. throughout the
    // whole scripted phase, before any claim happens. That's what makes
    // takeover immediate: the control event flips status the instant an
    // associate claims, independent of the customer's own next action.
    if (!conversationId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setTranscript((prev) => [
          ...prev,
          { role: payload.role, content: payload.content, authorName: payload.authorName },
        ]);
      })
      .on("broadcast", { event: "control" }, ({ payload }) => {
        if (payload.type === "takeover" && statusRef.current === "active") {
          setStatus("live");
        } else if (payload.type === "handoff" && (statusRef.current === "active" || statusRef.current === "live")) {
          setStep(null);
          setStatus(payload.reason === "released" ? "ended" : "complete");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    // Scroll only the transcript panel itself, not scrollIntoView() — that
    // scrolls every ancestor scroll container, including the whole page,
    // which was reported as "the page scrolls" on every send.
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript]);

  useEffect(() => {
    // autoFocus only fires on an element's first mount. Consecutive
    // text-type questions reuse the same <input> (same position, same
    // type) across renders, so autoFocus never re-fires after the first
    // question — reported as the answer box "getting unselected" on every
    // send. Focus explicitly whenever the active step changes instead.
    inputRef.current?.focus();
  }, [step, status]);

  async function submitAnswer(rawAnswer: unknown, label: string) {
    if (!conversationId || !step) return;
    setErrors([]);
    setTranscript((prev) => [...prev, { role: "user", content: label }]);
    setInputValue("");

    const response = await fetch("/api/scripted-chat/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, stepId: step.id, answer: rawAnswer }),
    });
    const json = await response.json();

    if (json.status === "invalid") {
      setErrors(json.errors ?? ["That doesn't look right — try again."]);
      setTranscript((prev) => prev.slice(0, -1));
      return;
    }
    if (json.status === "next") {
      setStep(json.step);
      setTranscript((prev) => [...prev, { role: "assistant", content: json.step.prompt }]);
      return;
    }
    if (json.status === "complete") {
      setStep(null);
      setStatus("complete");
      setTranscript((prev) => [...prev, { role: "assistant", content: json.closingMessage }]);
      return;
    }
    // "claimed" — the takeover control event normally handles this switch
    // already; this is just a safety net in case that broadcast hasn't
    // arrived yet, so the customer's answer never gets swallowed silently.
    setStep(null);
    if (json.status === "claimed") {
      setStatus("live");
    } else {
      setStatus("complete");
    }
  }

  async function sendLiveMessage(content: string) {
    if (!conversationId || !content.trim()) return;
    setInputValue("");
    // No local echo here — the message renders once it comes back over
    // the broadcast channel, same as the associate's messages do.
    await fetch("/api/scripted-chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: content.trim() }),
    });
  }

  function handleTextSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "live") {
      sendLiveMessage(inputValue);
      return;
    }
    if (!step) return;
    if (!inputValue.trim()) {
      if (step.optional) submitAnswer(undefined, "(skipped)");
      return;
    }
    submitAnswer(inputValue.trim(), inputValue.trim());
  }

  if (status === "unavailable" || status === "error") {
    return (
      <Card className="bg-background text-foreground">
        <p className="text-sm text-brand-700">
          Quick chat isn&apos;t available right now — please use the form below instead.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 bg-background text-foreground">
      <div ref={transcriptRef} className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className={
              entry.role === "user"
                ? "self-end rounded-2xl bg-brand-800 px-4 py-2 text-sm text-white"
                : entry.role === "system"
                  ? "self-center rounded-full bg-surface px-4 py-1 text-xs italic text-brand-500"
                  : "self-start rounded-2xl bg-surface px-4 py-2 text-sm text-foreground"
            }
          >
            {entry.role === "associate" && entry.authorName && (
              <p className="mb-0.5 text-xs font-semibold text-brand-600">{entry.authorName}</p>
            )}
            {entry.content}
          </div>
        ))}
        {status === "loading" && <p className="text-sm text-brand-500">Loading…</p>}
      </div>

      {errors.length > 0 && <p className="text-sm text-red-600">{errors.join(" ")}</p>}

      {status === "ended" && (
        <p className="text-sm text-brand-700">This chat has ended — an agent will follow up shortly.</p>
      )}

      {status === "live" && (
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="flex-1 rounded-full border border-border px-4 py-2 text-sm"
            placeholder="Type a message…"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      )}

      {status === "active" && step && (
        <div>
          {step.type === "select" || step.type === "boolean" ? (
            <div className="flex flex-wrap gap-2">
              {(step.options ?? []).map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => submitAnswer(step.type === "boolean" ? option.value === "true" : option.value, option.label)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type={step.type === "date" ? "date" : step.type === "number" ? "number" : "text"}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="flex-1 rounded-full border border-border px-4 py-2 text-sm"
                placeholder="Type your answer…"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
              {step.optional && (
                <Button type="button" variant="ghost" size="sm" onClick={() => submitAnswer(undefined, "(skipped)")}>
                  Skip
                </Button>
              )}
            </form>
          )}
        </div>
      )}
    </Card>
  );
}
