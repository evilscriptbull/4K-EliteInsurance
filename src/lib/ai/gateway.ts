import Anthropic, { APIError, AuthenticationError, RateLimitError, BadRequestError } from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/**
 * The provider-agnostic seam for every model call in this app (currently
 * only the Agent Brief, see src/lib/ai/agentBrief/). Verified against the
 * real installed package (@anthropic-ai/sdk@0.131.0) before writing this —
 * same "read the real API, not a doc" discipline this repo's AGENTS.md
 * already mandates for Next.js itself:
 * - `client.messages.parse({..., output_config: { format: zodOutputFormat(schema), effort }})`
 *   returns a message with a `.parsed_output: T | null` property — confirmed
 *   in node_modules/@anthropic-ai/sdk/resources/messages/messages.d.ts and
 *   lib/parser.d.ts. No JSON-schema-manual-parse fallback is needed.
 * - The error classes (AuthenticationError, RateLimitError, BadRequestError,
 *   APIError) are named exports from the package root, NOT static properties
 *   on the default `Anthropic` export -- confirmed in index.d.ts. An earlier
 *   draft of this plan assumed `Anthropic.AuthenticationError`; that's wrong.
 * - `"claude-sonnet-5"` is a real, typed value in the SDK's own `Model` union.
 */

export const DEFAULT_MODEL = "claude-sonnet-5";

export interface StructuredResult<T> {
  status: "ok" | "not-configured" | "parse-failed" | "refusal" | "error";
  data?: T;
  usage?: { inputTokens: number; outputTokens: number; cacheReadTokens: number };
  model?: string;
  durationMs: number;
  errorMessage?: string;
}

let client: Anthropic | null = null;
let initialized = false;

/** Lazy singleton, same pattern as getDb() (src/lib/db/client.ts) -- null when unconfigured. */
function getClient(): Anthropic | null {
  if (!initialized) {
    initialized = true;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      client = new Anthropic({ apiKey, timeout: 45_000, maxRetries: 2 });
    } else {
      console.warn("[ai] ANTHROPIC_API_KEY not configured — model calls will no-op to the deterministic fallback.");
    }
  }
  return client;
}

/**
 * Calls the model for a zod-validated structured result. Never throws --
 * every failure mode (unconfigured, refusal, API error, unparseable output)
 * resolves to a `StructuredResult` with a `status` the caller branches on;
 * callers (generateAgentBrief) always have a deterministic fallback ready
 * regardless of what comes back here.
 */
export async function generateStructured<T>(params: {
  schema: z.ZodType<T>;
  system: string;
  user: string;
  maxTokens?: number;
  effort?: "low" | "medium" | "high";
}): Promise<StructuredResult<T>> {
  const start = Date.now();
  const anthropic = getClient();
  if (!anthropic) {
    return { status: "not-configured", durationMs: Date.now() - start };
  }

  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  try {
    const message = await anthropic.messages.parse({
      model,
      max_tokens: params.maxTokens ?? 8000,
      system: [{ type: "text", text: params.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: params.user }],
      output_config: {
        format: zodOutputFormat(params.schema),
        effort: params.effort ?? "medium",
      },
    });

    const durationMs = Date.now() - start;
    const usage = {
      inputTokens: message.usage.input_tokens ?? 0,
      outputTokens: message.usage.output_tokens,
      cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
    };

    if (message.stop_reason === "refusal") {
      console.log(`[ai] brief model=${model} in=${usage.inputTokens} out=${usage.outputTokens} cacheRead=${usage.cacheReadTokens} ms=${durationMs} status=refusal`);
      return { status: "refusal", usage, model, durationMs };
    }

    if (message.parsed_output === null) {
      console.log(`[ai] brief model=${model} in=${usage.inputTokens} out=${usage.outputTokens} cacheRead=${usage.cacheReadTokens} ms=${durationMs} status=parse-failed`);
      return { status: "parse-failed", usage, model, durationMs };
    }

    console.log(`[ai] brief model=${model} in=${usage.inputTokens} out=${usage.outputTokens} cacheRead=${usage.cacheReadTokens} ms=${durationMs} status=ok`);
    return { status: "ok", data: message.parsed_output, usage, model, durationMs };
  } catch (error) {
    const durationMs = Date.now() - start;
    // Never log the prompt or the response body -- they contain customer data.
    let errorMessage = "unknown error";
    if (error instanceof AuthenticationError) errorMessage = "authentication-error";
    else if (error instanceof RateLimitError) errorMessage = "rate-limit-error";
    else if (error instanceof BadRequestError) errorMessage = "bad-request-error";
    else if (error instanceof APIError) errorMessage = `api-error-${error.status ?? "unknown"}`;
    console.log(`[ai] brief model=${model} ms=${durationMs} status=error error=${errorMessage}`);
    return { status: "error", model, durationMs, errorMessage };
  }
}
