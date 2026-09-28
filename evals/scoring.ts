import { FACT_TYPES, type FactType } from "./types";
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
export const correct = (pred: string, truth: string) => norm(pred) === norm(truth);
export type Tally = { n: number; correct: number; acc: number };
export type Breakdown = { overall: Tally; byType: Record<FactType, Tally> };
export function tally(rows: { type: FactType; ok: boolean }[]): Breakdown {
  const mk = (): Tally => ({ n: 0, correct: 0, acc: 0 });
  const overall = mk(); const byType = Object.fromEntries(FACT_TYPES.map(t => [t, mk()])) as Record<FactType, Tally>;
  for (const r of rows) { for (const t of [overall, byType[r.type]]) { t.n++; if (r.ok) t.correct++; } }
  for (const t of [overall, ...Object.values(byType)]) t.acc = t.n ? t.correct / t.n : 0;
  return { overall, byType };
}
export const pct = (x: number) => `${(100 * x).toFixed(1)}%`;
export const signed = (x: number) => `${x >= 0 ? "+" : ""}${(100 * x).toFixed(1)} pts`;
