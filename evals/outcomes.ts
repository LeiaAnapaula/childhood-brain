// Does the childhood predict the adult? Blind outcome prediction on public figures vs synthetic distractors.
// bun run evals/outcomes.ts [--models haiku,sonnet,opus,fable] [--conditions picks,schema,portrait] [--famous evals/data/public/founders.json]
//                          [--distractors evals/data/synthetic/people.distractors16.json] [--name founders] [--concurrency 4]
// Each person is shown WITHOUT their name under one of three renderings:
//   picks    = the 7 quiz answers + city + decade (what the product collects)
//   schema   = all 19 non-name fields (what the brain stores: picks + derived preferences/fears/stress + fragments)
//   portrait = only the prototype's nearest repertoire childhood (what the product shows back)
// The model predicts path/scale/visibility/risk/authority, a 0-100 "exceptional" score, and says if it recognizes the person.
// Scores: AUC of famous vs distractors on the exceptional score; categorical accuracy on the famous four against `outcome`;
// recognition rate (contamination); and a 4-way name lineup (chance 25% per person).
import { z } from "zod";
import { PORTRAIT } from "./common";
import prototypeBrain from "./brains/prototype";
import { askJson, costUSD, makeLlmBrain, renderFacts, resolveModel, shortName, SYSTEM, type Usage } from "./brains/llm";
import type { Fact } from "./types";

const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const models = opt("--models", "haiku,sonnet,opus,fable").split(",").map(resolveModel);
const conditions = opt("--conditions", "picks,schema,portrait").split(",") as Condition[];
const famousPath = opt("--famous", "evals/data/public/founders.json");
const distractorsPath = opt("--distractors", "evals/data/synthetic/people.distractors16.json");
const runName = opt("--name", "founders");
const concurrency = Number(opt("--concurrency", "4"));

type Condition = "picks" | "schema" | "portrait";
type Outcome = { path: string; scale: string; visibility: string; risk_appetite: string; authority: string; summary?: string };
type Subject = { id: string; name: string; famous: boolean; fullName?: string; outcome?: Outcome; facts: Fact[] };

const PATHS = ["founder", "executive", "professional", "creative", "academic", "service", "trades", "other"] as const;
const SCALES = ["local", "national", "global"] as const;
const VIS = ["private", "known-in-field", "public-figure"] as const;
const RISK = ["low", "medium", "high", "extreme"] as const;
const AUTH = ["complies", "negotiates", "builds-own", "fights"] as const;
const Prediction = z.object({
  path: z.enum(PATHS), scale: z.enum(SCALES), visibility: z.enum(VIS), risk_appetite: z.enum(RISK), authority: z.enum(AUTH),
  exceptional_score: z.number().min(0).max(100),
  adult_line: z.string(),
  recognized: z.string().nullable(),
});
type Prediction = z.infer<typeof Prediction>;
const Lineup = z.object({ assignments: z.array(z.object({ childhood: z.string(), name: z.string() })) });

const OUTCOME_SYSTEM = `${SYSTEM}

Task for this session: predict the ADULT from the childhood. You will see one childhood, without a name. Return:
- path: the main adult path. founder = started a company or organization that defines their career; executive = rose inside organizations; professional = doctor/lawyer/engineer/etc; creative; academic; service = teaching, care, public service; trades; other.
- scale: how far their work reaches: local, national, global.
- visibility: private (nobody outside their circle knows them), known-in-field, public-figure (widely known to the general public).
- risk_appetite: low, medium, high, extreme.
- authority: how they relate to authority: complies, negotiates, builds-own (builds their own institution rather than fight or join), fights.
- exceptional_score: 0-100, your probability that this person is in the top 0.01% of worldly achievement (wealth, fame, or influence) by age 45. Be calibrated: the base rate is far below 1, most childhoods you see here belong to ordinary people, and a hard childhood is not by itself a sign of greatness.
- adult_line: one sentence saying who this child became.
- recognized: if you believe this childhood is a specific real famous person, give their full name; otherwise null. Do not guess a name from vibes; only name someone if the specific facts match.`;

const FULL_NAMES: Record<string, string> = { elon: "Elon Musk", sam: "Sam Altman", mark: "Mark Zuckerberg", garry: "Garry Tan" };
const PICK_FIELDS = new Set(["city", "decade", "parent1", "parent2", "school", "event1", "event2", "event3", "event4"]);

async function render(s: Subject, c: Condition): Promise<string> {
  const noName = s.facts.filter(f => f.field !== "name");
  if (c === "picks") return renderFacts(noName.filter(f => PICK_FIELDS.has(f.field)));
  if (c === "schema") return renderFacts(noName);
  return `Nearest childhood in the repertoire (this is what the product would show the person):\n"""${await prototypeBrain.query(noName, PORTRAIT)}"""`;
}

