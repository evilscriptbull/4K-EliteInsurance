import { z } from "zod";
import type { ScriptedFlow } from "@/lib/scripted-chat/types";

/**
 * Mirrors businessQuoteSchema + quoteContactBase field-for-field
 * (src/lib/schemas/forms.ts) so a completed conversation's answers, plus
 * `family: "business"` and `state: "TN"` added at finalize time (TN-only
 * pilot scope -- see docs/backlog.md), parse directly with quoteFormSchema
 * and flow through the existing quoteFormToLead() mapper unchanged.
 *
 * New flow for Phase 5.2 (tasks/todo.md) -- business is the agency's
 * highest-priority line (see priorityLines, lib/config/agency.ts) but had
 * no chat flow until now. Contact details (name/phone/consent/email) are
 * asked right after the coverage-type branch, matching the auto flow's
 * Phase 5.1 early-contact-capture order, so an abandoned chat still leaves
 * a reachable partial lead.
 *
 * DRAFT — this is an entirely new customer-facing flow that has never been
 * reviewed. Every prompt below, including the contractors trade/
 * certificates branch and the new numeric/range questions, is pending
 * Chaz Goodin's sign-off (compliance approver, agency.complianceApprover)
 * before real customer traffic.
 */
export const businessFlow: ScriptedFlow = {
  slug: "business",
  intro:
    "Hi! I can get your business insurance quote started in about 3 minutes. I'll ask a few quick questions, and one of our licensed agents will follow up with real numbers — I can't quote or bind coverage myself.",
  firstStepId: "coverageType",
  steps: [
    {
      id: "coverageType",
      field: "coverageType",
      prompt: "What type of business coverage are you looking for?",
      type: "select",
      options: [
        { value: "business", label: "General business coverage" },
        { value: "general-liability", label: "General Liability" },
        { value: "workers-comp", label: "Workers' Comp" },
        { value: "commercial-property", label: "Commercial Property" },
        { value: "builders-risk", label: "Builders Risk" },
        { value: "commercial-auto", label: "Commercial Auto" },
        { value: "commercial-umbrella", label: "Commercial Umbrella" },
        { value: "contractors", label: "Contractors" },
        { value: "cyber", label: "Cyber" },
        { value: "other", label: "Other / not sure" },
      ],
      schema: z.enum([
        "business",
        "general-liability",
        "workers-comp",
        "commercial-property",
        "builders-risk",
        "commercial-auto",
        "commercial-umbrella",
        "contractors",
        "cyber",
        "other",
      ]),
      next: () => "fullName",
    },
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
      next: () => "businessName",
    },
    {
      id: "businessName",
      field: "businessName",
      prompt: "What's the business called?",
      type: "text",
      schema: z.string().min(1, "Enter the business name."),
      next: () => "operationsDescription",
    },
    {
      id: "operationsDescription",
      field: "operationsDescription",
      prompt: "In a sentence, what does the business do?",
      type: "text",
      schema: z.string().min(1, "Enter a short description of the business."),
      next: (answers) => (answers.coverageType === "contractors" ? "trade" : "businessEntity"),
    },
    {
      id: "trade",
      field: "trade",
      prompt: "What's your trade?",
      type: "select",
      options: [
        { value: "roofing", label: "Roofing" },
        { value: "hvac", label: "HVAC" },
        { value: "electrical", label: "Electrical" },
        { value: "plumbing", label: "Plumbing" },
        { value: "landscaping", label: "Landscaping" },
        { value: "general-contractor", label: "General Contractor" },
        { value: "other", label: "Other" },
      ],
      schema: z.enum(["roofing", "hvac", "electrical", "plumbing", "landscaping", "general-contractor", "other"]),
      next: () => "needsCertificates",
    },
    {
      id: "needsCertificates",
      field: "needsCertificates",
      prompt: "Do you need certificates of insurance for a GC or permit right now?",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      schema: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]),
      next: () => "businessEntity",
    },
    {
      id: "businessEntity",
      field: "businessEntity",
      prompt: "What type of entity is the business?",
      type: "select",
      options: [
        { value: "individual", label: "Sole proprietor / individual" },
        { value: "partnership", label: "Partnership" },
        { value: "corporation", label: "Corporation" },
        { value: "llc", label: "LLC" },
        { value: "other", label: "Other" },
      ],
      schema: z.enum(["individual", "partnership", "corporation", "llc", "other"]),
      next: () => "yearsInBusiness",
    },
    {
      id: "yearsInBusiness",
      field: "yearsInBusiness",
      prompt: "How many years has the business been operating?",
      type: "number",
      schema: z.coerce.number().int().nonnegative(),
      next: () => "employees",
    },
    {
      id: "employees",
      field: "employees",
      prompt: "How many employees?",
      type: "number",
      schema: z.coerce.number().int().nonnegative(),
      next: () => "annualPayroll",
    },
    {
      id: "annualPayroll",
      field: "annualPayroll",
      prompt: "What's the approximate annual payroll?",
      type: "select",
      options: [
        { value: "under-100k", label: "Under $100K" },
        { value: "100k-250k", label: "$100K–$250K" },
        { value: "250k-500k", label: "$250K–$500K" },
        { value: "500k-1m", label: "$500K–$1M" },
        { value: "over-1m", label: "Over $1M" },
        { value: "not-sure", label: "Not sure" },
      ],
      schema: z.enum(["under-100k", "100k-250k", "250k-500k", "500k-1m", "over-1m", "not-sure"]),
      next: () => "annualRevenue",
    },
    {
      id: "annualRevenue",
      field: "annualRevenue",
      prompt: "And the approximate annual revenue?",
      type: "select",
      options: [
        { value: "under-250k", label: "Under $250K" },
        { value: "250k-500k", label: "$250K–$500K" },
        { value: "500k-1m", label: "$500K–$1M" },
        { value: "1m-5m", label: "$1M–$5M" },
        { value: "over-5m", label: "Over $5M" },
        { value: "not-sure", label: "Not sure" },
      ],
      schema: z.enum(["under-250k", "250k-500k", "500k-1m", "1m-5m", "over-5m", "not-sure"]),
      next: () => "usesSubcontractors",
    },
    {
      id: "usesSubcontractors",
      field: "usesSubcontractors",
      prompt: "Do you use subcontractors?",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      schema: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]),
      next: () => "vehicleCount",
    },
    {
      id: "vehicleCount",
      field: "vehicleCount",
      prompt: "How many vehicles does the business operate, if any?",
      type: "number",
      schema: z.coerce.number().int().nonnegative(),
      next: () => "currentCarrier",
    },
    {
      id: "currentCarrier",
      field: "currentCarrier",
      prompt: "Who's your current business insurance carrier, if any?",
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
      next: () => "liabilityCoverageRequested",
    },
    {
      id: "liabilityCoverageRequested",
      field: "liabilityCoverageRequested",
      prompt: "What liability coverage amount are you looking for? If you're not sure, pick \"Not sure\" and we'll recommend options.",
      type: "select",
      options: [
        { value: "5000000", label: "$5,000,000" },
        { value: "3000000", label: "$3,000,000" },
        { value: "2000000", label: "$2,000,000" },
        { value: "1000000", label: "$1,000,000" },
        { value: "500000", label: "$500,000" },
        { value: "300000", label: "$300,000" },
        { value: "other", label: "Not sure / other" },
      ],
      schema: z.enum(["5000000", "3000000", "2000000", "1000000", "500000", "300000", "other"]),
      next: () => "businessAddress",
    },
    {
      id: "businessAddress",
      field: "businessAddress",
      prompt: "What's the business address?",
      type: "text",
      schema: z.string().min(1, "Enter the business address."),
      next: () => "businessPhone",
    },
    {
      id: "businessPhone",
      field: "businessPhone",
      prompt: "Is there a separate business phone number? (Skip if your cell is the best number.)",
      type: "text",
      optional: true,
      schema: z.string().min(7, "Enter a valid phone number."),
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
