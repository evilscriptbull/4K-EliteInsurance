import { NextResponse, after } from "next/server";
import { quoteFormSchema } from "@/lib/schemas/forms";
import { quoteFormToLead, type LeadSource } from "@/lib/leads/mappers";
import { addLead } from "@/lib/leads/store";
import { isHoneypotTripped } from "@/lib/forms/honeypot";
import { generateAgentBrief } from "@/lib/ai/agentBrief/generate";
import { notifyAgentBrief } from "@/lib/notifications/leadNotify";
import { sendQuoteConfirmationEmail } from "@/lib/notifications/emailNotify";
import { pushLeadToEZLynx } from "@/lib/integrations/ezlynx/adapter";

// Schedules generateAgentBrief + notifyAgentBrief in after() below, which
// needs more time than the default 10s on Vercel to finish the model call
// and the SMS/email send after the response has already gone out.
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  if (isHoneypotTripped(body)) {
    return NextResponse.json({ ok: true, id: "ok" }, { status: 201 });
  }

  const { source, ...formFields } = body;

  const parsed = quoteFormSchema.safeParse(formFields);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const leadSource: LeadSource = typeof source === "object" && source !== null ? (source as LeadSource) : {};
    const lead = quoteFormToLead(parsed.data, leadSource);
    await addLead(lead);
    const [, crmResult] = await Promise.all([sendQuoteConfirmationEmail(lead), pushLeadToEZLynx(lead)]);

    after(() =>
      generateAgentBrief(lead, null)
        .then((brief) => notifyAgentBrief(lead, brief))
        .catch((error) => console.error("[ai] brief after() failed", error)),
    );

    return NextResponse.json(
      { ok: true, id: lead.id, line: lead.line, leadScoreTier: lead.leadScoreTier, crmStatus: crmResult.status },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "internal validation error" }, { status: 500 });
  }
}
