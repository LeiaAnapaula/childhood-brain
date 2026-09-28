export {};
const html = await Bun.file(process.argv[2] ?? "prototype/which-childhood-is-yours.html").text();
const grab = (name: string) => {
  const s = html.indexOf(`const ${name} =`);
  const e = html.indexOf("\n];", s) >= 0 && (html.indexOf("\n};", s) < 0 || html.indexOf("\n];", s) < html.indexOf("\n};", s)) ? html.indexOf("\n];", s) + 3 : html.indexOf("\n};", s) + 3;
  return html.slice(s, e);
};
const SEEDS = new Function(grab("SEEDS") + "; return SEEDS;")();
const REP = new Function(grab("REPERTOIRE") + "; return REPERTOIRE;")();
const rep = REP.map((c: any, i: number) => ({ id: "childhood-" + String(i + 1).padStart(3, "0"), links: c.links, text: c.text }));
const out = `// Extracted from prototype/which-childhood-is-yours.html by scripts/extract-prototype.ts.
// SEEDS and REPERTOIRE are verbatim; base/country data was dropped on purpose (a childhood is parents + school + events).
export type Seed = { slug: string; name: string; text: string };
export type Childhood = { id: string; links: string[]; text: string };
export const SEEDS: { parents: Seed[]; schools: Seed[]; events: Seed[] } = ${JSON.stringify(SEEDS, null, 2)};
export const REPERTOIRE: Childhood[] = ${JSON.stringify(rep, null, 2)};
`;
await Bun.write("evals/brains/prototype-data.ts", out);
console.log("seeds", SEEDS.parents.length, SEEDS.schools.length, SEEDS.events.length, "repertoire", rep.length);
