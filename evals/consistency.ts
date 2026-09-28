import { questionFor, splitPerson, type EvalOpts } from "./common";
import type { Brain } from "./interface";
import { norm } from "./scoring";
import { FACT_TYPES, type FactType } from "./types";

export type ConsistencyResult = {
  eval: "consistency"; brain: string; seed: string; people: number; questions: number; phrasings: number;
  agreement: number; byType: Record<FactType, { n: number; agreement: number }>; byQuestion: Record<string, number>;
  contradictions: number; examples: { person: string; field: string; answers: Record<string, number> }[];
};

export async function runConsistency(brain: Brain, o: EvalOpts): Promise<ConsistencyResult> {
  if (o.questions.length < 1) throw new Error("no questions in bank");
  const phr = Math.min(...o.questions.map(q => q.phrasings.length));
  const cells: { person: string; field: string; type: FactType; agreement: number; counts: Record<string, number> }[] = [];
  for (const p of o.people) {
    const { train } = splitPerson(p, o.seed);
    for (const q of o.questions) {
      const counts: Record<string, number> = {};
      for (let i = 0; i < phr; i++) {
        const a = o.dryRun ? "(dry-run)" : norm(await brain.query(train, questionFor(o.questions, q.field, q.type, i)));
        counts[a] = (counts[a] ?? 0) + 1;
      }
      const modal = Math.max(...Object.values(counts));
      cells.push({ person: p.id, field: q.field, type: q.type, agreement: modal / phr, counts });
    }
  }
  const mean = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const byType = Object.fromEntries(FACT_TYPES.map(t => { const c = cells.filter(x => x.type === t); return [t, { n: c.length, agreement: mean(c.map(x => x.agreement)) }]; })) as ConsistencyResult["byType"];
  const byQuestion: Record<string, number> = {};
  for (const q of o.questions) byQuestion[q.field] = mean(cells.filter(x => x.field === q.field).map(x => x.agreement));
  const bad = cells.filter(c => c.agreement < 1);
  return { eval: "consistency", brain: brain.name, seed: o.seed, people: o.people.length, questions: o.questions.length, phrasings: phr, agreement: mean(cells.map(c => c.agreement)), byType, byQuestion, contradictions: bad.length, examples: bad.slice(0, 10).map(b => ({ person: b.person, field: b.field, answers: b.counts })) };
}
