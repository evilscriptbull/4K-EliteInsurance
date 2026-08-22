import type { Config } from "drizzle-kit";

// drizzle-kit is a standalone CLI, unlike Next.js it doesn't load .env.local
// on its own. Node 20.6+ can do this natively, no dotenv dependency needed.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local doesn't exist — fine in CI/deploy environments where these
  // vars are injected directly.
}

/**
 * Migrations run against DIRECT_URL (port 5432, session-level connection) —
 * not DATABASE_URL (the pooler, port 6543), since transaction-mode pooling
 * doesn't support the session behavior migration tooling needs.
 */
const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  throw new Error("DIRECT_URL is required to run drizzle-kit commands (generate, migrate). See .env.example.");
}

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
} satisfies Config;
