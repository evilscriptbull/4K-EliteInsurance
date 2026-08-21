/** Shared by all 3 API routes — see components/forms/fields/HoneypotField.tsx */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body.company_website;
  return typeof value === "string" && value.length > 0;
}
