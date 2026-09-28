import { REPERTOIRE, SEEDS, type Childhood, type Seed } from "./prototype-data";
import { buildFacts } from "../data/derive";
import type { Brain } from "../interface";
import type { Fact, Picks, Question } from "../types";

// Matching logic copied from prototype/which-childhood-is-yours.html. The quiz kept `alive`, `picks`
// and `pool(home)` as globals; here they are parameters. `pool` is the whole repertoire now that the
// base-city concept is gone. Computation is otherwise unchanged.
export function bestSplit(options: Seed[], alive: Childhood[], pool: Childhood[] = REPERTOIRE): Seed[] {
  const p = alive.length ? alive : pool;
  return options.map(o => {
    const yes = p.filter(c => c.links.includes(o.slug)).length;
    return { o, bal: Math.abs(yes / Math.max(p.length,1) - 0.5), yes };
  }).sort((a,b) => Number(b.yes>0) - Number(a.yes>0) || a.bal - b.bal).slice(0,4).map(x => x.o);
}
export function narrow(o: Seed, alive: Childhood[], pool: Childhood[] = REPERTOIRE): Childhood[] { const p = alive.length ? alive : pool; const n = p.filter(c => c.links.includes(o.slug)); return n.length ? n : p; }
export function score(c: Childhood, ps: { slug: string }[]): number { return ps.reduce((s,p) => s + (c.links.includes(p.slug) ? 1 : 0), 0); }
export function match(picks: { slug: string }[], pool: Childhood[] = REPERTOIRE): Childhood { return [...pool].sort((a,b) => score(b,picks) - score(a,picks))[0]; }
export function ranked(picks: { slug: string }[], pool: Childhood[] = REPERTOIRE): Childhood[] { return [...pool].sort((a,b) => score(b,picks) - score(a,picks)); }

const PICK_FIELDS = ["parent1", "parent2", "school", "event1", "event2", "event3", "event4"];
const isParent = (s: string) => SEEDS.parents.some(x => x.slug === s);
const isSchool = (s: string) => SEEDS.schools.some(x => x.slug === s);
const isEvent = (s: string) => SEEDS.events.some(x => x.slug === s);

export function effectivePicks(known: Record<string, string>): { picks: Picks; hit: Childhood } {
  const slugs = PICK_FIELDS.map(f => known[f]).filter(v => v && v !== "none").map(slug => ({ slug }));
  const order = ranked(slugs);
  const hit = order[0];
  const hitParents = hit.links.filter(isParent), hitSchool = hit.links.find(isSchool) ?? "public";
  const parent1 = known.parent1 ?? hitParents.find(p => p !== known.parent2) ?? hitParents[0];
  const parent2 = known.parent2 ?? hitParents.find(p => p !== parent1) ?? hitParents[1] ?? hitParents[0];
  const school = known.school ?? hitSchool;
  const used = new Set<string>();
  const events: string[] = [];
  const candidates = [...hit.links.filter(isEvent), ...order.slice(1).flatMap(c => c.links.filter(isEvent))];
  for (let i = 1; i <= 4; i++) {
    const f = `event${i}`;
    let v = known[f];
    if (v === undefined) v = candidates.find(c => !used.has(c) && !Object.values(known).includes(c)) ?? "none";
    if (v !== "none") used.add(v);
    events.push(v);
  }
  return { picks: { parent1, parent2, school, events }, hit };
}

export const prototypeBrain: Brain = {
  name: "prototype",
  async query(person_facts: Fact[], question: Question): Promise<string> {
    const known: Record<string, string> = {};
    for (const f of person_facts) known[f.field] = f.value;
    if (known[question.field] !== undefined) return known[question.field];
    const { picks, hit } = effectivePicks(known);
    if (question.field === "portrait") return hit.text;
    const derived = buildFacts(picks).find(f => f.field === question.field);
    return derived?.value ?? "unknown";
  },
};
export default prototypeBrain;
