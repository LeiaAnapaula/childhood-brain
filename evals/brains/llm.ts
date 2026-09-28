// Claude models as Brains. `--brain llm` uses LLM_MODEL (haiku|sonnet|opus|fable or a full model id); evals/outcomes.ts and
// evals/famous.ts call makeLlmBrain(model) directly. The brain sees only the facts the runner hands it; the system prompt
// carries the seed glossary and the closed vocabularies from derive.ts so a prediction is scoreable by exact match.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { COMFORT_BY_EVENT, CONFLICT_BY_PARENT, FEAR_BY_PARENT, LOVE_BY_PARENT, SOCIAL_FEAR_BY_SCHOOL, STRESS_BY_PARENT } from "../data/derive";
import type { Brain } from "../interface";
import type { Fact, Question } from "../types";
import { SEEDS } from "./prototype-data";

export const MODELS: Record<string, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-5",
  opus: "claude-opus-5",
  fable: "claude-fable-5-1",
};
// $ per million tokens (input, output), Anthropic first-party list price, for the cost line in reports.
export const PRICE: Record<string, [number, number]> = {
  "claude-haiku-4-5-20251001": [1, 5], "claude-sonnet-5": [2, 10], "claude-opus-5": [5, 25], "claude-fable-5-1": [10, 50],
};
export const resolveModel = (m: string) => MODELS[m] ?? m;
export const shortName = (model: string) => Object.entries(MODELS).find(([, v]) => v === model)?.[0] ?? model;

const uniq = (xs: string[]) => [...new Set(xs)];
export const VOCAB: Record<string, string[]> = {
  parent1: SEEDS.parents.map(s => s.slug), parent2: SEEDS.parents.map(s => s.slug),
  school: SEEDS.schools.map(s => s.slug),
  event1: [...SEEDS.events.map(s => s.slug), "none"], event2: [...SEEDS.events.map(s => s.slug), "none"], event3: [...SEEDS.events.map(s => s.slug), "none"], event4: [...SEEDS.events.map(s => s.slug), "none"],
  comfort: uniq(Object.values(COMFORT_BY_EVENT)), way_of_loving: uniq(Object.values(LOVE_BY_PARENT)),
  core_fear: uniq(Object.values(FEAR_BY_PARENT)), social_fear: uniq(Object.values(SOCIAL_FEAR_BY_SCHOOL)),
  under_stress: uniq(Object.values(STRESS_BY_PARENT)), under_conflict: uniq(Object.values(CONFLICT_BY_PARENT)),
  decade: ["1970s", "1980s", "1990s", "2000s"],
};

const glossary = (title: string, xs: { slug: string; name: string; text: string }[]) => `${title}:\n` + xs.map(s => `- ${s.slug} = ${s.name}. ${s.text}`).join("\n");
export const SYSTEM = `You are the childhood-brain: a model of one person built from a few childhood facts. A childhood here is two parent archetypes, one school, and up to four life-changing events; from those the brain infers adult preferences, fears, and behavior under stress.

You will be given the facts that are known about one person and asked for one missing field. Predict it from the pattern of the known facts. When a list of allowed values is given, answer with exactly one value from that list, copied verbatim. Never answer "unknown" when a list is given; pick the most likely value. For free-text fields, answer in one or two plain sentences with no preamble.

${glossary("Parent archetypes (fields parent1, parent2)", SEEDS.parents)}

${glossary("Schools (field school)", SEEDS.schools)}

${glossary("Life-changing events (fields event1..event4; 'none' means that slot is empty)", SEEDS.events)}

Field meanings:
- comfort: what the person reaches for when they need comfort.
- way_of_loving: how they learned to love.
- core_fear: their core fear. social_fear: what they fear in front of other people.
- under_stress: what they do under stress. under_conflict: what they do in a conflict.
- fragment_1..4: first-person memory lines about, in order, the first adult in the house, school, the event that changed everything, and what they refused to become.
- portrait: a second-person childhood of about 120 words that would make this person say "that is me", with a quiet last line about what they still do today.`;

const Out = z.object({ value: z.string() });

export type Usage = { calls: number; input: number; output: number; cacheRead: number; cacheWrite: number; refusals: number; errors: number };
const emptyUsage = (): Usage => ({ calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, refusals: 0, errors: 0 });
export const costUSD = (model: string, u: Usage) => { const [i, o] = PRICE[model] ?? [0, 0]; return ((u.input + u.cacheWrite * 1.25 + u.cacheRead * 0.1) * i + u.output * o) / 1e6; };

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ maxRetries: 4 }));

// One structured call. Shared by the brain and by evals/outcomes.ts so token accounting is in one place.
export async function askJson<T extends z.ZodTypeAny>(model: string, system: string, user: string, schema: T, usage: Usage, opts: { effort?: "low" | "medium" | "high"; maxTokens?: number } = {}): Promise<z.infer<T> | null> {
  const c = getClient();
  const isHaiku = model.startsWith("claude-haiku");
  usage.calls++;
  try {
    const res = await c.messages.parse({
      model,
      max_tokens: opts.maxTokens ?? 8000,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
      output_config: { format: zodOutputFormat(schema), ...(isHaiku ? {} : { effort: opts.effort ?? "low" }) },
    });
    usage.input += res.usage.input_tokens; usage.output += res.usage.output_tokens;
    usage.cacheRead += res.usage.cache_read_input_tokens ?? 0; usage.cacheWrite += res.usage.cache_creation_input_tokens ?? 0;
    if (res.stop_reason === "refusal") { usage.refusals++; return null; }
    return (res.parsed_output as z.infer<T> | null) ?? null;
  } catch (e) {
    usage.errors++;
    if (e instanceof Anthropic.APIError) console.error(`[llm ${shortName(model)}] ${e.status} ${e.message.slice(0, 200)}`);
    else console.error(`[llm ${shortName(model)}]`, e);
    return null;
  }
}

export function renderFacts(facts: Fact[]): string { return facts.map(f => `- ${f.field} (${f.type}): ${f.value}`).join("\n"); }

export function makeLlmBrain(modelOrShort: string): Brain & { model: string; usage: Usage } {
  const model = resolveModel(modelOrShort);
  const usage = emptyUsage();
  return {
    name: `llm:${shortName(model)}`,
    model,
    usage,
    async query(person_facts: Fact[], question: Question): Promise<string> {
      const known = person_facts.find(f => f.field === question.field);
      if (known) return known.value;
      const allowed = VOCAB[question.field];
      const user = `Known facts about this person:\n${renderFacts(person_facts)}\n\nMissing field: ${question.field}\nQuestion: ${question.text}\n${allowed ? `Allowed values (answer with exactly one, verbatim):\n${allowed.map(v => `- ${v}`).join("\n")}` : question.field === "portrait" ? "Write the portrait (about 120 words, second person)." : "Answer in one or two plain sentences."}`;
      const out = await askJson(model, SYSTEM, user, Out, usage);
      let v = (out?.value ?? "unknown").trim();
      if (allowed && !allowed.includes(v)) { const hit = allowed.find(a => a.toLowerCase() === v.toLowerCase()); if (hit) v = hit; }
      return v;
    },
    async close() {
      const u = usage;
      if (u.calls) console.error(`[llm:${shortName(model)}] ${u.calls} calls · in ${u.input} (+${u.cacheRead} cached) · out ${u.output} · refusals ${u.refusals} · errors ${u.errors} · ~$${costUSD(model, u).toFixed(3)}`);
    },
  };
}

export default makeLlmBrain(process.env.LLM_MODEL ?? "opus");
