import { z } from "zod";
import type { ScriptedFlow } from "@/lib/scripted-chat/types";

/**
 * Mirrors lifeQuoteSchema + quoteContactBase field-for-field
 * (src/lib/schemas/forms.ts) so a completed conversation's answers, plus
 * `family: "life"` and `state: "TN"` added at finalize time (TN-only pilot
 * scope -- see docs/backlog.md), parse directly with quoteFormSchema and
 * flow through the existing quoteFormToLead() mapper unchanged.
 *
 * New flow for Phase 5.3 (tasks/todo.md) -- no new fields beyond what the
 * static LifeQuoteForm.tsx already asks; this only reorders them for early
 * contact capture (name/phone/consent/email first, matching 5.1/5.2) and
 * adds the currentCarrier/renewalDate questions already available to every
 * family since 5.1. `lifeQuoteSchema` has no `dateOfBirth` field, so there
 * is nothing to make optional here. `tobaccoUser` is an explicit yes/no
 * question here (the static form uses a plain checkbox, which has no
 * chat-step equivalent). `currentCarrier`'s options are a *different* list
 * from every other flow's (Northwestern Mutual, New York Life, MassMutual,
 * Prudential, State Farm) -- a deliberate choice, since life-insurance
 * carriers are a meaningfully different market than the P&C carriers
 * (GEICO, Progressive, etc.) every other flow asks about.
 *
 * DRAFT — this is an entirely new customer-facing flow that has never been
 * reviewed. Every prompt below is pending Chaz Goodin's sign-off
 * (compliance approver, agency.complianceApprover) before real customer
 * traffic.
 */
export const lifeFlow: ScriptedFlow = {
  slug: "life",
  intro:
    "Hi! I can get your life insurance quote started in about 2 minutes. I'll ask a few quick questions, and one of our licensed agents will follow up with real numbers — I can't quote or bind coverage myself.",
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
      next: () => "amountRequested",
    },
    {
      id: "amountRequested",
      field: "amountRequested",
      prompt: "What amount of coverage are you looking for?",
      type: "number",
      schema: z.coerce.number().positive(),
      next: () => "product",
    },
    {
      id: "product",
      field: "product",
      prompt: "What type of policy are you interested in?",
      type: "select",
      options: [
        { value: "term", label: "Term Life" },
        { value: "whole-life", label: "Whole Life" },
        { value: "final-expense", label: "Final Expense" },
      ],
      schema: z.enum(["term", "whole-life", "final-expense"]),
      next: () => "height",
    },
    {
      id: "height",
      field: "height",
      prompt: "What's your height?",
      type: "text",
      schema: z.string().min(1, "Enter your height."),
      next: () => "weight",
    },
    {
      id: "weight",
      field: "weight",
      prompt: "And your weight?",
      type: "text",
      schema: z.string().min(1, "Enter your weight."),
      next: () => "tobaccoUser",
    },
    {
      id: "tobaccoUser",
      field: "tobaccoUser",
      prompt: "Do you use tobacco?",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      schema: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]),
      next: () => "currentCarrier",
    },
    {
      id: "currentCarrier",
      field: "currentCarrier",
      prompt: "Do you have an existing life insurance policy? If so, who's the carrier?",
      type: "select",
      optional: true,
      spreadFields: true,
      producedFields: ["currentCarrier", "hasActivePolicy"],
      options: [
        { value: "Northwestern Mutual", label: "Northwestern Mutual" },
        { value: "New York Life", label: "New York Life" },
        { value: "MassMutual", label: "MassMutual" },
        { value: "Prudential", label: "Prudential" },
        { value: "State Farm", label: "State Farm" },
        { value: "other", label: "Other" },
        { value: "not-insured", label: "Not currently insured" },
      ],
      schema: z
        .enum(["Northwestern Mutual", "New York Life", "MassMutual", "Prudential", "State Farm", "other", "not-insured"])
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
      next: () => "medicationsSurgeries",
    },
    {
      id: "medicationsSurgeries",
      field: "medicationsSurgeries",
      prompt: "Any medications or major surgeries in the past 5 years? (optional)",
      type: "text",
      optional: true,
      schema: z.string().min(1),
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
