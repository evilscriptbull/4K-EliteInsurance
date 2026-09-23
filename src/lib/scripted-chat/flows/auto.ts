import { z } from "zod";
import type { ScriptedFlow } from "@/lib/scripted-chat/types";

/**
 * Pilot flow. Mirrors autoQuoteSchema + quoteContactBase field-for-field
 * (src/lib/schemas/forms.ts) so a completed conversation's answers, plus
 * `family: "auto"` and `state: "TN"` added at finalize time (TN-only pilot
 * scope — see docs/backlog.md), parse directly with quoteFormSchema and
 * flow through the existing quoteFormToLead() mapper unchanged.
 *
 * Script wording signed off by Chaz Goodin (compliance approver,
 * agency.complianceApprover) on 2026-09-23 — approved for real customer
 * traffic.
 */
export const autoFlow: ScriptedFlow = {
  slug: "auto",
  intro:
    "Hi! I can get your auto quote started in about 2 minutes. I'll ask a few quick questions, and one of our licensed agents will follow up with real numbers — I can't quote or bind coverage myself.",
  firstStepId: "personalOrCommercial",
  steps: [
    {
      id: "personalOrCommercial",
      field: "personalOrCommercial",
      prompt: "Is this for a personal vehicle or a commercial/business vehicle?",
      type: "select",
      options: [
        { value: "personal", label: "Personal" },
        { value: "commercial", label: "Commercial" },
      ],
      schema: z.enum(["personal", "commercial"]),
      next: () => "vehicleYear",
    },
    {
      id: "vehicleYear",
      field: "vehicleYear",
      prompt: "What year is the vehicle?",
      type: "text",
      schema: z.string().min(4, "Enter a 4-digit year, like 2021."),
      next: () => "vehicleMake",
    },
    {
      id: "vehicleMake",
      field: "vehicleMake",
      prompt: "And the make?",
      type: "text",
      schema: z.string().min(1, "Enter the vehicle's make."),
      next: () => "vehicleModel",
    },
    {
      id: "vehicleModel",
      field: "vehicleModel",
      prompt: "What model?",
      type: "text",
      schema: z.string().min(1, "Enter the vehicle's model."),
      next: () => "coverageType",
    },
    {
      id: "coverageType",
      field: "coverageType",
      prompt: "Are you looking for full coverage or liability only?",
      type: "select",
      options: [
        { value: "full", label: "Full coverage" },
        { value: "liability-only", label: "Liability only" },
      ],
      schema: z.enum(["full", "liability-only"]),
      next: () => "liabilityLimits",
    },
    {
      id: "liabilityLimits",
      field: "liabilityLimits",
      prompt: "What liability limits do you want quoted? If you're not sure, pick \"Not sure\" and we'll recommend options.",
      type: "select",
      options: [
        { value: "250-500-100", label: "250/500/100" },
        { value: "100-300-100", label: "100/300/100" },
        { value: "50-100-50", label: "50/100/50 (state minimum-ish)" },
        { value: "other", label: "Not sure / other" },
      ],
      schema: z.enum(["250-500-100", "100-300-100", "50-100-50", "other"]),
      next: () => "dateOfBirth",
    },
    {
      id: "dateOfBirth",
      field: "dateOfBirth",
      prompt: "What's your date of birth?",
      type: "date",
      schema: z.iso.date("Enter a valid date."),
      next: () => "licenseNumber",
    },
    {
      id: "licenseNumber",
      field: "licenseNumber",
      prompt: "If you have your driver's license number handy, share it now — or skip this one.",
      type: "text",
      optional: true,
      schema: z.string().min(1),
      next: () => "fullName",
    },
    {
      id: "fullName",
      field: "fullName",
      prompt: "Almost done — what's your first and last name?",
      type: "text",
      spreadFields: true,
      schema: z
        .string()
        .trim()
        .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
          message: "Enter both a first and last name.",
        })
        .transform((value) => {
          const parts = value.split(/\s+/).filter(Boolean);
          return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
        }),
      next: () => "phone",
    },
    {
      id: "phone",
      field: "phone",
      prompt: "Best phone number to reach you?",
      type: "text",
      schema: z.string().min(7, "Enter a valid phone number."),
      next: () => "email",
    },
    {
      id: "email",
      field: "email",
      prompt: "And your email address?",
      type: "text",
      schema: z.email("Enter a valid email address."),
      next: () => "smsConsent",
    },
    {
      id: "smsConsent",
      field: "smsConsent",
      prompt: "Okay to text you about this quote (standard message/data rates may apply)? You can say no and we'll only call or email.",
      type: "boolean",
      options: [
        { value: "true", label: "Yes, text me" },
        { value: "false", label: "No, call or email only" },
      ],
      schema: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]),
      next: () => "notes",
    },
    {
      id: "notes",
      field: "notes",
      prompt: "Anything else we should know before an agent reaches out? (optional)",
      type: "text",
      optional: true,
      schema: z.string().min(1),
      next: () => null,
    },
  ],
};
