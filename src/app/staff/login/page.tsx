"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function StaffLoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!supabase) return;

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Email or password didn't match. Try again, or ask your administrator for a new invite.");
      setSubmitting(false);
      return;
    }
    router.push("/staff/dashboard");
    router.refresh();
  }

  if (!supabase) {
    return (
      <Section background="brand">
        <div className="mx-auto max-w-md">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Staff Login</h1>
          <Card className="mt-8 bg-background text-foreground">
            <p className="text-sm text-brand-700">Staff accounts aren&apos;t set up yet. Contact your administrator.</p>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section background="brand">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Staff Login</h1>
        <Card className="mt-8 bg-background text-foreground">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
}
