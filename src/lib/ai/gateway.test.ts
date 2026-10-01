import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";

const testSchema = z.object({ answer: z.string() });

describe("generateStructured", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalModel = process.env.AI_MODEL;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.AI_MODEL;
    else process.env.AI_MODEL = originalModel;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns not-configured when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.resetModules();
    const { generateStructured } = await import("@/lib/ai/gateway");

    const result = await generateStructured({ schema: testSchema, system: "sys", user: "usr" });
    expect(result.status).toBe("not-configured");
  });

  it("returns ok with parsed data on a successful parse", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => {
      class FakeAnthropic {
        messages = {
          parse: vi.fn().mockResolvedValue({
            stop_reason: "end_turn",
            parsed_output: { answer: "42" },
            usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0 },
          }),
        };
      }
      return { default: FakeAnthropic, APIError: class {}, AuthenticationError: class {}, RateLimitError: class {}, BadRequestError: class {} };
    });
    vi.doMock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (s: unknown) => s }));

    const { generateStructured } = await import("@/lib/ai/gateway");
    const result = await generateStructured({ schema: testSchema, system: "sys", user: "usr" });

    expect(result.status).toBe("ok");
    expect(result.data).toEqual({ answer: "42" });
    expect(result.usage).toEqual({ inputTokens: 100, outputTokens: 20, cacheReadTokens: 0 });
  });

  it("returns parse-failed when parsed_output is null", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => {
      class FakeAnthropic {
        messages = {
          parse: vi.fn().mockResolvedValue({
            stop_reason: "end_turn",
            parsed_output: null,
            usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
          }),
        };
      }
      return { default: FakeAnthropic, APIError: class {}, AuthenticationError: class {}, RateLimitError: class {}, BadRequestError: class {} };
    });
    vi.doMock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (s: unknown) => s }));

    const { generateStructured } = await import("@/lib/ai/gateway");
    const result = await generateStructured({ schema: testSchema, system: "sys", user: "usr" });

    expect(result.status).toBe("parse-failed");
  });

  it("returns refusal when stop_reason is refusal", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => {
      class FakeAnthropic {
        messages = {
          parse: vi.fn().mockResolvedValue({
            stop_reason: "refusal",
            parsed_output: null,
            usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
          }),
        };
      }
      return { default: FakeAnthropic, APIError: class {}, AuthenticationError: class {}, RateLimitError: class {}, BadRequestError: class {} };
    });
    vi.doMock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (s: unknown) => s }));

    const { generateStructured } = await import("@/lib/ai/gateway");
    const result = await generateStructured({ schema: testSchema, system: "sys", user: "usr" });

    expect(result.status).toBe("refusal");
  });

  it("maps a thrown AuthenticationError to status error", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.resetModules();
    class FakeAuthError extends Error {}
    vi.doMock("@anthropic-ai/sdk", () => {
      class FakeAnthropic {
        messages = {
          parse: vi.fn().mockRejectedValue(new FakeAuthError("nope")),
        };
      }
      return {
        default: FakeAnthropic,
        APIError: class {},
        AuthenticationError: FakeAuthError,
        RateLimitError: class {},
        BadRequestError: class {},
      };
    });
    vi.doMock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (s: unknown) => s }));

    const { generateStructured } = await import("@/lib/ai/gateway");
    const result = await generateStructured({ schema: testSchema, system: "sys", user: "usr" });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBe("authentication-error");
  });

  it("never logs the system/user prompt content", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => {
      class FakeAnthropic {
        messages = {
          parse: vi.fn().mockResolvedValue({
            stop_reason: "end_turn",
            parsed_output: { answer: "42" },
            usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0 },
          }),
        };
      }
      return { default: FakeAnthropic, APIError: class {}, AuthenticationError: class {}, RateLimitError: class {}, BadRequestError: class {} };
    });
    vi.doMock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (s: unknown) => s }));
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { generateStructured } = await import("@/lib/ai/gateway");
    await generateStructured({ schema: testSchema, system: "super secret system prompt", user: "customer ssn 123456789" });

    for (const call of logSpy.mock.calls) {
      const line = call.join(" ");
      expect(line).not.toContain("super secret system prompt");
      expect(line).not.toContain("123456789");
    }
  });
});
