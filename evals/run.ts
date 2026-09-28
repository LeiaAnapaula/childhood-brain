// bun run evals/run.ts  -> evals/results.json, evals/results.md, and the numbers inlined into evals/index.html
// Four evals against the hosted quiz (site/index.html): matcher accuracy, narrowing, hallucination, gbrain agreement.
// The quiz's own functions (bestSplit, narrow, match, rewritePrompt) are loaded out of the HTML so nothing is re-implemented here.
import { existsSync } from "node:fs";
const ROOT = new URL("..", import.meta.url).pathname;
process.chdir(ROOT);
const MODEL = "claude-sonnet-4-6";
const SITE = "site/index.html";

// ---- load the quiz script with a stub DOM ----
const html = await Bun.file(SITE).text();
const js = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>")).replace(/render\(\);\s*$/, "");
const stubEl: any = { innerHTML: "", style: {}, querySelector: () => ({ addEventListener() {}, value: "", focus() {} }), querySelectorAll: () => [], appendChild() {} };
const document = { getElementById: () => stubEl, createElement: () => ({ set innerHTML(_: string) {}, content: { firstChild: stubEl } }) };
type Seed = { slug: string; name: string; text: string };
type Childhood = { base: string; links: string[]; text: string; id?: string };
type Pick = Seed & { who?: string; role?: string };
const quiz = new Function("document", "window", js + `
  return {
    SEEDS, REPERTOIRE, BASES, rounds,
    counter: () => alive.length || pool(home).length,
    options: (r) => { const used = new Set(picks.map(p => p.slug)); const cand = SEEDS[r.key].filter(o => !used.has(o.slug) && (!r.slugs || r.slugs.includes(o.slug))); return r.fixed ? cand.sort((a,b) => r.slugs.indexOf(a.slug) - r.slugs.indexOf(b.slug)) : bestSplit(cand); },
    tap: (o, extra) => { picks.push({ ...o, ...(extra || {}) }); narrow(o); },
    match: () => match(home),
    reset: (s) => { picks = []; alive = []; home = s.home; name = s.name || 'You'; cities = s.cities || []; money = s.money || ''; social = s.social || ''; },
    prompt: (hit) => rewritePrompt(home, hit),
  };
`)(document, {}) as {
  SEEDS: { parents: Seed[]; schools: Seed[]; events: Seed[] }; REPERTOIRE: Childhood[]; BASES: string[]; rounds: { key: "parents" | "schools" | "events"; slugs?: string[]; fixed?: boolean }[];
  counter: () => number; options: (r: any) => Seed[]; tap: (o: Seed, extra?: Partial<Pick>) => void; match: () => Childhood;
  reset: (s: { home: string; name?: string; cities?: string[]; money?: string; social?: string }) => void; prompt: (hit: Childhood) => string;
};
const { SEEDS, REPERTOIRE, rounds } = quiz;
const ALL = [...SEEDS.parents, ...SEEDS.schools, ...SEEDS.events];
const seed = (slug: string) => ALL.find(s => s.slug === slug)!;
const liveId = (i: number) => `live-${String(i + 1).padStart(3, "0")}`;
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// ---- a. matcher accuracy + b. narrowing ----
// A person whose picks are exactly one childhood's links walks the seven rounds as the quiz shows them:
// taps the shown option that is in their links, taps "None of these" on an event round that shows none,
// and on a parent or school round that shows none of theirs is forced to tap the first option (the quiz has no None there).
function simulate(pool: "base" | "all") {
  const rows = REPERTOIRE.map((c, i) => {
    quiz.reset({ home: pool === "base" ? c.base : "any" });
    let firstOne: number | null = null, forced = 0;
    rounds.forEach((r, k) => {
      const opts = quiz.options(r);
      const want = opts.find(o => c.links.includes(o.slug));
      if (want) quiz.tap(want);
      else if (r.key !== "events") { quiz.tap(opts[0]); forced++; }
      if (firstOne === null && quiz.counter() === 1) firstOne = k + 1;
    });
    const hit = quiz.match();
    return { id: liveId(i), base: c.base, correct: REPERTOIRE.indexOf(hit) === i, matched: liveId(REPERTOIRE.indexOf(hit)), remaining: quiz.counter(), firstOne, forced };
  });
  const n = rows.length;
  return {
    pool: pool === "base" ? "the quiz's base pool (5 childhoods per city)" : "all 25 childhoods",
    n, top1: rows.filter(r => r.correct).length, top1_rate: rows.filter(r => r.correct).length / n,
    median_remaining: median(rows.map(r => r.remaining)),
    reached_one_before_seventh: rows.filter(r => r.firstOne !== null && r.firstOne! <= 6).length,
    reached_one_rate: rows.filter(r => r.firstOne !== null && r.firstOne! <= 6).length / n,
    forced_picks: rows.reduce((s, r) => s + r.forced, 0),
    rows,
  };
}
const simBase = simulate("base"), simAll = simulate("all");