async function pool<T, R>(xs: T[], n: number, f: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(xs.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, xs.length) }, async () => { for (;;) { const k = i++; if (k >= xs.length) return; out[k] = await f(xs[k]); } }));
  return out;
}
const mean = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
function auc(pos: number[], neg: number[]): number { let s = 0; for (const p of pos) for (const n of neg) s += p > n ? 1 : p === n ? 0.5 : 0; return pos.length && neg.length ? s / (pos.length * neg.length) : NaN; }

const famousRaw = await Bun.file(famousPath).json();
const distractorsRaw = await Bun.file(distractorsPath).json();
const famous: Subject[] = (famousRaw.people ?? famousRaw).map((p: any) => ({ id: p.id, name: p.name, famous: true, fullName: FULL_NAMES[p.id] ?? p.name, outcome: p.outcome, facts: p.facts }));
const distractors: Subject[] = (distractorsRaw.people ?? distractorsRaw).map((p: any) => ({ id: p.id, name: p.name, famous: false, facts: p.facts }));
const subjects = [...famous, ...distractors];
console.log(`outcomes · models=${models.map(shortName).join(",")} · conditions=${conditions.join(",")} · famous=${famous.length} · distractors=${distractors.length}`);

type Cell = { subject: string; famous: boolean; prediction: Prediction | null };
type CondResult = {
  condition: Condition; cells: Cell[];
  auc: number; famousMean: number; famousMedian: number; distractorMean: number; distractorMedian: number;
  famousRecognized: { id: string; guess: string | null; correct: boolean }[]; distractorFalseRecognitions: number;
  categorical: Record<string, { id: string; truth: string; pred: string | null; ok: boolean }[]>; categoricalAcc: Record<string, number>;
  distractorPathFounderRate: number;
  lineup: { assignments: { childhood: string; name: string }[]; correct: number; of: number } | null;
};
const results: { model: string; short: string; usage: Usage; cost: number; conditions: CondResult[] }[] = [];

for (const model of models) {
  const brain = makeLlmBrain(model);
  const conds: CondResult[] = [];
  for (const c of conditions) {
    const rendered = new Map<string, string>();
    for (const s of subjects) rendered.set(s.id, await render(s, c));
    const cells = await pool(subjects, concurrency, async (s): Promise<Cell> => {
      const user = `Childhood (rendering: ${c}):\n${rendered.get(s.id)}\n\nPredict the adult.`;
      const pred = await askJson(model, OUTCOME_SYSTEM, user, Prediction, brain.usage, { effort: "medium" });
      return { subject: s.id, famous: s.famous, prediction: pred };
    });
    const score = (id: string) => cells.find(x => x.subject === id)?.prediction?.exceptional_score;
    const pos = famous.map(s => score(s.id)).filter((x): x is number => typeof x === "number");
    const neg = distractors.map(s => score(s.id)).filter((x): x is number => typeof x === "number");
    const famousRecognized = famous.map(s => { const g = cells.find(x => x.subject === s.id)?.prediction?.recognized ?? null; const ok = !!g && (g.toLowerCase().includes(s.fullName!.split(" ")[1].toLowerCase())); return { id: s.id, guess: g, correct: ok }; });
    const distractorFalseRecognitions = distractors.filter(s => cells.find(x => x.subject === s.id)?.prediction?.recognized).length;
    const categorical: CondResult["categorical"] = {};
    for (const k of ["path", "scale", "visibility", "risk_appetite", "authority"] as const) {
      categorical[k] = famous.map(s => { const p = cells.find(x => x.subject === s.id)?.prediction ?? null; const pred = p ? p[k] : null; return { id: s.id, truth: s.outcome![k], pred, ok: pred === s.outcome![k] }; });
    }
    const categoricalAcc = Object.fromEntries(Object.entries(categorical).map(([k, rows]) => [k, mean(rows.map(r => r.ok ? 1 : 0))]));
    const distractorPathFounderRate = mean(distractors.map(s => cells.find(x => x.subject === s.id)?.prediction?.path === "founder" ? 1 : 0));

    // 4-way lineup: the four famous childhoods, anonymized as A-D, and the four names.
    const letters = ["A", "B", "C", "D"];
    const order = [...famous].sort((a, b) => (a.id + c).localeCompare(b.id + c));
    const lineupUser = `Four childhoods, labeled A-D, belong to these four people in some order: ${order.map(s => s.fullName).sort().join(", ")}.\n\n${order.map((s, i) => `Childhood ${letters[i]}:\n${rendered.get(s.id)}`).join("\n\n")}\n\nAssign each childhood letter to exactly one name (use every name once).`;
    const lu = await askJson(model, OUTCOME_SYSTEM, lineupUser, Lineup, brain.usage, { effort: "medium" });
    let lineup: CondResult["lineup"] = null;
    if (lu) {
      const correct = order.filter((s, i) => { const a = lu.assignments.find(x => x.childhood.trim().toUpperCase().replace(/^CHILDHOOD\s*/, "") === letters[i]); return a && a.name.toLowerCase().includes(s.fullName!.split(" ")[1].toLowerCase()); }).length;
      lineup = { assignments: lu.assignments, correct, of: order.length };
    }
    const r: CondResult = { condition: c, cells, auc: auc(pos, neg), famousMean: mean(pos), famousMedian: median(pos), distractorMean: mean(neg), distractorMedian: median(neg), famousRecognized, distractorFalseRecognitions, categorical, categoricalAcc, distractorPathFounderRate, lineup };
    conds.push(r);
    console.log(`  ${shortName(model)} · ${c}: AUC ${r.auc.toFixed(2)} · famous ${r.famousMean.toFixed(0)} vs distractors ${r.distractorMean.toFixed(0)} · recognized ${famousRecognized.filter(x => x.correct).length}/4 · lineup ${lineup ? `${lineup.correct}/${lineup.of}` : "n/a"}`);
  }
  await brain.close?.();
  results.push({ model, short: shortName(model), usage: brain.usage, cost: costUSD(model, brain.usage), conditions: conds });
}

