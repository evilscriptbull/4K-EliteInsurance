/**
 * Walks every string value nested anywhere in `value` (objects, arrays, or
 * a bare string) and calls `visit` on each one. Shared between
 * fallback.test.ts (sweeping a fallback brief for banned phrases) and
 * generate.ts's validateBriefContent (sweeping a model-generated brief
 * before it's trusted) -- the only reason this lives outside a test file.
 */
export function forEachStringLeaf(value: unknown, visit: (text: string) => void): void {
  if (typeof value === "string") {
    visit(value);
  } else if (Array.isArray(value)) {
    for (const item of value) forEachStringLeaf(item, visit);
  } else if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) forEachStringLeaf(nested, visit);
  }
}
