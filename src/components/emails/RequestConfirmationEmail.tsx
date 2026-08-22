import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import { agency } from "@/lib/config/agency";

/**
 * Shared confirmation email for quote/contact/claim submissions. Copy is
 * deliberately generic and non-binding — see
 * lib/compliance/guardrails.ts (neverImplyCoverageBound) — this is
 * customer-facing text, unlike the internal staff SMS notifications in
 * lib/notifications/leadNotify.ts.
 */
export function RequestConfirmationEmail({
  firstName,
  heading,
  bodyLines,
  referenceLine,
}: {
  firstName: string;
  heading: string;
  bodyLines: string[];
  referenceLine?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", maxWidth: "480px" }}>
          <Heading style={{ fontSize: "20px", color: "#0f172a" }}>{heading}</Heading>
          <Text style={{ fontSize: "16px", color: "#1e293b" }}>Hi {firstName},</Text>
          {bodyLines.map((line, i) => (
            <Text key={i} style={{ fontSize: "16px", color: "#1e293b" }}>
              {line}
            </Text>
          ))}
          {referenceLine && (
            <Text style={{ fontSize: "14px", color: "#475569" }}>{referenceLine}</Text>
          )}
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Coverage cannot be bound or altered by this email or the form that generated it. A licensed agent
            will follow up with next steps.
          </Text>
          <Text style={{ fontSize: "14px", color: "#1e293b" }}>
            {agency.legalName}
            <br />
            {agency.phoneDisplay} · {agency.email}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
