import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { associates as associatesTable } from "@/lib/db/schema";

export interface Associate {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

/**
 * No in-memory fallback here, unlike leads/conversations — there's no safe
 * placeholder roster to invent if DATABASE_URL isn't configured. An empty
 * list means no one gets pinged/can claim, which is the honest behavior
 * (see lib/compliance/guardrails.ts — leastPrivilegeDataAccess).
 */
export async function listActiveAssociates(): Promise<readonly Associate[]> {
  const db = getDb();
  if (!db) {
    console.warn("[associates] DATABASE_URL not configured — no associates available.");
    return [];
  }
  return db.select().from(associatesTable).where(eq(associatesTable.active, true));
}

export async function getAssociate(id: string): Promise<Associate | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(associatesTable).where(eq(associatesTable.id, id)).limit(1);
  return rows[0] ?? null;
}
