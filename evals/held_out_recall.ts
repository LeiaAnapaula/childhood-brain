import { fitBaseline } from "./baseline";
import { questionFor, splitPerson, type EvalOpts } from "./common";
import type { Brain } from "./interface";
import { correct, tally, type Breakdown } from "./scoring";
import { FACT_TYPES, type FactType } from "./types";

export type HeldOutResult = {
  eval: "held_out_recall"; brain: string; seed: string; people: number; heldOut: number;
  brainScore: Breakdown; baselineScore: Breakdown; lift: number; liftByType: Record<FactType, number>;
  byField: Record<string, { n: number; brain: number; baseline: number }>;
  weakestType: FactType; rows: { person: string; field: string; type: FactType; truth: string; brain: string; baseline: string; brainOk: boolean; baselineOk: boolean }[];
};

export async function runHeldOutRecall(brain: Brain, o: EvalOpts): Promise<HeldOutResult> {
  const splits = o.people.map(p => ({ p, ...splitPerson(p, o.seed) }));
  for (const s of splits) if (!s.test.length || !s.train.length) throw new Error(`${s.p.id}: split produced an empty side`);
  const baseline = fitBaseline(splits.map(s => s.train));
  const rows: HeldOutResult["rows"] = [];
  for (const { p, train, test } of splits) {
    for (const t of test) {
      const q = questionFor(o.questions, t.field, t.type);
      const b = o.dryRun ? "(dry-run)" : await brain.query(train, q);
      const base = baseline.predict(t.field);
      rows.push({ person: p.id, field: t.field, type: t.type, truth: t.value, brain: b, baseline: base, brainOk: !o.dryRun && correct(b, t.value), baselineOk: correct(base, t.value) });
    }
  }
  const brainScore = tally(rows.map(r => ({ type: r.type, ok: r.brainOk })));
  const baselineScore = tally(rows.map(r => ({ type: r.type, ok: r.baselineOk })));
  const liftByType = Object.fromEntries(FACT_TYPES.map(t => [t, brainScore.byType[t].acc - baselineScore.byType[t].acc])) as Record<FactType, number>;
  const byField: HeldOutResult["byField"] = {};
  for (const r of rows) { const f = byField[r.field] ??= { n: 0, brain: 0, baseline: 0 }; f.n++; if (r.brainOk) f.brain++; if (r.baselineOk) f.baseline++; }
  const seen = FACT_TYPES.filter(t => brainScore.byType[t].n > 0);
  const weakestType = seen.sort((a, b) => brainScore.byType[a].acc - brainScore.byType[b].acc || liftByType[a] - liftByType[b])[0];
  return { eval: "held_out_recall", brain: brain.name, seed: o.seed, people: o.people.length, heldOut: rows.length, brainScore, baselineScore, lift: brainScore.overall.acc - baselineScore.overall.acc, liftByType, byField, weakestType, rows };
}