// ---- c. hallucination ----
type Person = { name: string; base: string; cities: string[]; rep: number; who: Record<string, [string, string?]>; money?: string; social?: string; job?: string };
const PEOPLE: Person[] = [
  { name: "Leia", base: "United States", cities: ["Lima, Peru", "Bay Area, United States"], rep: 0, who: { provider: ["Carlos", "Dad"], constant: ["Rosa", "Mom"], public: ["Lincoln Middle"] }, money: "The year the print shop closed my mom Rosa started paying for groceries in cash she counted twice. I stopped asking for the class trip.", social: "In seventh grade Priya moved to the loud table and did not save me a seat. I ate in the library for a year." },
  { name: "Marcus", base: "United States", cities: ["Chicago, United States"], rep: 1, who: { storm: ["Ray", "Dad"], absent: ["Denise", "Mom"], underfunded: ["Dunbar"], seen: ["Ms. Okafor"] } },
  { name: "Valentina", base: "Lima, Peru", cities: ["Lima, Peru"], rep: 6, who: { provider: ["Jorge", "Dad"], storm: ["Pilar", "Mom"], religious: ["Santa Úrsula"], comparison: ["Camila"] }, money: "When the store lost the corner lease my dad Jorge sold the truck and we walked to school for two years." },
  { name: "Aarav", base: "Mumbai, India", cities: ["Mumbai, India"], rep: 11, who: { striver: ["Suresh", "Dad"], constant: ["Meena", "Mom"], underfunded: ["Municipal School No. 4"], grandparent: ["Dadi"] }, social: "Rohan copied my maths homework every morning and then told the class I was the one copying. Nobody sat with me at tiffin after that." },
  { name: "Wei", base: "Shanghai, China", cities: ["Shanghai, China"], rep: 16, who: { absent: ["Baba", "Dad"], striver: ["Mama", "Mom"], public: ["Pudong No. 2"], grandparent: ["Nainai"] } },
  { name: "Ximena", base: "Mexico City, Mexico", cities: ["Puebla, Mexico", "Mexico City, Mexico"], rep: 22, who: { absent: ["Beto", "Dad"], protector: ["Lupita", "Mom"], underfunded: ["Escuela Benito Juárez"], seen: ["Maestra Reyes"] }, money: "My mom Lupita kept the electricity money in a coffee tin and when it was empty we did homework by the window until dark." },
  { name: "Jonah", base: "United States", cities: ["Houston, United States"], rep: 3, who: { friend: ["Tammy", "Mom"], storm: ["Bill", "Stepdad"], village: ["Cy-Fair"] }, social: "Danny was my best friend until he got a truck and I did not. He drove past the bus stop every morning." },
  { name: "Isabel", base: "Lima, Peru", cities: ["Arequipa, Peru", "Lima, Peru"], rep: 7, who: { absent: ["Papá", "Dad"], protector: ["Nelly", "Mom"], underfunded: ["Colegio 40015"], seen: ["Señor Paredes"] } },
  { name: "Ananya", base: "Mumbai, India", cities: ["Mumbai, India"], rep: 10, who: { golden: ["Rajesh", "Dad"], protector: ["Sunita", "Mom"], public: ["Balmohan"], comparison: ["Vikram"] }, money: "Dad Rajesh paid the school fee in three parts and the office clerk said my name loudly each time." },
  { name: "Diego", base: "Mexico City, Mexico", cities: ["Mexico City, Mexico"], rep: 20, who: { striver: ["Toño", "Dad"], constant: ["Chela", "Mom"], public: ["Primaria Morelos"], grandparent: ["Abuela Carmen"] }, social: "Los de la esquina picked teams every afternoon and I was picked last until I could keep goal. Then I was picked first." },
];
const JOBS = ["doctor", "engineer", "teacher", "lawyer", "driver", "nurse", "store", "factory"];
const INNER = ["felt", "decided", "feared", "wanted", "thought"];
// Capitalized mid-sentence words that are not names: common English, kin words, days, months, languages, nationalities.
const COMMON = new Set(`i a an the you your yours english spanish hindi marathi mandarin chinese american peruvian indian mexican mom dad mama papa mother father grandma grandpa abuela abuelo dadi nainai nana tv ap sat pe monday tuesday wednesday thursday friday saturday sunday sundays saturdays january february march april may june july august september october november december christmas diwali easter spring festival god virgen dios señor señora maestro maestra sister mr mrs ms miss no yes`.split(/\s+/));
const words = (s: string) => (s.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).map(w => w.replace(/['’]s$/, "").replace(/[.'’-]+$/, ""));
function flagCaps(text: string, allowed: Set<string>) {
  const out: string[] = [];
  const re = /(^|[^\p{L}\p{N}'’])([A-ZÀ-Þ][\p{L}'’.-]*)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const before = text.slice(0, m.index + m[1].length).trimEnd();
    const sentenceStart = before === "" || /[.!?:"“”]$/.test(before);
    if (sentenceStart) continue;
    const w = m[2].toLowerCase().replace(/['’]s$/, "").replace(/[.'’-]+$/, "");
    if (!w || COMMON.has(w) || allowed.has(w)) continue;
    out.push(m[2]);
  }
  return [...new Set(out)];
}
async function askClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set (put it in .env)");
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: MODEL, max_tokens: 800, messages: [{ role: "user", content: prompt }] }) });
  const j: any = await r.json();
  if (!r.ok) throw new Error(j?.error?.message ?? `anthropic ${r.status}`);
  return (j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
}
const parseJson = (text: string) => { const b = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim(); const a = b.indexOf("{"), z = b.lastIndexOf("}"); return JSON.parse(a >= 0 && z > a ? b.slice(a, z + 1) : b); };

