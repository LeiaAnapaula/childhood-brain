import { SEEDS } from "../brains/prototype-data";
import type { Fact, FactType, Picks } from "../types";

export const FEAR_BY_PARENT: Record<string, string> = { provider: "being provided for but not seen", protector: "being watched, and then being unwatched", golden: "failing in front of them", absent: "being left", friend: "having no adult in the room", striver: "owing more than can be repaid", constant: "losing the ordinary", storm: "the mood changing without warning" };
export const SOCIAL_FEAR_BY_SCHOOL: Record<string, string> = { public: "losing rank at the table", religious: "being shamed in front of everyone who knows the family", underfunded: "being underestimated", elite: "being found out", village: "being the one who left" };
export const STRESS_BY_PARENT: Record<string, string> = { provider: "gets organized and goes quiet", protector: "narrates every danger and cannot rest", golden: "performs harder", absent: "talks to the image instead of the person", friend: "becomes the grown-up in the room", striver: "gives more and says less", constant: "finds a place for the feeling to land", storm: "reads doors and footsteps" };
export const CONFLICT_BY_PARENT: Record<string, string> = { provider: "sets rules", protector: "holds on tighter", golden: "turns it into a test to win", absent: "disappears", friend: "makes it a joke", striver: "pays for it", constant: "stays and listens", storm: "goes silent and watchful" };
export const LOVE_BY_PARENT: Record<string, string> = { provider: "by providing", protector: "by protecting", golden: "by being proud", absent: "from a distance", friend: "as an equal", striver: "by sacrificing", constant: "by staying", storm: "in the calm between weathers" };
export const COMFORT_BY_EVENT: Record<string, string> = { seen: "one sentence someone said", responsibility: "being in charge of the house", move: "packing light", trait: "being praised for the trait", rupture: "the time before", humiliation: "being unseen", "loved-alone": "the thing nobody gave me", money: "knowing the prices", secret: "holding what cannot be held", translator: "standing between two rooms", win: "the day the story was about me", illness: "waiting rooms", "friend-left": "choosing first", forgiven: "being caught and loved anyway", shamed: "hiding well", summer: "a world I built", grandparent: "a kitchen with time in it", comparison: "someone else's units", "first-no": "the refusal", needed: "being useful", none: "nothing in particular" };

const OBJECT_CUES = ["saw", "on", "to", "for", "at", "with", "of", "by", "gave", "told", "relied", "take", "loved"];
export function firstPerson(text: string): string {
  return text
    .replace(/\bYou were\b/g, "I was").replace(/\byou were\b/g, "I was")
    .replace(/\bYou are\b/g, "I am").replace(/\byou are\b/g, "I am")
    .replace(/\bYourself\b/g, "Myself").replace(/\byourself\b/g, "myself")
    .replace(/\bYours\b/g, "Mine").replace(/\byours\b/g, "mine")
    .replace(/\bYour\b/g, "My").replace(/\byour\b/g, "my")
    .replace(/(\w+) you\b/g, (m, prev) => (OBJECT_CUES.includes(prev.toLowerCase()) ? `${prev} me` : `${prev} I`))
    .replace(/\bYou\b/g, "I");
}

export const seedText = (slug: string): string => {
  const all = [...SEEDS.parents, ...SEEDS.schools, ...SEEDS.events];
  return all.find((s) => s.slug === slug)?.text ?? "";
};
export const ev = (p: Picks, i: number) => p.events[i] ?? "none";

export const FIELD_TYPES: Record<string, FactType> = {
  name: "facts", city: "facts", decade: "facts", parent1: "facts", parent2: "facts", school: "facts", event1: "facts", event2: "facts", event3: "facts", event4: "facts",
  comfort: "preferences", way_of_loving: "preferences",
  core_fear: "fears", social_fear: "fears",
  under_stress: "stress", under_conflict: "stress",
  fragment_1: "fragments", fragment_2: "fragments", fragment_3: "fragments", fragment_4: "fragments",
};
export const FIELDS = Object.keys(FIELD_TYPES);

export function buildFacts(p: Picks & { name?: string; city?: string; decade?: string }): Fact[] {
  const v: Record<string, string> = {
    name: p.name ?? "unknown", city: p.city ?? "unknown", decade: p.decade ?? "unknown",
    parent1: p.parent1, parent2: p.parent2, school: p.school,
    event1: ev(p, 0), event2: ev(p, 1), event3: ev(p, 2), event4: ev(p, 3),
    comfort: COMFORT_BY_EVENT[ev(p, 0)] ?? COMFORT_BY_EVENT.none, way_of_loving: LOVE_BY_PARENT[p.parent2],
    core_fear: FEAR_BY_PARENT[p.parent1], social_fear: SOCIAL_FEAR_BY_SCHOOL[p.school],
    under_stress: STRESS_BY_PARENT[p.parent1], under_conflict: CONFLICT_BY_PARENT[p.parent2],
    fragment_1: firstPerson(seedText(p.parent1)), fragment_2: firstPerson(seedText(p.school)),
    fragment_3: firstPerson(seedText(ev(p, 0))) || "Nothing in particular changed the weights.",
    fragment_4: firstPerson(seedText(ev(p, 1))) || "Nothing in particular changed the weights.",
  };
  return FIELDS.map((field) => ({ field, type: FIELD_TYPES[field], value: v[field] }));
}
