// bun run eval [--brain prototype|stub|gbrain|./module.ts] [--eval all|1|2|3] [--people path] [--questions path] [--seed s] [--dry-run] [--simulate] [--answers path] [--name run]
import { DEFAULT_BRAIN, loadBrain } from "./brains/index";
import type { EvalOpts } from "./common";
import { runConsistency, type ConsistencyResult } from "./consistency";
import { loadPeople, loadQuestions } from "./data/loaders";
import { runHeldOutRecall, type HeldOutResult } from "./held_out_recall";
import { pct, signed } from "./scoring";
import { runSelfRecognition, type SelfRecognitionResult } from "./self_recognition";
import { FACT_TYPES } from "./types";

const argv = process.argv.slice(2);
const has = (k: string) => argv.includes(k);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const brainName = opt("--brain", DEFAULT_BRAIN);
const which = opt("--eval", "all");
const peoplePath = opt("--people", "evals/data/synthetic/people.json");
const seed = opt("--seed", "7");
const dryRun = has("--dry-run");
const runName = opt("--name", `${brainName}.${peoplePath.replace(/^.*\//, "").replace(/\.json$/, "")}.seed${seed}`);
const wanted = new Set(which === "all" ? ["1", "2", "3"] : which.split(",").map(s => ({ held_out_recall: "1", self_recognition: "2", consistency: "3" } as Record<string, string>)[s] ?? s));

const people = await loadPeople(peoplePath);
const questions = await loadQuestions(opt("--questions", "evals/data/questions.json"));
if (people.some(p => p.consent === "consented") && !peoplePath.includes("evals/data/consented/")) throw new Error("consented people must live under evals/data/consented/");
if (people.some(p => p.consent === "public") && !peoplePath.includes("evals/data/public/")) throw new Error("public people must live under evals/data/public/");
const brain = await loadBrain(brainName);
const o: EvalOpts = { people, questions, seed, dryRun, simulate: has("--simulate"), answersPath: argv.includes("--answers") ? opt("--answers", "") : undefined, runName };
console.log(`${dryRun ? "DRY RUN · " : ""}brain=${brain.name} people=${people.length} (${peoplePath}) seed=${seed} evals=${[...wanted].join(",")}`);

const out: { held_out_recall?: HeldOutResult; self_recognition?: SelfRecognitionResult; consistency?: ConsistencyResult } = {};
if (wanted.has("1")) out.held_out_recall = await runHeldOutRecall(brain, o);
if (wanted.has("2")) out.self_recognition = await runSelfRecognition(brain, o);
if (wanted.has("3")) out.consistency = await runConsistency(brain, o);
await brain.close?.();

if (dryRun) { console.log("inputs valid; no model calls made"); process.exit(0); }

const resultPath = `evals/results/${runName}.json`;
await Bun.write(resultPath, JSON.stringify({ runName, brain: brain.name, peoplePath, seed, at: new Date().toISOString(), ...out }, null, 2) + "\n");

const lines: string[] = [];
lines.push(`## ${runName}`, "", `brain: **${brain.name}** · people: ${people.length} · seed: ${seed} · ${new Date().toISOString().slice(0, 16)}Z`, "");
lines.push("| Eval | Score | Baseline / chance | Lift |", "|---|---|---|---|");
const h = out.held_out_recall, s = out.self_recognition, c = out.consistency;
if (h) lines.push(`| held_out_recall (headline) | ${pct(h.brainScore.overall.acc)} (${h.brainScore.overall.correct}/${h.heldOut}) | ${pct(h.baselineScore.overall.acc)} base rate | ${signed(h.lift)} |`);
if (s) lines.push(`| self_recognition | ${s.pickedOwnRate === null ? "no answers yet" : pct(s.pickedOwnRate) + ` picked own (${s.pickedOwn}/${s.answered}, ${s.respondent})`} · felt ${s.meanRating === null ? "–" : s.meanRating.toFixed(2)}/5 | 20% chance | ${s.pickedOwnRate === null ? "–" : signed(s.pickedOwnRate - 0.2)} |`);
if (c) lines.push(`| consistency | ${pct(c.agreement)} agreement · ${c.contradictions} contradictions | – | – |`);
if (h) {
  lines.push("", "held_out_recall by fact type:", "", "| Type | n | Brain | Baseline | Lift |", "|---|---|---|---|---|");
  for (const t of FACT_TYPES) { const b = h.brainScore.byType[t], z = h.baselineScore.byType[t]; if (b.n) lines.push(`| ${t} | ${b.n} | ${pct(b.acc)} | ${pct(z.acc)} | ${signed(h.liftByType[t])} |`); }
  lines.push("", `Weakest fact type: **${h.weakestType}** (${pct(h.brainScore.byType[h.weakestType].acc)} accuracy, ${signed(h.liftByType[h.weakestType])} over base rate).`);
}
if (s && s.respondent === "simulated") lines.push("", "self_recognition answers are SIMULATED (word overlap with the person's own fragments). Real numbers need humans: `bun run lineup`.");
const block = lines.join("\n") + "\n";
console.log("\n" + block);
const summaryPath = "evals/results/summary.md";
const prev = (await Bun.file(summaryPath).exists()) ? await Bun.file(summaryPath).text() : "# childhood-brain eval results\n\nNewest run first. JSON per run sits next to this file.\n";
const header = prev.split("\n## ")[0];
const rest = prev.slice(header.length);
await Bun.write(summaryPath, header + "\n" + block + rest);
console.log(`results -> ${resultPath}\nsummary -> ${summaryPath}`);
