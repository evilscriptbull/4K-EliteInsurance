import { describe, it, expect } from "vitest";
import { violatesGuardrails } from "@/lib/compliance/guardrails";

describe("violatesGuardrails", () => {
  it.each([
    ["you're covered for that", "coverage-bound implication"],
    ["your coverage is bound as of today", "coverage-bound statement"],
    ["we offer guaranteed savings on every policy", "guaranteed savings claim"],
    ["this is guaranteed to save you money", "guaranteed comparative claim"],
    ["we guarantee the lowest rate", "first-person guarantee"],
    ["this definitely covers water damage", "definitive coverage determination"],
    ["this policy will cover any incident", "definitive policy promise"],
  ])("flags: %s (%s)", (text) => {
    expect(violatesGuardrails(text)).toBe(true);
  });

  it("does not flag a benign sentence", () => {
    expect(violatesGuardrails("Let's review your options and see what might work for your situation.")).toBe(false);
  });
});
