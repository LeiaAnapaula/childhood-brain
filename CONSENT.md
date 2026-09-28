# Consent for real people in childhood-brain

No real person's data is committed to this repository. The seed set is synthetic. Real entries live only in
`evals/data/consented/`, which is gitignored, and only after the steps below.

## Before adding someone

1. They are 18 or older and were told, in plain words, what this is: an eval that feeds part of what they wrote
   about their childhood to a model and checks whether the model can guess the rest, and a lineup where they pick
   their own childhood out of five.
2. They wrote or approved every fact themselves. Nobody fills in a childhood for someone else.
3. They know the facts may be shown, in the lineup, to other participants as decoys, without their name.
4. They know they can withdraw at any time by asking, and the file is deleted the same day.
5. First name or chosen name only. No surnames, no addresses, no other people's full names in fragments.

## How to add someone

- Copy `evals/data/schema.json` fields into `evals/data/consented/<id>.json` with `"consent": "consented"`.
- `bun run eval --people evals/data/consented/<id>.json --dry-run` to validate.
- Record the date and the words they consented to in a line in `evals/data/consented/CONSENT_LOG.md` (also gitignored).

## What the evals do with the data

- held_out_recall shows 70% of the facts to the brain and asks for the rest. Answers are stored in `evals/results/` locally.
- self_recognition writes lineups to `evals/results/lineups.*.json`. Decoys are other participants' fragments in the same bucket, unnamed.
- Nothing is uploaded except to the brain the runner is pointed at. `--brain llm` sends facts to the model provider; say so before using it with a consented person.

## Withdrawal

Delete `evals/data/consented/<id>.json`, any `evals/results/*` containing the id, and any brain pages generated from it. Note the deletion in the log.

## Public figures

`consent: "public"` marks a record reconstructed from public sources about a public figure, kept under
`evals/data/public/`. It is not consent. Use these only to compare brains against each other, never to
publish a reconstruction of that person, and keep every field traceable to a public source.
