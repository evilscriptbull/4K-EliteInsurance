import type { Lead } from "@/lib/schemas/lead";
import type { StoredContactMessage } from "@/lib/contact/store";
import type { StoredClaim } from "@/lib/claims/store";
import { sendEmail } from "@/lib/integrations/resend/client";
import { RequestConfirmationEmail } from "@/components/emails/RequestConfirmationEmail";
import { formatLine } from "@/lib/format/insuranceLine";

/**
 * Customer-facing confirmation emails via Resend — distinct from
 * lib/notifications/leadNotify.ts, which sends internal staff SMS. Copy
 * goes through lib/compliance/guardrails.ts's non-binding contract (see
 * RequestConfirmationEmail), so this is the customer-safe channel.
 */

export async function sendQuoteConfirmationEmail(lead: Lead): Promise<void> {
  const to = lead.contact.email;
  if (!to) return;

  await sendEmail(
    to,
    "We received your quote request",
    RequestConfirmationEmail({
      firstName: lead.contact.firstName,
      heading: "We received your quote request",
      bodyLines: [
        "Thanks for reaching out to Elite Insurance Group. We've received your request and a licensed agent will follow up shortly to discuss your options.",
      ],
      referenceLine: `Line of coverage: ${formatLine(lead.line)}`,
    }),
  );
}

export async function sendContactConfirmationEmail(message: StoredContactMessage): Promise<void> {
  await sendEmail(
    message.email,
    "We received your message",
    RequestConfirmationEmail({
      firstName: message.firstName,
      heading: "We received your message",
      bodyLines: [
        "Thanks for contacting Elite Insurance Group. Our team has received your message and will get back to you soon.",
      ],
    }),
  );
}

export async function sendClaimConfirmationEmail(claim: StoredClaim): Promise<void> {
  const to = claim.email;
  if (!to) return;

  await sendEmail(
    to,
    "We received your claim",
    RequestConfirmationEmail({
      firstName: claim.firstName,
      heading: "We received your claim",
      bodyLines: [
        "Thanks for letting us know. Our team has received your claim details and a licensed agent will follow up with next steps.",
      ],
      referenceLine: `Policy number: ${claim.policyNumber}`,
    }),
  );
}
