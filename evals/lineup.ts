// bun run lineup [--lineups evals/results/lineups.<run>.json] [--person p001] [--out evals/results/lineup-answers.<run>.json]
// A human reads five childhoods and picks their own, then rates how much the picked one feels like them (1-5).
import type { Lineup, LineupAnswer } from "./self_recognition";
const argv = process.argv.slice(2);
const opt = (k: string, d?: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const glob = new Bun.Glob("lineups.*.json");
const found = [...glob.scanSync("evals/results")].filter(f => !f.endsWith(".key.json")).sort();
const lineupsPath: string = opt("--lineups", found.length ? `evals/results/${found[found.length - 1]}` : "") ?? "";
if (!lineupsPath) { console.error("no lineups found; run `bun run eval --eval 2` first"); process.exit(1); }
const run = lineupsPath.replace(/^.*lineups\./, "").replace(/\.json$/, "");
const outPath: string = opt("--out", `evals/results/lineup-answers.${run}.json`)!;
const only = opt("--person");
const lineups: Lineup[] = await Bun.file(lineupsPath).json();
const existing: LineupAnswer[] = (await Bun.file(outPath).exists()) ? await Bun.file(outPath).json() : [];
const letters = ["A", "B", "C", "D", "E"];
for (const l of lineups) {
  if (only && l.person !== only) continue;
  if (existing.some(a => a.person === l.person)) continue;
  console.log(`\n${l.name} (${l.person}) · five childhoods. One was written for you.\n`);
  l.options.forEach((t, i) => console.log(`${letters[i]}.  ${t}\n`));
  let pick = -1;
  while (pick < 0) { const a = (prompt("Which one is you? (A-E, or q to stop)") ?? "").trim().toUpperCase(); if (a === "Q") process.exit(0); pick = letters.indexOf(a); }
  let rating = 0;
  while (!(rating >= 1 && rating <= 5)) rating = Number(prompt("How much is that one you? (1 = not me, 5 = this is me)") ?? "");
  existing.push({ person: l.person, picked: pick, rating, respondent: "human" });
  await Bun.write(outPath, JSON.stringify(existing, null, 2) + "\n");
  console.log(`saved -> ${outPath}`);
}
console.log(`\n${existing.length} answered. Score with: bun run eval --eval 2 --answers ${outPath}`);
