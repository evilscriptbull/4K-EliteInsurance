import type { InsuranceLine } from "@/lib/config/agency";

export function formatLine(line: InsuranceLine): string {
  return line
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
