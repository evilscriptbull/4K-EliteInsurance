import { desc } from "drizzle-orm";
import type { ClaimFormInput } from "@/lib/schemas/forms";
import { getDb } from "@/lib/db/client";
import { claims as claimsTable } from "@/lib/db/schema";

export interface StoredClaim extends ClaimFormInput {
  id: string;
  createdAt: string;
}

/**
 * Persists to Postgres (via lib/db/client.ts) when DATABASE_URL is
 * configured; otherwise falls back to this in-memory array (not durable —
 * resets on restart/redeploy/cold start). A claim is an existing customer
 * reporting an incident, not a sales lead, so it's kept separate from the
 * leads store rather than forced through leadSchema.
 */
const inMemoryClaims: StoredClaim[] = [];

export async function addClaim(input: ClaimFormInput): Promise<StoredClaim> {
  const claim: StoredClaim = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  console.log(`[claim] ${claim.id} — policy ${claim.policyNumber} — ${claim.firstName} ${claim.lastName}`);

  const db = getDb();
  if (db) {
    await db.insert(claimsTable).values({
      id: claim.id,
      createdAt: new Date(claim.createdAt),
      policyNumber: claim.policyNumber,
      data: claim,
    });
  } else {
    inMemoryClaims.push(claim);
  }

  return claim;
}

export async function getClaims(): Promise<readonly StoredClaim[]> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(claimsTable).orderBy(desc(claimsTable.createdAt));
    return rows.map((row) => row.data as StoredClaim);
  }
  return inMemoryClaims;
}
