"use client";

import { useEffect } from "react";
import type { InsuranceLine } from "@/lib/config/agency";
import { trackLandingPageView } from "@/lib/analytics/track";

/** Fires once per mount so LineLandingPage (a server component) can track without itself becoming client-side. */
export function LandingPageViewTracker({ line }: { line: InsuranceLine }) {
  useEffect(() => {
    trackLandingPageView(line);
  }, [line]);

  return null;
}
