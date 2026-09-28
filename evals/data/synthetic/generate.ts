// N=100 bun run generate            -> evals/data/synthetic/people.json + brain/childhoods/childhood-*.md
// N=5  bun run generate --out evals/data/synthetic/people.toy.json --pages /dev/null
import { SEEDS } from "../../brains/prototype-data";
import { buildFacts } from "../derive";
import { rng } from "../../seed";
import type { Person } from "../../types";

const N = Number(process.env.N ?? 100);
const SEED = process.env.SEED ?? "childhood-brain";
const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const OUT = opt("--out", "evals/data/synthetic/people.json");
const PAGES = opt("--pages", "brain/childhoods");

const NAMES = ["Ana", "Wei", "Priya", "Diego", "Mara", "Tomas", "Aiko", "Nadia", "Kofi", "Lena", "Rafael", "Ines", "Jun", "Sofia", "Omar", "Elif", "Mateo", "Zara", "Ravi", "Noor", "Luca", "Amara", "Hugo", "Yara", "Ivan", "Sana", "Theo", "Mila", "Arjun", "Rosa"];
const CITIES = [
  ["Chicago", "north-america"], ["Houston", "north-america"], ["Bay Area", "north-america"], ["Miami", "north-america"], ["Toronto", "north-america"],
  ["Lima", "south-america"], ["Arequipa", "south-america"], ["Bogota", "south-america"], ["Sao Paulo", "south-america"],
  ["Mumbai", "south-asia"], ["Delhi", "south-asia"], ["Chennai", "south-asia"], ["Lahore", "south-asia"],
  ["Shanghai", "east-asia"], ["Chengdu", "east-asia"], ["Seoul", "east-asia"], ["Osaka", "east-asia"],
  ["Mexico City", "latin-america"], ["Guadalajara", "latin-america"], ["Puebla", "latin-america"], ["Somewhere smaller", "rural"],
] as const;
const DECADES = ["1980s", "1990s", "2000s"];

const r = rng(`${SEED}:${N}`);
const people: Person[] = [];
for (let i = 1; i <= N; i++) {
  const [parent1, parent2] = r.sample(SEEDS.parents, 2).map(s => s.slug);
  const school = r.pick(SEEDS.schools).slug;
  const events = r.sample(SEEDS.events, 4).map(s => s.slug);
  if (r.next() < 0.25) events[3] = "none";
  const [city, region] = r.pick(CITIES);
  const decade = r.pick(DECADES);
  const id = `p${String(i).padStart(3, "0")}`;
  const name = r.pick(NAMES);
  people.push({ id, name, bucket: `${decade}/${region}`, consent: "synthetic", facts: buildFacts({ parent1, parent2, school, events, name, city, decade }) });
}
await Bun.write(OUT, JSON.stringify(people, null, 2) + "\n");

if (PAGES !== "/dev/null") {
  const seed = (slug: string) => [...SEEDS.parents, ...SEEDS.schools, ...SEEDS.events].find(s => s.slug === slug);
  for (const p of people) {
    const v = Object.fromEntries(p.facts.map(f => [f.field, f.value]));
    const line = (slug: string) => { const s = seed(slug); return s ? `- [[${SEEDS.parents.includes(s) ? "parents" : SEEDS.schools.includes(s) ? "schools" : "events"}/${slug}]] ${s.name}` : ""; };
    const md = `---
type: childhood
title: ${p.name}
person: ${p.id}
consent: ${p.consent}
bucket: ${p.bucket}
---
# ${p.name}

## Facts
- city: ${v.city}
- decade: ${v.decade}

## Parents
${[v.parent1, v.parent2].map(line).join("\n")}

## School
${line(v.school)}

## Life-changing events
${[v.event1, v.event2, v.event3, v.event4].map(line).filter(Boolean).join("\n")}

## Preferences
- comfort: ${v.comfort}
- way of loving: ${v.way_of_loving}

## Fears
- core fear: ${v.core_fear}
- social fear: ${v.social_fear}

## Under stress
- under stress: ${v.under_stress}
- under conflict: ${v.under_conflict}

## Childhood fragments
${[v.fragment_1, v.fragment_2, v.fragment_3, v.fragment_4].map(t => `- ${t}`).join("\n")}
`;
    await Bun.write(`${PAGES}/childhood-${p.id}.md`, md);
  }
}
console.log(`generated ${people.length} synthetic people -> ${OUT}${PAGES !== "/dev/null" ? `, pages -> ${PAGES}/childhood-*.md` : ""} (seed ${SEED})`);
