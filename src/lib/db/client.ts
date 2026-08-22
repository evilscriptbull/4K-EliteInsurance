import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: Db | null = null;
let initialized = false;

/**
 * Lazily creates the Drizzle client against DATABASE_URL (Supabase's
 * transaction pooler, port 6543). `prepare: false` is required —
 * transaction-mode pooling doesn't support prepared statements, which
 * postgres.js uses by default.
 *
 * Returns null when DATABASE_URL isn't configured, so callers fall back to
 * in-memory storage instead of crashing — same no-op-safe contract as
 * every other integration in this project (GA4, GoTo, EZLynx).
 */
export function getDb(): Db | null {
  if (!initialized) {
    initialized = true;
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      const client = postgres(connectionString, { prepare: false });
      dbInstance = drizzle(client, { schema });
    } else {
      console.warn("[db] DATABASE_URL not configured — falling back to in-memory storage (not durable).");
    }
  }
  return dbInstance;
}
