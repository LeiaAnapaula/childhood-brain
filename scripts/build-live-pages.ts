export {};
// bun run scripts/build-live-pages.ts [live.html]
// Writes the seed pages the childhood wikilinks point at (brain/parents, brain/schools, brain/events), the five
// bases (brain/bases), and the 25 hand-written repertoire childhoods from live.html (brain/childhoods/live-NNN.md).
// No slug: frontmatter; gbrain derives the slug from the path. Wikilinks are full-path: [[events/translator]].
const html = await Bun.file(process.argv[2] ?? "live.html").text();
const grab = (name: string) => {
  const s = html.indexOf(`const ${name} =`);
  if (s < 0) throw new Error(`${name} not found`);
  const a = html.indexOf("\n];", s), b = html.indexOf("\n};", s);
  const e = a >= 0 && (b < 0 || a < b) ? a + 3 : b + 3;
  return html.slice(s, e);
};
type Seed = { slug: string; name: string; text: string };
const SEEDS: { parents: Seed[]; schools: Seed[]; events: Seed[] } = new Function(grab("SEEDS") + "; return SEEDS;")();
const BASES: string[] = new Function(grab("BASES") + "; return BASES;")();
const REP: { base: string; links: string[]; text: string }[] = new Function(grab("REPERTOIRE") + "; return REPERTOIRE;")();
const baseSlug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const kind = (slug: string) => SEEDS.parents.some(s => s.slug === slug) ? "parents" : SEEDS.schools.some(s => s.slug === slug) ? "schools" : "events";
const seedOf = (slug: string) => [...SEEDS.parents, ...SEEDS.schools, ...SEEDS.events].find(s => s.slug === slug)!;

let n = 0;
for (const [dir, list, type] of [["parents", SEEDS.parents, "parent"], ["schools", SEEDS.schools, "school"], ["events", SEEDS.events, "event"]] as const) {
  for (const s of list) {
    const uses = REP.map((c, i) => c.links.includes(s.slug) ? `- [[childhoods/live-${String(i + 1).padStart(3, "0")}]]` : "").filter(Boolean);
    await Bun.write(`brain/${dir}/${s.slug}.md`, `---
type: ${type}
title: ${s.name}
---
# ${s.name}

${s.text}

## Appears in
${uses.join("\n") || "- (none yet)"}
`);
    n++;
  }
}
for (const b of BASES) {
  const uses = REP.map((c, i) => c.base === b ? `- [[childhoods/live-${String(i + 1).padStart(3, "0")}]]` : "").filter(Boolean);
  await Bun.write(`brain/bases/${baseSlug(b)}.md`, `---
type: base
title: ${b}
---
# ${b}

The base a childhood is written from. Same seven moments, different base, different fragment.

## Childhoods on this base
${uses.join("\n")}
`);
  n++;
}
for (const [i, c] of REP.entries()) {
  const id = `live-${String(i + 1).padStart(3, "0")}`;
  const parents = c.links.filter(l => kind(l) === "parents"), school = c.links.find(l => kind(l) === "schools")!, events = c.links.filter(l => kind(l) === "events");
  await Bun.write(`brain/childhoods/${id}.md`, `---
type: childhood
title: ${id}
base: ${c.base}
parents: ${parents.join(", ")}
school: ${school}
events: ${events.join(", ")}
generated_by: live.html repertoire
---
# ${id}

## Pattern
- [[bases/${baseSlug(c.base)}]] ${c.base}
${parents.map(l => `- [[parents/${l}]] ${seedOf(l).name}`).join("\n")}
- [[schools/${school}]] ${seedOf(school).name}
${events.map(l => `- [[events/${l}]] ${seedOf(l).name}`).join("\n")}

## Fragment
${c.text}

## Search terms
${c.links.map(l => `${l} ${seedOf(l).name}`).join(" · ")}
`);
  n++;
}
console.log(`wrote ${n} pages: ${SEEDS.parents.length} parents, ${SEEDS.schools.length} schools, ${SEEDS.events.length} events, ${BASES.length} bases, ${REP.length} repertoire childhoods`);
