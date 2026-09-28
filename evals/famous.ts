// The peer evals (held_out_recall, consistency) on the public-figure set, per brain, plus each brain's portrait and the
// prototype's nearest repertoire childhood. Bypasses runner.ts only because runner rejects consent=public.
// bun run evals/famous.ts [--brains prototype,stub,llm:haiku,llm:sonnet,llm:opus,llm:fable] [--people evals/data/public/founders.json]
//                        [--evals 1,3] [--phrasings 3] [--seed 7] [--name founders]
import { loadBrain } from "./brains/index";
import { makeLlmBrain, shortName, costUSD } from "./brains/llm";
import { ranked, score } from "./brains/prototype";
import { PORTRAIT, type EvalOpts } from "./common";
import { runConsistency, type ConsistencyResult } from "./consistency";
import { loadQuestions } from "./data/loaders";
import { runHeldOutRecall, type HeldOutResult } from "./held_out_recall";
import type { Brain } from "./interface";
import { pct, signed } from "./scoring";
import { FACT_TYPES, type Person } from "./types";

const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const brainNames = opt("--brains", "prototype,stub,llm:haiku,llm:sonnet,llm:opus,llm:fable").split(",");
const peoplePath = opt("--people", "evals/data/public/founders.json");
const wanted = new Set(opt("--evals", "1,3").split(","));
const phrasings = Number(opt("--phrasings", "3"));
const seed = opt("--seed", "7");
const runName = opt("--name", "founders");

const raw = await Bun.file(peoplePath).json();
// Public figures: drop `name` so a brain cannot recognize the person from it; 19 facts remain, split 70/30 by the peer's splitPerson.
const people = ((raw.people ?? raw) as any[]).map(p => ({ id: p.id, name: p.name, bucket: p.bucket, consent: p.consent, facts: p.facts.filter((f: any) => f.field !== "name") })) as unknown as Person[];
const questionsAll = await loadQuestions("evals/data/questions.json");
const questions = questionsAll.filter(q => q.field !== "name").map(q => ({ ...q, phrasings: q.phrasings.slice(0, phrasings) }));

async function get(name: string): Promise<Brain> { return name.startsWith("llm:") ? makeLlmBrain(name.slice(4)) : loadBrain(name); }

type Row = { brain: string; held?: HeldOutResult; cons?: ConsistencyResult; portraits: Record<string, string>; cost?: number; calls?: number };
const rows: Row[] = [];
for (const bn of brainNames) {
  const brain = await get(bn);
  const o: EvalOpts = { people, questions, seed, dryRun: false, runName: `${runName}.${brain.name.replace(":", "-")}` };
  const row: Row = { brain: brain.name, portraits: {} };
  if (wanted.has("1")) row.held = await runHeldOutRecall(brain, o);
  if (wanted.has("3")) row.cons = await runConsistency(brain, o);
  for (const p of people) row.portraits[p.id] = await brain.query(p.facts, PORTRAIT);
  await brain.close?.();
  const b: any = brain; if (b.usage) { row.cost = costUSD(b.model, b.usage); row.calls = b.usage.calls; }
  rows.push(row);
  console.log(`${brain.name}: held-out ${row.held ? pct(row.held.brainScore.overall.acc) + ` (${row.held.brainScore.overall.correct}/${row.held.heldOut}) vs base ${pct(row.held.baselineScore.overall.acc)}` : "–"} · consistency ${row.cons ? pct(row.cons.agreement) : "–"}${row.cost !== undefined ? ` · $${row.cost.toFixed(3)}` : ""}`);
}

// Nearest repertoire childhoods per founder (the prototype's actual matching step), with overlap scores.
const nearest: Record<string, { id: string; score: number; links: string[] }[]> = {};
for (const p of people) {
  const picks = p.facts.filter(f => ["parent1", "parent2", "school", "event1", "event2", "event3", "event4"].includes(f.field) && f.value !== "none").map(f => ({ slug: f.value }));
  nearest[p.id] = ranked(picks).slice(0, 3).map(c => ({ id: c.id, score: score(c, picks), links: c.links }));
}

const jsonPath = `evals/results/famous.${runName}.json`;
await Bun.write(jsonPath, JSON.stringify({ runName, at: new Date().toISOString(), peoplePath, seed, phrasings, nearest, brains: rows }, null, 2) + "\n");

const L: string[] = [];
L.push(`# famous · ${runName}`, "", `${new Date().toISOString().slice(0, 16)}Z · people: ${people.map(p => p.name).join(", ")} (${peoplePath}) · seed ${seed} · name field removed before every query`, "");
L.push("held_out_recall: each person's 19 facts are split 70/30; the brain sees the 70% and must name each hidden fact exactly (normalized string match). Baseline = most common value per field across the training halves. consistency: same field asked with " + phrasings + " phrasings; agreement = share of phrasings giving the modal answer.", "");
L.push("| Brain | held_out_recall | baseline | lift | consistency | contradictions | calls | est. cost |", "|---|---|---|---|---|---|---|---|");
for (const r of rows) L.push(`| ${r.brain} | ${r.held ? `**${pct(r.held.brainScore.overall.acc)}** (${r.held.brainScore.overall.correct}/${r.held.heldOut})` : "–"} | ${r.held ? pct(r.held.baselineScore.overall.acc) : "–"} | ${r.held ? signed(r.held.lift) : "–"} | ${r.cons ? pct(r.cons.agreement) : "–"} | ${r.cons ? r.cons.contradictions : "–"} | ${r.calls ?? 0} | ${r.cost !== undefined ? `$${r.cost.toFixed(3)}` : "$0"} |`);
L.push("", "## held_out_recall by fact type", "", "| Brain | " + FACT_TYPES.map(t => `${t}`).join(" | ") + " |", "|---|" + FACT_TYPES.map(() => "---").join("|") + "|");
for (const r of rows) if (r.held) L.push(`| ${r.brain} | ${FACT_TYPES.map(t => { const b = r.held!.brainScore.byType[t]; return b.n ? `${pct(b.acc)} (${b.correct}/${b.n})` : "–"; }).join(" | ")} |`);
L.push("", "## Every held-out fact, every brain", "", "| Person | Field | Truth | " + rows.map(r => r.brain).join(" | ") + " |", "|---|---|---|" + rows.map(() => "---").join("|") + "|");
const first = rows.find(r => r.held)?.held;
if (first) for (const t of first.rows) L.push(`| ${t.person} | ${t.field} | ${t.truth.replace(/\|/g, "/")} | ${rows.map(r => { const x = r.held?.rows.find(y => y.person === t.person && y.field === t.field); return x ? (x.brainOk ? "✅ " : "❌ ") + x.brain.replace(/\|/g, "/").slice(0, 90) : "–"; }).join(" | ")} |`);
L.push("", "## Nearest repertoire childhood (prototype matcher, overlap of 7 picks with the childhood's 6 links)", "");
for (const p of people) L.push(`- **${p.name}**: ${nearest[p.id].map(n => `${n.id} (${n.score}/7: ${n.links.join(", ")})`).join(" · ")}`);
L.push("", "## Portraits", "");
for (const p of people) { L.push(`### ${p.name}`, ""); for (const r of rows) L.push(`**${r.brain}:** ${r.portraits[p.id]}`, ""); }
const mdPath = `evals/results/famous.${runName}.md`;
await Bun.write(mdPath, L.join("\n") + "\n");
console.log(`\nresults -> ${jsonPath}\nreport  -> ${mdPath}`);
