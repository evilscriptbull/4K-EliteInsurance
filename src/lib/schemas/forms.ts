import { z } from "zod";
import { licensedStates } from "@/lib/config/agency";

/**
 * Raw HTML form payload schemas — these describe what the browser actually
 * submits, which doesn't structurally match the canonical Lead shape (name
 * split into first/last, DOB, mileage plan, etc.). Contact and Claim are
 * validated and stored as-is; only the 6 quote forms get mapped into a Lead
 * (see lib/leads/mappers.ts) since only they represent new-business intent.
 */

const stateField = z.enum(licensedStates);

export const contactFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.email(),
  message: z.string().min(1),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const claimFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.email().optional(),
  filingFor: z.enum(["myself", "someone-else"]),
  policyNumber: z.string().min(1),
  incidentDate: z.iso.date(),
  incidentTime: z.string().min(1),
  anyoneInjured: z.enum(["yes", "no", "not-sure"]),
  needsRental: z.enum(["yes", "no", "not-sure"]),
  whatHappened: z.string().min(1),
  policeReport: z.string().optional(),
});
export type ClaimFormInput = z.infer<typeof claimFormSchema>;

const quoteContactBase = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.email(),
  state: stateField.default("TN"),
  smsConsent: z.boolean().default(false),
  notes: z.string().optional(),
});

export const collectorVehicleQuoteSchema = quoteContactBase.extend({
  family: z.literal("collector-vehicle"),
  dateOfBirth: z.iso.date().optional(),
  vehicleYear: z.string().min(4),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  estimatedValue: z.number().positive(),
  mileagePlan: z.enum(["1000", "3000", "6000"]),
  liabilityLimits: z.enum(["500000", "300000", "100000", "50000", "full-coverage"]),
});

export const autoQuoteSchema = quoteContactBase.extend({
  family: z.literal("auto"),
  personalOrCommercial: z.enum(["personal", "commercial"]),
  dateOfBirth: z.iso.date(),
  licenseNumber: z.string().optional(),
  vehicleYear: z.string().min(4),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  liabilityLimits: z.enum(["250-500-100", "100-300-100", "50-100-50", "other"]),
  coverageType: z.enum(["full", "liability-only"]),
});

export const homeQuoteSchema = quoteContactBase.extend({
  family: z.literal("home"),
  dateOfBirth: z.iso.date(),
  dwellingCoverageAmount: z.number().positive(),
  liabilityLimit: z.enum(["500000", "300000", "100000"]),
  deductible: z.enum(["1000", "2500", "5000", "other"]),
});

export const recreationalQuoteSchema = quoteContactBase.extend({
  family: z.literal("recreational"),
  vehicleType: z.enum(["boat", "motorcycle", "rv", "other"]),
  dateOfBirth: z.iso.date(),
  vehicleYear: z.string().min(4),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  coverageType: z.enum(["full", "liability-only"]),
  liabilityLimits: z.enum(["250-500", "100-300", "50-100", "other"]),
});

export const lifeQuoteSchema = quoteContactBase.extend({
  family: z.literal("life"),
  amountRequested: z.number().positive(),
  product: z.enum(["term", "whole-life", "final-expense"]),
  height: z.string().min(1),
  weight: z.string().min(1),
  tobaccoUser: z.boolean(),
  medicationsSurgeries: z.string().optional(),
});

export const businessQuoteSchema = quoteContactBase.extend({
  family: z.literal("business"),
  businessName: z.string().min(1),
  businessAddress: z.string().min(1),
  businessPhone: z.string().min(7),
  coverageType: z.enum([
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
  businessEntity: z.enum(["individual", "partnership", "corporation", "llc", "other"]),
  operationsDescription: z.string().min(1),
  liabilityCoverageRequested: z.enum(["5000000", "3000000", "2000000", "1000000", "500000", "300000", "other"]),
});

export const quoteFormSchema = z.discriminatedUnion("family", [
  collectorVehicleQuoteSchema,
  autoQuoteSchema,
  homeQuoteSchema,
  recreationalQuoteSchema,
  lifeQuoteSchema,
  businessQuoteSchema,
]);
export type QuoteFormInput = z.infer<typeof quoteFormSchema>;
