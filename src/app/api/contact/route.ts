import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/schemas/forms";
import { addContactMessage } from "@/lib/contact/store";
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

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await addContactMessage(parsed.data);
    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "internal validation error" }, { status: 500 });
  }
}
