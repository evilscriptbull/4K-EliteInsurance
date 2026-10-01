import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import { logLeadOutcome } from "@/lib/leads/outcomes";

const logOutcomeSchema = z
  .object({
    leadId: z.string().min(1),
    status: z.enum(["new", "contacted", "quoted", "bound", "lost", "unreachable"]),
    writtenPremium: z.number().nonnegative().optional(),
    carrier: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.status !== "bound" || (data.writtenPremium !== undefined && data.carrier !== undefined), {
    message: "writtenPremium and carrier are required when status is bound",
    path: ["status"],
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

  const parsed = logOutcomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { leadId, status, writtenPremium, carrier, notes } = parsed.data;
  const logged = await logLeadOutcome(leadId, auth.userId, { status, writtenPremium, carrier, notes });

  return NextResponse.json({ ok: true, logged });
}
