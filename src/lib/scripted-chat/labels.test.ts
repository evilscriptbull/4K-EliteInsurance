import { describe, it, expect } from "vitest";
import { buildFieldLabelLookup } from "@/lib/scripted-chat/labels";
import { autoFlow } from "@/lib/scripted-chat/flows/auto";

describe("buildFieldLabelLookup", () => {
  const lookup = buildFieldLabelLookup(autoFlow);

  it("maps a normal step's own field to its prompt and type", () => {
    expect(lookup.get("vehicleYear")).toEqual({ prompt: "What year is the vehicle?", type: "text" });
    expect(lookup.get("smsConsent")?.type).toBe("boolean");
  });

  it("maps both of a spreadFields step's produced keys to the same prompt", () => {
    const fullNamePrompt = "First, what's your first and last name?";
    expect(lookup.get("firstName")).toEqual({ prompt: fullNamePrompt, type: "text" });
    expect(lookup.get("lastName")).toEqual({ prompt: fullNamePrompt, type: "text" });
  });

  it("returns undefined for a key the flow doesn't recognize", () => {
    expect(lookup.get("notARealField")).toBeUndefined();
  });
});
