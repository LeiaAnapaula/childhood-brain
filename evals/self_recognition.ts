import { PORTRAIT, type EvalOpts } from "./common";
import type { Brain } from "./interface";
import { rng } from "./seed";
import { norm } from "./scoring";
import { REPERTOIRE } from "./brains/prototype-data";
import type { Person } from "./types";

export type Lineup = { person: string; name: string; bucket: string; options: string[] };
export type LineupKey = { person: string; answer: number; sources: string[] };
export type LineupAnswer = { person: string; picked: number; rating: number; respondent: "human" | "simulated" };
export type SelfRecognitionResult = {
  eval: "self_recognition"; brain: string; seed: string; people: number; lineupsPath: string; answersPath: string;
  answered: number; pickedOwn: number; pickedOwnRate: number | null; chance: number; meanRating: number | null; respondent: "human" | "simulated" | "none"; answers: LineupAnswer[];
};

const tokens = (s: string) => new Set(norm(s).split(" ").filter(w => w.length > 3));
const jaccard = (a: Set<string>, b: Set<string>) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };

export async function buildLineups(brain: Brain, o: EvalOpts): Promise<{ lineups: Lineup[]; keys: LineupKey[] }> {
  const portraits = new Map<string, string>();
  for (const p of o.people) portraits.set(p.id, o.dryRun ? `(dry-run portrait for ${p.id})` : await brain.query(p.facts, PORTRAIT));
  const lineups: Lineup[] = []; const keys: LineupKey[] = [];
  for (const p of o.people) {
    const r = rng(`${o.seed}:lineup:${p.id}`);
    const mine = portraits.get(p.id)!;
    const distinct = (texts: { text: string; src: string }[]) => { const seen = new Set([norm(mine)]); return texts.filter(t => { const k = norm(t.text); if (seen.has(k)) return false; seen.add(k); return true; }); };
    const pool = (pred: (q: Person) => boolean) => o.people.filter(q => q.id !== p.id && pred(q)).map(q => ({ text: portraits.get(q.id)!, src: `person:${q.id}` }));
    const decade = p.bucket.split("/")[0];
    let decoys = distinct(r.shuffle(pool(q => q.bucket === p.bucket)));
    if (decoys.length < 4) decoys = distinct([...decoys, ...r.shuffle(pool(q => q.bucket !== p.bucket && q.bucket.startsWith(decade)))]);
    if (decoys.length < 4) decoys = distinct([...decoys, ...r.shuffle(pool(q => !q.bucket.startsWith(decade)))]);
    if (decoys.length < 4) decoys = distinct([...decoys, ...r.shuffle(REPERTOIRE.map(c => ({ text: c.text, src: `repertoire:${c.id}` })))]);
    decoys = decoys.slice(0, 4);
    if (decoys.length < 4) throw new Error(`${p.id}: could not find 4 distinct decoys`);
    const options = r.shuffle([{ text: mine, src: "self" }, ...decoys]);
    lineups.push({ person: p.id, name: p.name, bucket: p.bucket, options: options.map(x => x.text) });
    keys.push({ person: p.id, answer: options.findIndex(x => x.src === "self"), sources: options.map(x => x.src) });
  }
  return { lineups, keys };
}

export function simulateAnswers(people: Person[], lineups: Lineup[]): LineupAnswer[] {
  return lineups.map(l => {
    const p = people.find(q => q.id === l.person)!;
    const me = tokens(p.facts.filter(f => f.type === "fragments").map(f => f.value).join(" "));
    const sims = l.options.map(t => jaccard(me, tokens(t)));
    const best = sims.indexOf(Math.max(...sims));
    const rating = Math.max(1, Math.min(5, 1 + Math.round(4 * Math.min(1, sims[best] * 4))));
    return { person: l.person, picked: best, rating, respondent: "simulated" };
  });
}

export function scoreAnswers(keys: LineupKey[], answers: LineupAnswer[]) {
  const byPerson = new Map(keys.map(k => [k.person, k.answer]));
  const valid = answers.filter(a => byPerson.has(a.person));
  const pickedOwn = valid.filter(a => a.picked === byPerson.get(a.person)).length;
  const meanRating = valid.length ? valid.reduce((s, a) => s + a.rating, 0) / valid.length : null;
  return { answered: valid.length, pickedOwn, pickedOwnRate: valid.length ? pickedOwn / valid.length : null, meanRating };
}

export async function runSelfRecognition(brain: Brain, o: EvalOpts): Promise<SelfRecognitionResult> {
  const { lineups, keys } = await buildLineups(brain, o);
  const lineupsPath = `evals/results/lineups.${o.runName}.json`;
  const keyPath = `evals/results/lineups.${o.runName}.key.json`;
  const answersPath = o.answersPath ?? `evals/results/lineup-answers.${o.runName}.json`;
  if (!o.dryRun) { await Bun.write(lineupsPath, JSON.stringify(lineups, null, 2) + "\n"); await Bun.write(keyPath, JSON.stringify(keys, null, 2) + "\n"); }
  let answers: LineupAnswer[] = [];
  let respondent: SelfRecognitionResult["respondent"] = "none";
  if (o.simulate && !o.dryRun) { answers = simulateAnswers(o.people, lineups); respondent = "simulated"; }
  else if (await Bun.file(answersPath).exists()) { answers = await Bun.file(answersPath).json(); respondent = answers.length ? "human" : "none"; }
  const s = scoreAnswers(keys, answers);
  return { eval: "self_recognition", brain: brain.name, seed: o.seed, people: o.people.length, lineupsPath, answersPath, ...s, chance: 0.2, respondent, answers };
}
