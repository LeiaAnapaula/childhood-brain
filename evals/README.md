# childhood-brain evals

Measures how accurately a brain reconstructs a real person, scored so the number means "useful to a human".

## Run

```
bun install
N=100 bun run people              # synthetic people -> evals/data/synthetic/people.json (childhood pages: N=100 bun run generate.ts at the repo root)
bun run eval --dry-run            # validates inputs, no model calls
bun run eval                      # all three evals, default brain = prototype
bun run eval --brain stub --eval 1 --people evals/data/synthetic/people.toy.json --seed 7
bun run lineup                    # a human answers the self_recognition lineup
bun run parity                    # quiz HTML constants == evals/brains/prototype-data.ts
```

See the root README for the demo run order.

## Plug in your brain

Implement one function and pass the module path:

```ts
// my-brain.ts
import type { Brain } from "./evals/interface";
export default { name: "mine", async query(person_facts, question) { return "..."; } } satisfies Brain;
```

```
bun run eval --brain ./my-brain.ts
```

`person_facts` is the list of facts the brain is allowed to see. `question` carries `field`, `type` and a phrasing. Return the value as a string. Field `portrait` asks for the childhood fragment shown in self_recognition. Built in: `prototype` (default, the quiz's matcher), `stub` (answers only what it was told; the floor), `gbrain` (retrieval over the local gbrain MCP), `llm` (Claude, if `evals/brains/llm.ts` is present).

## The three evals

| Eval | What it measures | Baseline |
|---|---|---|
| held_out_recall (headline) | Feed 70% of a person's facts, predict the other 30%, seeded split. Broken down by fact type. | most common value per field |
| self_recognition | The person's matched childhood plus 4 decoys from the same demographic bucket. Percent who pick their own, plus a 1 to 5 "this is me" rating. | 20% chance |
| consistency | 20 fact questions, 10 phrasings each. Share of phrasings that agree with the modal answer. | – |

Fact types: facts, preferences, fears, stress, fragments (the first-person memory lines the quiz shows).

Results: `evals/results/<run>.json` and `evals/results/summary.md` (newest first). Every eval has `--dry-run`. Everything is seeded (`--seed`), same input gives the same score.

## Data

- `evals/data/schema.json` is the intake schema. `evals/data/synthetic/` is generated and clearly fake.
- `evals/data/consented/` is gitignored. Read `CONSENT.md` before adding a real person.
- `evals/data/questions.json` is the consistency bank (20 x 10). Edit it directly.
