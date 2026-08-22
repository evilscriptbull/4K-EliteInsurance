import { Resend } from "resend";
import type { ReactElement } from "react";

/**
 * Resend email client. Fallback-safe like every other integration in this
 * project: no-ops with a clear log message when RESEND_API_KEY isn't set,
 * rather than throwing.
 */
function getConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  // Resend's shared sandbox sender — works without domain verification, but
  // Resend restricts delivery to the account owner's own address in that
  // mode. Once RESEND_FROM_EMAIL is set (after SPF/DKIM verification on a
  // real domain), sends go out from that address to any recipient.
  const from = process.env.RESEND_FROM_EMAIL ?? "Elite Insurance Group <onboarding@resend.dev>";
  return { apiKey, from };
}

export interface SendEmailResult {
  sent: boolean;
  reason?: string;
}

export async function sendEmail(to: string, subject: string, react: ReactElement): Promise<SendEmailResult> {
  const config = getConfig();
  if (!config) {
    console.log("[resend] Email not sent — RESEND_API_KEY not configured.");
    return { sent: false, reason: "not-configured" };
  }

  try {
    const resend = new Resend(config.apiKey);
    const { error } = await resend.emails.send({ from: config.from, to, subject, react });
    if (error) {
      console.error("[resend] Email send failed:", error);
      return { sent: false, reason: error.name ?? "send-error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[resend] Email send error:", error);
    return { sent: false, reason: "exception" };
  }
}
