import { FACT_TYPES, type Person, type Question } from "../types";

export function validatePerson(p: any, i: number): string[] {
  const errs: string[] = [];
  const at = `person[${i}]`;
  if (typeof p?.id !== "string" || !/^[a-z0-9-]+$/.test(p.id)) errs.push(`${at}.id missing or not kebab-case`);
  if (typeof p?.name !== "string") errs.push(`${at}.name missing`);
  if (typeof p?.bucket !== "string") errs.push(`${at}.bucket missing`);
  if (!["synthetic", "consented", "public"].includes(p?.consent)) errs.push(`${at}.consent must be synthetic|consented|public`);
  if (!Array.isArray(p?.facts) || p.facts.length < 8) errs.push(`${at}.facts needs at least 8 facts`);
  else p.facts.forEach((f: any, j: number) => {
    if (typeof f?.field !== "string" || typeof f?.value !== "string" || !FACT_TYPES.includes(f?.type)) errs.push(`${at}.facts[${j}] malformed`);
  });
  const fields = new Set((p?.facts ?? []).map((f: any) => f.field));
  if (fields.size !== (p?.facts ?? []).length) errs.push(`${at} has duplicate fields`);
  return errs;
}

export async function loadPeople(path: string): Promise<Person[]> {
  const raw = await Bun.file(path).json();
  const list: any[] = Array.isArray(raw) ? raw : raw.people;
  if (!Array.isArray(list)) throw new Error(`${path}: expected an array of people`);
  const errs = list.flatMap(validatePerson);
  if (errs.length) throw new Error(`${path} failed validation:\n  ${errs.slice(0, 20).join("\n  ")}`);
  const ids = new Set(list.map(p => p.id));
  if (ids.size !== list.length) throw new Error(`${path}: duplicate person ids`);
  return list as Person[];
}

export async function loadQuestions(path: string): Promise<{ field: string; type: Question["type"]; phrasings: string[] }[]> {
  const raw = await Bun.file(path).json();
  if (!Array.isArray(raw)) throw new Error(`${path}: expected an array`);
  for (const q of raw) {
    if (typeof q.field !== "string" || !FACT_TYPES.includes(q.type) || !Array.isArray(q.phrasings) || q.phrasings.length < 2) throw new Error(`${path}: bad question ${JSON.stringify(q).slice(0, 80)}`);
  }
  return raw;
}
