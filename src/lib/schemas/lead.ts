import { z } from "zod";
import { insuranceLines, licensedStates } from "@/lib/config/agency";

/**
 * Canonical lead output, matching the field list in the handoff doc:
 * line, intent, insured assets, renewal urgency, carrier, cross-sell
 * potential, preferred contact, conversation summary, missing fields,
 * lead score, assigned agent/queue. This is what the AI lead warmer
 * produces and what the CRM adapter (EZLynx) consumes.
 */

export const contactMethodSchema = z.enum(["phone", "sms", "email"]);

export const leadScoreTierSchema = z.enum([
  "immediate", // 80-100
  "same-day", // 60-79
  "nurture", // 30-59
  "marketing", // <30
]);

export function scoreToTier(score: number): z.infer<typeof leadScoreTierSchema> {
  if (score >= 80) return "immediate";
  if (score >= 60) return "same-day";
  if (score >= 30) return "nurture";
  return "marketing";
}

export const insuredAssetSchema = z.object({
  kind: z.string(), // e.g. "vehicle", "boat", "home", "business"
  description: z.string().optional(),
  value: z.number().nonnegative().optional(),
  details: z.record(z.string(), z.unknown()).optional(), // line-specific fields (see boat/commercial examples in handoff doc)
});

export const leadSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),

  line: z.enum(insuranceLines),
  intent: z.string(), // free-text summary of what the prospect is trying to accomplish

  contact: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    email: z.email().optional(),
    preferredContactMethod: contactMethodSchema,
    state: z.enum(licensedStates),
    smsConsent: z.boolean().default(false),
  }),

  insuredAssets: z.array(insuredAssetSchema).default([]),

  renewalUrgency: z.object({
    currentCarrier: z.string().optional(),
    renewalDate: z.iso.date().optional(),
    hasActivePolicy: z.boolean().optional(),
  }),

  crossSellPotential: z.array(z.enum(insuranceLines)).default([]),

  conversationSummary: z.string(),
  missingFields: z.array(z.string()).default([]),

  leadScore: z.number().min(0).max(100),
  leadScoreTier: leadScoreTierSchema,

  assignedAgent: z.string().optional(),
  assignedQueue: z.string().optional(),

  source: z.object({
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    landingPage: z.string().optional(),
    gclid: z.string().optional(), // Google Ads click ID, for internal attribution independent of GA4<->Ads account linking
  }),
});

export type Lead = z.infer<typeof leadSchema>;
