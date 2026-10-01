"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Thin expand/collapse wrapper around a server-passed <AgentBriefPanel> --
 * same thin-client-wrapper convention as ClaimedActions/TakeButton, just
 * toggling visibility rather than calling an API.
 */
export function ExpandableBriefSection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs font-semibold uppercase tracking-wide text-brand-500 underline"
      >
        {open ? "Hide agent brief" : "Show agent brief"}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