const jsonPath = `evals/results/outcomes.${runName}.json`;
await Bun.write(jsonPath, JSON.stringify({ runName, at: new Date().toISOString(), famousPath, distractorsPath, models: results }, null, 2) + "\n");

// Markdown report
const L: string[] = [];
L.push(`# outcomes · ${runName}`, "", `${new Date().toISOString().slice(0, 16)}Z · famous: ${famous.map(s => s.fullName).join(", ")} · distractors: ${distractors.length} synthetic (${distractorsPath})`, "");
L.push("Question: shown a childhood with no name, does the model rank the four founders above sixteen synthetic ordinary childhoods? AUC 0.5 = coin flip, 1.0 = every founder above every distractor. `recognized` counts contamination: the model naming the real person from the facts.", "");
L.push("| Model | Rendering | AUC | Founders score (mean / median) | Distractors (mean / median) | Recognized founders | False recognitions | Distractors called founder | Name lineup | Cost so far |", "|---|---|---|---|---|---|---|---|---|---|");
for (const m of results) for (const c of m.conditions) L.push(`| ${m.short} (${m.model}) | ${c.condition} | **${c.auc.toFixed(2)}** | ${c.famousMean.toFixed(0)} / ${c.famousMedian.toFixed(0)} | ${c.distractorMean.toFixed(0)} / ${c.distractorMedian.toFixed(0)} | ${c.famousRecognized.filter(x => x.correct).length}/4 | ${c.distractorFalseRecognitions}/${distractors.length} | ${(100 * c.distractorPathFounderRate).toFixed(0)}% | ${c.lineup ? `${c.lineup.correct}/${c.lineup.of}` : "n/a"} | $${m.cost.toFixed(2)} |`);
L.push("", "## Categorical accuracy on the four founders (truth from `outcome`)", "", "| Model | Rendering | path | scale | visibility | risk | authority |", "|---|---|---|---|---|---|---|");
for (const m of results) for (const c of m.conditions) L.push(`| ${m.short} | ${c.condition} | ${["path", "scale", "visibility", "risk_appetite", "authority"].map(k => `${(100 * c.categoricalAcc[k]).toFixed(0)}%`).join(" | ")} |`);
L.push("", "## Per founder", "");
for (const s of famous) {
  L.push(`### ${s.fullName} · truth: ${s.outcome!.path}, ${s.outcome!.scale}, ${s.outcome!.visibility}, risk ${s.outcome!.risk_appetite}, authority ${s.outcome!.authority}`, "", "| Model | Rendering | score | path | scale | visibility | risk | authority | recognized | adult line |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const m of results) for (const c of m.conditions) { const p = c.cells.find(x => x.subject === s.id)?.prediction; L.push(p ? `| ${m.short} | ${c.condition} | ${p.exceptional_score} | ${p.path} | ${p.scale} | ${p.visibility} | ${p.risk_appetite} | ${p.authority} | ${p.recognized ?? "–"} | ${p.adult_line.replace(/\|/g, "/")} |` : `| ${m.short} | ${c.condition} | (no answer) | | | | | | | |`); }
  L.push("");
}
L.push("## Distractor scores (synthetic people; should be low)", "", "| Model | Rendering | " + distractors.map(d => d.id).join(" | ") + " |", "|---|---|" + distractors.map(() => "---").join("|") + "|");
for (const m of results) for (const c of m.conditions) L.push(`| ${m.short} | ${c.condition} | ${distractors.map(d => c.cells.find(x => x.subject === d.id)?.prediction?.exceptional_score ?? "–").join(" | ")} |`);
L.push("", "## Usage", "", "| Model | calls | input tokens | cached reads | output tokens | refusals | errors | est. cost |", "|---|---|---|---|---|---|---|---|");
for (const m of results) L.push(`| ${m.short} | ${m.usage.calls} | ${m.usage.input} | ${m.usage.cacheRead} | ${m.usage.output} | ${m.usage.refusals} | ${m.usage.errors} | $${m.cost.toFixed(3)} |`);
const mdPath = `evals/results/outcomes.${runName}.md`;
await Bun.write(mdPath, L.join("\n") + "\n");
console.log(`\nresults -> ${jsonPath}\nreport  -> ${mdPath}`);
