"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Status = "checking" | "ready" | "invalid" | "saving" | "done" | "unavailable";

/**
 * Where an associate lands after clicking their Supabase invite/reset
 * email (see scripts/seed-associates.mjs's `redirectTo`). Supabase's
 * invite links use the legacy implicit flow — tokens land in the URL
 * *hash* (`#access_token=...&refresh_token=...`) — but @supabase/ssr's
 * createBrowserClient hardcodes `flowType: "pkce"` and can't auto-detect
 * that format (confirmed by reading its source: node_modules/@supabase/
 * ssr/dist/module/createBrowserClient.js). So this page parses the hash
 * itself and calls setSession() explicitly instead of relying on
 * getSession() to find a session on its own. No dashboard yet (see
 * docs/backlog.md) — this is just step one of staff auth.
 */
export default function SetPasswordPage() {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [status, setStatus] = useState<Status>(() => (supabase ? "checking" : "unavailable"));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    // Wrapped in an async IIFE (rather than setState calls directly in the
    // effect body) so every branch — including the synchronous ones —
    // resolves via a microtask, satisfying react-hooks/set-state-in-effect.
    (async () => {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (params.get("error")) {
        setStatus("invalid");
        return;
      }

      if (!accessToken || !refreshToken) {
        // No tokens in the URL (e.g. a page refresh after the first load
        // already consumed them) — fall back to whatever session may
        // already be persisted.
        const { data } = await supabase.auth.getSession();
        setStatus(data.session ? "ready" : "invalid");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      setStatus(sessionError ? "invalid" : "ready");
      if (!sessionError) {
        // Don't leave live tokens sitting in the URL bar/history.
        window.history.replaceState(null, "", window.location.pathname);
      }
    })();
  }, [supabase]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    if (!supabase) return;

    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus("ready");
      return;
    }
    setStatus("done");
  }

  return (
    <Section background="brand">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Set Your Password</h1>
        <Card className="mt-8 bg-background text-foreground">
          {status === "checking" && <p className="text-sm text-brand-700">Checking your invite link…</p>}

          {status === "unavailable" && (
            <p className="text-sm text-brand-700">
              Staff accounts aren&apos;t set up yet. Contact your administrator.
            </p>
          )}

          {status === "invalid" && (
            <p className="text-sm text-brand-700">
              This link is invalid or has expired. Ask your administrator to send you a new invite.
            </p>
          )}

          {status === "done" && (
            <p className="text-sm text-brand-700">
              Your password is set. You can close this tab — sign-in for the sales dashboard is coming soon.
            </p>
          )}

          {(status === "ready" || status === "saving") && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-sm">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  minLength={8}
                  required
                />
              </label>
              <label className="text-sm">
                Confirm password
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  minLength={8}
                  required
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving…" : "Set Password"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </Section>
  );
}
