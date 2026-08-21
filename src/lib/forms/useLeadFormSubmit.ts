"use client";

import { useState } from "react";
import type { SubmitState } from "@/components/forms/FormStatus";

/**
 * Shared submit mechanics for all 8 forms on the site: posts JSON to a
 * local API route, tracks submit state, surfaces per-field errors from the
 * server's zod validation, and injects UTM/landing-page source data read
 * from the current URL. Each form component is responsible for building
 * its own correctly-typed payload (numbers/booleans coerced from its own
 * inputs) before calling submit — this hook doesn't parse FormData itself.
 */
export function useLeadFormSubmit(endpoint: string) {
  const [state, setState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(payload: Record<string, unknown>): Promise<boolean> {
    setState("submitting");
    setFieldErrors({});

    const params = new URLSearchParams(window.location.search);
    const body = {
      ...payload,
      source: {
        utmSource: params.get("utm_source") ?? undefined,
        utmMedium: params.get("utm_medium") ?? undefined,
        utmCampaign: params.get("utm_campaign") ?? undefined,
        landingPage: window.location.pathname,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok || !json.ok) {
        setFieldErrors(json.errors?.fieldErrors ?? {});
        setState("error");
        return false;
      }

      setState("success");
      return true;
    } catch {
      setState("error");
      return false;
    }
  }

  return { state, fieldErrors, submit };
}
