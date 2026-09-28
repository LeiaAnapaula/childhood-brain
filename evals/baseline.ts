import type { Fact } from "./types";
// Base rate: guess the most common value per field across everyone's training (fed) facts. Ties break alphabetically so it is deterministic.
export type Baseline = { predict(field: string): string; table: Record<string, string> };
export function fitBaseline(trainFacts: Fact[][]): Baseline {
  const counts = new Map<string, Map<string, number>>();
  for (const facts of trainFacts) for (const f of facts) {
    const m = counts.get(f.field) ?? new Map(); m.set(f.value, (m.get(f.value) ?? 0) + 1); counts.set(f.field, m);
  }
  const table: Record<string, string> = {};
  for (const [field, m] of counts) table[field] = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  return { table, predict: (field) => table[field] ?? "unknown" };
}
