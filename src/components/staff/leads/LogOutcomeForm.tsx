"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "bound", label: "Bound" },
  { value: "lost", label: "Lost" },
  { value: "unreachable", label: "Unreachable" },
] as const;

/**
 * Open to any active associate regardless of assignment -- logging
 * progress isn't gated on having taken the lead first, matching this
 * queue's existing shared-visibility model. Inline expand/collapse instead
 * of a modal -- no dialog primitive exists in this codebase and none is
 * needed for a form this small.
 */
export function LogOutcomeForm({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [writtenPremium, setWrittenPremium] = useState("");
  const [carrier, setCarrier] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!expanded) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setExpanded(true)}>
        Log outcome
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (status === "bound" && (!writtenPremium || !carrier.trim())) {
      setError("Premium and carrier are required when marking a lead bound.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    setSubmitting(true);
    const response = await fetch("/api/staff/leads/log-outcome", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        leadId,
        status,
        writtenPremium: status === "bound" ? Number(writtenPremium) : undefined,
        carrier: status === "bound" ? carrier.trim() : undefined,
        notes: notes.trim() || undefined,
      }),
    });
    const json = await response.json();
    setSubmitting(false);

    if (!json.ok || !json.logged) {
      setError("Something went wrong — try again.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="rounded-md border border-border px-2 py-1 text-sm"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {status === "bound" && (
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={writtenPremium}
            onChange={(event) => setWrittenPremium(event.target.value)}
            placeholder="Written premium"
            className="flex-1 rounded-md border border-border px-2 py-1 text-sm"
          />
          <input
            type="text"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            placeholder="Carrier"
            className="flex-1 rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>
      )}

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="rounded-md border border-border px-2 py-1 text-sm"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