async function hallucination() {
  const rows = [];
  for (const p of PEOPLE) {
    const c = REPERTOIRE[p.rep];
    quiz.reset({ home: p.base, name: p.name, cities: p.cities, money: p.money, social: p.social });
    for (const slug of c.links) { const w = p.who[slug]; quiz.tap(seed(slug), w ? { who: w[0], role: w[1] } : {}); }
    const hit = quiz.match();
    const prompt = quiz.prompt(hit);
    const allowed = new Set<string>([...words(p.name), ...p.cities.flatMap(words), ...Object.values(p.who).flatMap(w => words(w[0])), ...words(p.money ?? ""), ...words(p.social ?? ""), ...c.links.flatMap(l => words(seed(l).name))]);
    let text = "", err = "";
    try { const out = parseJson(await askClaude(prompt)); text = [out.fragment, ...(out.endings ?? [])].filter(Boolean).join(" "); } catch (e: any) { err = String(e.message ?? e); }
    const low = text.toLowerCase();
    // A job word counts only when the person gave no job and did not use the word in their own stories.
    const given = ((p.job ?? "") + " " + (p.money ?? "") + " " + (p.social ?? "")).toLowerCase();
    const jobs = JOBS.filter(j => new RegExp(`\\b${j}s?\\b`).test(low) && !new RegExp(`\\b${j}s?\\b`).test(given));
    const inner = INNER.filter(v => new RegExp(`\\b${v}\\b`).test(low));
    rows.push({ name: p.name, base: p.base, childhood: liveId(REPERTOIRE.indexOf(hit)), invented: err ? [] : flagCaps(text, allowed), jobs, inner, error: err || undefined, text });
    process.stderr.write(`  ${p.name}: invented=${rows.at(-1)!.invented.join(",") || "-"} jobs=${jobs.join(",") || "-"} inner=${inner.join(",") || "-"}${err ? " ERROR " + err : ""}\n`);
  }
  const ok = rows.filter(r => !r.error);
  return {
    model: MODEL, n: PEOPLE.length, completed: ok.length,
    invention_rate: ok.length ? ok.filter(r => r.invented.length).length / ok.length : null,
    people_with_invented: ok.filter(r => r.invented.length).length,
    people_with_job_words: ok.filter(r => r.jobs.length).length,
    people_with_inner_life: ok.filter(r => r.inner.length).length,
    violation_rate: ok.length ? ok.filter(r => r.invented.length || r.jobs.length || r.inner.length).length / ok.length : null,
    rows,
  };
}

