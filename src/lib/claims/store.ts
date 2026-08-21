import type { ClaimFormInput } from "@/lib/schemas/forms";

export interface StoredClaim extends ClaimFormInput {
  id: string;
  createdAt: string;
}

/**
 * In-memory only — same caveats as lib/leads/store.ts. A claim is an
 * existing customer reporting an incident, not a sales lead, so it's kept
 * separate from the leads store rather than forced through leadSchema.
 */
const claims: StoredClaim[] = [];

export function addClaim(input: ClaimFormInput): StoredClaim {
  const claim: StoredClaim = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  claims.push(claim);
  console.log(`[claim] ${claim.id} — policy ${claim.policyNumber} — ${claim.firstName} ${claim.lastName}`);
  return claim;
}

export function getClaims(): readonly StoredClaim[] {
  return claims;
}
