"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Status = "code" | "verifying" | "ready" | "saving" | "done" | "unavailable";

/**
 * Replaces the old link-based /staff/set-password flow. That page relied
 * on Supabase's /auth/v1/verify endpoint, which performs the sensitive,
 * one-time "consume this invite" action on a bare GET request — exactly
 * what a corporate email security scanner (Microsoft Defender Safe Links
 * and similar) does automatically to every link in incoming mail, before
 * the real recipient ever opens the email. Confirmed live against this
 * project's real invite (see docs/backlog.md) and confirmed technically:
 * the link's token_hash and the separate numeric code Supabase can email
 * (`{{ .Token }}`) share the same underlying secret, so a scanner-consumed
 * link burns the code too — a fallback code *alongside* a clickable
 * verify-link would not have helped.
 *
 * This page has no such endpoint to pre-fetch: it's an inert form. The
 * only sensitive action — verifyOtp() — happens on an explicit form
 * submit, which a scanner fetching the page never triggers. The invite
 * email must not contain Supabase's own confirmation link, only this
 * page's plain URL (safe to click/prefetch) and the numeric code as text.
 */
export default function StaffJoinPage() {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [status, setStatus] = useState<Status>(() => (supabase ? "code" : "unavailable"));
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("email") ?? "";
  });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!supabase) return;

    setStatus("verifying");
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "invite" });
    if (verifyError) {
      setError("That code didn't work — double-check it, or ask your administrator for a new one.");
      setStatus("code");
      return;
    }
    setStatus("ready");
  }

  async function handlePasswordSubmit(event: FormEvent) {
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

    // Record real completion in our own associates table — see
    // /api/staff/complete-setup for why this can't be Supabase's own
    // email_confirmed_at/last_sign_in_at. Not fatal if it fails; the
    // associate can still use their new password either way.
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      await fetch("/api/staff/complete-setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    setStatus("done");
  }

  return (
    <Section background="brand">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Join the Team</h1>
        <Card className="mt-8 bg-background text-foreground">
          {status === "unavailable" && (
            <p className="text-sm text-brand-700">
              Staff accounts aren&apos;t set up yet. Contact your administrator.
            </p>
          )}

          {status === "done" && (
            <p className="text-sm text-brand-700">
              Your password is set.{" "}
              <Link href="/staff/login" className="underline">
                Sign in to the dashboard
              </Link>
              .
            </p>
          )}

          {(status === "code" || status === "verifying") && (
            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-brand-700">Enter your email and the code from your invite.</p>
              <label className="text-sm">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-sm">
                Invite code
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  placeholder="123456"
                  required
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={status === "verifying"}>
                {status === "verifying" ? "Checking…" : "Continue"}
              </Button>
            </form>
          )}

          {(status === "ready" || status === "saving") && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
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