// ---- d. gbrain agreement ----
const GBRAIN = process.env.GBRAIN_BIN ?? `${process.env.HOME}/.bun/bin/gbrain`;
const GHOME = process.env.GBRAIN_HOME ?? (existsSync(".scratch-home/.gbrain") ? `${ROOT}.scratch-home` : process.env.HOME!);
async function gsearch(q: string): Promise<string[]> {
  const p = Bun.spawn([GBRAIN, "search", q, "--json", "--limit", "10"], { env: { ...process.env, HOME: GHOME }, stdout: "pipe", stderr: "pipe" });
  const out = await new Response(p.stdout).text(); await p.exited;
  const a = out.indexOf("["); if (a < 0) return [];
  let hits: any[] = []; try { hits = JSON.parse(out.slice(a)); } catch { return []; }
  return hits.map(h => h.slug ?? h.page_slug ?? "").filter((s: string) => s.startsWith("childhoods/"));
}
async function gbrainAgreement() {
  const rows = [];
  for (const [i, c] of REPERTOIRE.entries()) {
    quiz.reset({ home: c.base });
    for (const slug of c.links) quiz.tap(seed(slug));
    const expect = `childhoods/${liveId(REPERTOIRE.indexOf(quiz.match()))}`;
    const q = c.links.map(l => seed(l).name).join(" ");
    let slugs: string[] = [], err = "";
    try { slugs = await gsearch(q); } catch (e: any) { err = String(e.message ?? e); }
    const top = slugs[0] ?? null, topLive = slugs.find(s => s.includes("/live-")) ?? null;
    rows.push({ id: liveId(i), expect, top, top_live: topLive, agree: top === expect, agree_live_only: topLive === expect, error: err || undefined });
  }
  const n = rows.length;
  return { brain: GHOME, n, agreement: rows.filter(r => r.agree).length, agreement_rate: rows.filter(r => r.agree).length / n, agreement_live_only: rows.filter(r => r.agree_live_only).length, agreement_live_only_rate: rows.filter(r => r.agree_live_only).length / n, no_result: rows.filter(r => !r.top).length, rows };
}

