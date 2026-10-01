import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { takeLeadOutcome } from "@/lib/leads/outcomes";

const takeSchema = z.object({
  leadId: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await verifyStaffRequest(request);
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const parsed = takeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { leadId } = parsed.data;
  const taken = await takeLeadOutcome(leadId, auth.userId);

  return NextResponse.json({ ok: true, taken });
}
