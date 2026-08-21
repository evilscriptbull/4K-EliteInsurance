import { NextResponse } from "next/server";
import { quoteFormSchema } from "@/lib/schemas/forms";
import { quoteFormToLead, type LeadSource } from "@/lib/leads/mappers";
import { addLead } from "@/lib/leads/store";
import { isHoneypotTripped } from "@/lib/forms/honeypot";

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
    addLead(lead);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "internal validation error" }, { status: 500 });
  }
}