// ---- run + write ----
process.stderr.write("a/b matcher + narrowing done\nc hallucination (calls Claude)...\n");
const hall = await hallucination();
process.stderr.write("d gbrain agreement...\n");
const gb = await gbrainAgreement();
const results = { generated_at: new Date().toISOString(), site: SITE, matcher: simBase, matcher_all25: simAll, narrowing: { pool: simBase.pool, n: simBase.n, reached_one_before_seventh: simBase.reached_one_before_seventh, rate: simBase.reached_one_rate, all25: { reached_one_before_seventh: simAll.reached_one_before_seventh, rate: simAll.reached_one_rate } }, hallucination: hall, gbrain: gb };
await Bun.write("evals/results.json", JSON.stringify(results, null, 2));

const pct = (x: number | null) => x === null ? "n/a" : Math.round(x * 100) + "%";
const md = `# Quiz evals (${results.generated_at.slice(0, 10)})

Against \`${SITE}\`. Rerun: \`bun run evals/run.ts\`.

| Eval | Number | Method |
|---|---|---|
| Matcher accuracy | ${simBase.top1}/${simBase.n} top-1 (${pct(simBase.top1_rate)}), median ${simBase.median_remaining} childhood(s) left after 7 taps | Each of the 25 childhoods becomes a person whose picks are its links; they walk the quiz's own bestSplit/narrow/match over ${simBase.pool}. All-25 pool: ${simAll.top1}/${simAll.n}, median ${simAll.median_remaining}. Forced wrong parent/school taps: ${simBase.forced_picks}. |
| Narrowing | ${simBase.reached_one_before_seventh}/${simBase.n} (${pct(simBase.reached_one_rate)}) reach 1 before the seventh tap | Same walk; first tap at which the "still possible" counter reads 1. All-25 pool: ${simAll.reached_one_before_seventh}/${simAll.n}. |
| Hallucination | ${pct(hall.invention_rate)} of ${hall.completed} people got an invented capitalized token; ${hall.people_with_job_words} had job words, ${hall.people_with_inner_life} had inner-life verbs | 10 synthetic people with names, roles, cities, school, stories. The quiz's rewritePrompt is sent to ${MODEL}; capitalized mid-sentence tokens not in the particulars or a common-word list are flagged. |
| GBrain agreement | ${gb.agreement}/${gb.n} (${pct(gb.agreement_rate)}) strict; ${gb.agreement_live_only}/${gb.n} among live-* pages | For the 25 people, \`gbrain search\` on the concatenated link names; top childhood page compared with the quiz's match. Brain: ${gb.brain}. No result: ${gb.no_result}. |

## Hallucination flags

| Person | Childhood | Invented tokens | Job words | Inner-life verbs |
|---|---|---|---|---|
${hall.rows.map(r => `| ${r.name} | ${r.childhood} | ${r.error ? "error: " + r.error : r.invented.join(", ") || "–"} | ${r.jobs.join(", ") || "–"} | ${r.inner.join(", ") || "–"} |`).join("\n")}

## GBrain rows

| Person | Quiz match | GBrain top | Top live-* |
|---|---|---|---|
${gb.rows.map(r => `| ${r.id} | ${r.expect.replace("childhoods/", "")} | ${(r.top ?? "none").replace("childhoods/", "")} | ${(r.top_live ?? "none").replace("childhoods/", "")} |`).join("\n")}
`;
await Bun.write("evals/results.md", md);

// inline the numbers into evals/index.html so the page works without a server
const page = "evals/index.html";
if (existsSync(page)) {
  const h = await Bun.file(page).text();
  const re = /(<script id="results" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (re.test(h)) await Bun.write(page, h.replace(re, `$1${JSON.stringify(results).replace(/<\//g, "<\\/")}$2`));
}
console.log(`matcher ${simBase.top1}/${simBase.n} (median ${simBase.median_remaining} left) · narrowing ${simBase.reached_one_before_seventh}/${simBase.n} · hallucination ${pct(hall.invention_rate)} invented · gbrain ${gb.agreement}/${gb.n}`);
