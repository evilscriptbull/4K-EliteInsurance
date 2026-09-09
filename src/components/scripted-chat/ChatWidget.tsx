"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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

type TranscriptEntry = { role: "assistant" | "user"; content: string };
type Status = "loading" | "active" | "complete" | "unavailable" | "error";

/**
 * Quick Quote Chat — a scripted decision-tree questionnaire, not a real AI
 * conversation (see docs/backlog.md). Every question/branch comes from the
 * server (lib/scripted-chat), so this component just renders whatever step
 * it's told about; it has no logic of its own about what to ask next.
 */
export function ChatWidget({ familySlug }: { familySlug: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [step, setStep] = useState<ClientStep | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

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
    // A stale/claimed/already-finished conversation — nothing left to drive here.
    setStep(null);
    setStatus("complete");
  }

  function handleTextSubmit(event: FormEvent) {
    event.preventDefault();
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
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className={
              entry.role === "assistant"
                ? "self-start rounded-2xl bg-surface px-4 py-2 text-sm text-foreground"
                : "self-end rounded-2xl bg-brand-800 px-4 py-2 text-sm text-white"
            }
          >
            {entry.content}
          </div>
        ))}
        {status === "loading" && <p className="text-sm text-brand-500">Loading…</p>}
        <div ref={bottomRef} />
      </div>

      {errors.length > 0 && <p className="text-sm text-red-600">{errors.join(" ")}</p>}

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
                type={step.type === "date" ? "date" : step.type === "number" ? "number" : "text"}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="flex-1 rounded-full border border-border px-4 py-2 text-sm"
                placeholder="Type your answer…"
                autoFocus
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
