// Paid eval: runs generateAgentBrief against 6 realistic fixtures (one per
// quoteFormFamilies family, see src/lib/ai/agentBrief/__fixtures__/) with
// the real Anthropic API key. Prints each brief + token usage, exits
// non-zero if any fixture came back origin: "fallback" or with a raw 7+
// digit run leaking into the output. NOT run in CI or `npm test` -- this
// costs real money every time it runs.
//
// Delta from the original plan: invoked via `npx tsx scripts/eval-agent-brief.mjs`,
// not plain `node`. This script imports straight from src/lib/** using the
// same "@/" path aliases as the app itself (tsx resolves tsconfig.json's
// paths automatically); plain `node` has no path-alias or extensionless-
// import resolution, and this is the only script in scripts/ that needs
// either (every other one only imports external npm packages).
//
// Env loading still matches scripts/seed-associates.mjs's own pattern:
// relative to this script's own location, not the caller's cwd.
//
// Expected noise: each fixture's lead id is synthetic (never actually
// inserted into the real `leads` table), so saveAgentBrief's real FK
// constraint rejects every persist attempt and generateAgentBrief logs a
// "[ai] saveAgentBrief failed" stack trace for each one -- exactly the
// never-throws behavior PR 4 verified live. That's expected here, not a
// failure of this eval: pass/fail below is judged on brief content only
// (origin + no raw digit leak), never on whether the row actually saved.
import { fileURLToPath } from "node:url";
import path from "node:path";

process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local"));

const { generateAgentBrief } = await import("../src/lib/ai/agentBrief/generate.ts");
const { EVAL_FIXTURES } = await import("../src/lib/ai/agentBrief/__fixtures__/index.ts");

const RAW_DIGIT_LEAK_PATTERN = /\d{7,}/;

function findDigitLeak(content) {
  const json = JSON.stringify(content);
  const match = RAW_DIGIT_LEAK_PATTERN.exec(json);
  return match ? match[0] : null;
}

let failures = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;

for (const fixture of EVAL_FIXTURES) {
  const start = Date.now();
  const brief = await generateAgentBrief(fixture.lead, fixture.conversation);
  const durationMs = Date.now() - start;

  const digitLeak = findDigitLeak(brief.content);
  const ok = brief.origin === "model" && !digitLeak;
  if (!ok) failures++;

  if (brief.usage) {
    totalInputTokens += brief.usage.inputTokens;
    totalOutputTokens += brief.usage.outputTokens;
  }

  console.log(`\n=== ${fixture.name} ===`);
  console.log(`status: origin=${brief.origin} model=${brief.model ?? "n/a"} ms=${durationMs}`);
  if (brief.usage) console.log(`usage: in=${brief.usage.inputTokens} out=${brief.usage.outputTokens}`);
  if (digitLeak) console.log(`FAIL: raw digit run leaked into output: "${digitLeak}"`);
  if (brief.origin !== "model") console.log(`FAIL: expected origin "model", got "${brief.origin}"`);
  console.log(JSON.stringify(brief.content, null, 2));
}

console.log(`\n--- summary ---`);
console.log(`fixtures: ${EVAL_FIXTURES.length}, failures: ${failures}`);
console.log(`total tokens: in=${totalInputTokens} out=${totalOutputTokens}`);

if (failures > 0) {
  console.error(`\n${failures} fixture(s) failed (fallback origin or a raw digit leak) -- see FAIL lines above.`);
  process.exit(1);
}
