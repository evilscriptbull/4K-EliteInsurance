import { z } from "zod";
import type { ScriptedFlow } from "@/lib/scripted-chat/types";

/**
 * Mirrors collectorVehicleQuoteSchema + quoteContactBase field-for-field
 * (src/lib/schemas/forms.ts) so a completed conversation's answers, plus
 * `family: "collector-vehicle"` and `state: "TN"` added at finalize time
 * (TN-only pilot scope -- see docs/backlog.md), parse directly with
 * quoteFormSchema and flow through the existing quoteFormToLead() mapper
 * unchanged.
 *
 * New flow for Phase 5.3 (tasks/todo.md) -- no new fields beyond what the
 * static CollectorVehicleQuoteForm.tsx already asks; this only reorders
 * them for early contact capture (name/phone/consent/email first, matching
 * 5.1/5.2) and adds the currentCarrier/renewalDate questions already
 * available to every family since 5.1. Select-option labels are copied
 * verbatim from the static form, not invented fresh.
 *
 * DRAFT — this is an entirely new customer-facing flow that has never been
 * reviewed. Every prompt below is pending Chaz Goodin's sign-off
 * (compliance approver, agency.complianceApprover) before real customer
 * traffic.
 */
export const collectorVehicleFlow: ScriptedFlow = {
  slug: "collector-vehicle",
  intro:
    "Hi! I can get your collector vehicle quote started in about 2 minutes. I'll ask a few quick questions, and one of our licensed agents will follow up with real numbers — I can't quote or bind coverage myself.",
  firstStepId: "fullName",
  steps: [
    {
      id: "fullName",
      field: "fullName",
      prompt: "First, what's your first and last name?",
      type: "text",
      spreadFields: true,
      producedFields: ["firstName", "lastName"],
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
      next: () => "email",
    },
    {
      id: "email",
      field: "email",
      prompt: "And your email address?",
      type: "text",
      schema: z.email("Enter a valid email address."),
      next: () => "vehicleYear",
    },
    {
      id: "vehicleYear",
      field: "vehicleYear",
      prompt: "What year is the vehicle?",
      type: "text",
      schema: z.string().min(4, "Enter a 4-digit year, like 1969."),
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
      next: () => "estimatedValue",
    },
    {
      id: "estimatedValue",
      field: "estimatedValue",
      prompt: "What's the estimated value of the vehicle?",
      type: "number",
      schema: z.coerce.number().positive(),
      next: () => "mileagePlan",
    },
    {
      id: "mileagePlan",
      field: "mileagePlan",
      prompt: "About how many miles do you drive it per year?",
      type: "select",
      options: [
        { value: "1000", label: "1,000 miles" },
        { value: "3000", label: "3,000 miles" },
        { value: "6000", label: "6,000 miles" },
      ],
      schema: z.enum(["1000", "3000", "6000"]),
      next: () => "liabilityLimits",
    },
    {
      id: "liabilityLimits",
      field: "liabilityLimits",
      prompt: "What liability limits do you want quoted?",
      type: "select",
      options: [
        { value: "500000", label: "$500,000" },
        { value: "300000", label: "$300,000" },
        { value: "100000", label: "$100,000" },
        { value: "50000", label: "$50,000" },
        { value: "full-coverage", label: "Full Coverage" },
      ],
      schema: z.enum(["500000", "300000", "100000", "50000", "full-coverage"]),
      next: () => "currentCarrier",
    },
    {
      id: "currentCarrier",
      field: "currentCarrier",
      prompt: "Who's your current carrier for this vehicle, if any?",
      type: "select",
      optional: true,
      spreadFields: true,
      producedFields: ["currentCarrier", "hasActivePolicy"],
      options: [
        { value: "State Farm", label: "State Farm" },
        { value: "GEICO", label: "GEICO" },
        { value: "Progressive", label: "Progressive" },
        { value: "Allstate", label: "Allstate" },
        { value: "USAA", label: "USAA" },
        { value: "Nationwide", label: "Nationwide" },
        { value: "Farmers", label: "Farmers" },
        { value: "Liberty Mutual", label: "Liberty Mutual" },
        { value: "Erie Insurance", label: "Erie Insurance" },
        { value: "Travelers", label: "Travelers" },
        { value: "other", label: "Other" },
        { value: "not-insured", label: "Not currently insured" },
      ],
      schema: z
        .enum([
          "State Farm",
          "GEICO",
          "Progressive",
          "Allstate",
          "USAA",
          "Nationwide",
          "Farmers",
          "Liberty Mutual",
          "Erie Insurance",
          "Travelers",
          "other",
          "not-insured",
        ])
        .transform((value) => ({
          currentCarrier: value === "not-insured" ? undefined : value === "other" ? "Other" : value,
          hasActivePolicy: value !== "not-insured",
        })),
      next: () => "renewalDate",
    },
    {
      id: "renewalDate",
      field: "renewalDate",
      prompt: "When does your current policy renew? (Skip if you're not sure or don't have one.)",
      type: "date",
      optional: true,
      schema: z.iso.date("Enter a valid date."),
      next: () => "dateOfBirth",
    },
    {
      id: "dateOfBirth",
      field: "dateOfBirth",
      prompt: "What's your date of birth?",
      type: "date",
      optional: true,
      schema: z.iso.date("Enter a valid date."),
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
