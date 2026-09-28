import { rng } from "./seed";
import type { Fact, FactType, Person, Question } from "./types";
export type QBank = { field: string; type: FactType; phrasings: string[] }[];
export type EvalOpts = { people: Person[]; questions: QBank; seed: string; dryRun: boolean; simulate?: boolean; answersPath?: string; runName: string };
export const SPLIT = 0.7;
export function splitPerson(p: Person, seed: string): { train: Fact[]; test: Fact[] } {
  const [train, test] = rng(`${seed}:split:${p.id}`).split(p.facts, SPLIT);
  return { train, test };
}
export function questionFor(bank: QBank, field: string, type: FactType, phrasing = 0): Question {
  const q = bank.find(b => b.field === field);
  return { id: `${field}#${phrasing}`, field, type, text: q?.phrasings[phrasing] ?? `What is ${field.replace(/_/g, " ")}?` };
}
export const PORTRAIT: Question = { id: "portrait", field: "portrait", type: "fragments", text: "Write the childhood that recognizes this person, in the second person." };
