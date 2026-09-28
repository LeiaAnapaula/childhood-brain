// N=100 bun run generate.ts            -> brain/childhoods/childhood-NNN.md
// With ANTHROPIC_API_KEY set, Claude writes each fragment; without it, the fragment is composed from seeds.json
// texts (roles only, no names) and the page says generated_by: template. Pages carry no slug: frontmatter on
// purpose; gbrain derives the slug from the path.
import { rng } from "./evals/seed";

type Seed = { slug: string; name: string; text: string };
const SEEDS: { parents: Seed[]; schools: Seed[]; events: Seed[] } = await Bun.file("seeds.json").json();
const N = Number(process.env.N ?? 100);
const SEED = process.env.SEED ?? "childhood-brain";
const MODEL = process.env.MODEL ?? "claude-sonnet-5";
const OUT = "brain/childhoods";
const CITIES = ["Chicago", "Houston", "the Bay Area", "Miami", "Toronto", "Lima", "Arequipa", "Bogota", "Sao Paulo", "Mumbai", "Delhi", "Chennai", "Lahore", "Shanghai", "Chengdu", "Seoul", "Osaka", "Mexico City", "Guadalajara", "Puebla", "somewhere smaller"];

export const PROMPT = (p: { parents: Seed[]; school: Seed; events: Seed[]; city: string }) => `You are writing a 140-word second-person childhood fragment. A childhood is parents + school + a few life-changing events. Do not name any city, country or neighborhood; the place is a separate fact and the reader will supply their own.
Parents: ${p.parents.map(s => `${s.name} (${s.text})`).join(" / ")}
School: ${p.school.name} (${p.school.text})
Life-changing events: ${p.events.map(s => `${s.name} (${s.text})`).join(" / ")}
Keep a steady rhythm, concrete sensory detail, and a quiet last line.
Never invent proper names for teachers, relatives, or friends. Use roles only (one teacher, your cousin, your grandmother). Names come from the person at demo time.
Rules: no em dashes, no headings, no preamble, return only the fragment.`;

const template = (p: { parents: Seed[]; school: Seed; events: Seed[]; city: string }) =>
  [...p.parents.map(s => s.text), p.school.text, ...p.events.map(s => s.text)].join(" ");

let write: ((prompt: string) => Promise<string>) | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ maxRetries: 4 });
  write = async (prompt) => {
    const r = await client.messages.create({ model: MODEL, max_tokens: 400, messages: [{ role: "user", content: prompt }] });
    return r.content.map((c: any) => c.text ?? "").join("").trim();
  };
}

const r = rng(`${SEED}:pages:${N}`);
const combos = Array.from({ length: N }, (_, i) => {
  const parents = r.sample(SEEDS.parents, 2), school = r.pick(SEEDS.schools), events = r.sample(SEEDS.events, 3), city = r.pick(CITIES);
  return { i: i + 1, parents, school, events, city };
});

const page = (c: typeof combos[number], fragment: string, by: string) => {
  const id = `childhood-${String(c.i).padStart(3, "0")}`;
  const link = (kind: string, s: Seed) => `- [[${kind}/${s.slug}]] ${s.name}`;
  return `---
type: childhood
title: ${id}
parents: ${c.parents.map(s => s.slug).join(", ")}
school: ${c.school.slug}
events: ${c.events.map(s => s.slug).join(", ")}
city: ${c.city}
generated_by: ${by}
---
# ${id}

## Pattern
${c.parents.map(s => link("parents", s)).join("\n")}
${link("schools", c.school)}
${c.events.map(s => link("events", s)).join("\n")}

## Fragment
${fragment}

## Search terms
${[...c.parents, c.school, ...c.events].map(s => `${s.slug} ${s.name}`).join(" · ")}
`;
};

let done = 0;
const worker = async (queue: typeof combos) => {
  for (const c of queue) {
    const prompt = PROMPT(c);
    let fragment = "", by = "template";
    if (write) { try { fragment = await write(prompt); by = MODEL; } catch (e) { console.error(`childhood-${c.i}: ${(e as Error).message}; using template`); } }
    if (!fragment) fragment = template(c);
    await Bun.write(`${OUT}/childhood-${String(c.i).padStart(3, "0")}.md`, page(c, fragment, by));
    done++;
  }
};
const lanes = 4;
await Promise.all(Array.from({ length: lanes }, (_, k) => worker(combos.filter((_, i) => i % lanes === k))));
console.log(`wrote ${done} pages -> ${OUT}/childhood-*.md (${write ? MODEL : "template, no ANTHROPIC_API_KEY"}; seed ${SEED})`);
