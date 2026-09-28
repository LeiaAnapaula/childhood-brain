# Changelog

## 0.1.0 (2026-09-27) — hackathon ship

- Quiz: `live.html` (hosted tap loop with country bases) and `index.html` (local version wired to `/api/search` and `/api/person`, generated from `prototype/` by `scripts/wire-prototype.ts`).
- Server: `server.ts` on :3000 serves the quiz, answers search through the local gbrain, writes `brain/people/` pages and re-imports; coalesced follow-up imports, payload validation, missing-index guard.
- Corpus: `generate.ts` (100 childhoods written by claude-sonnet-5 from `seeds.json`), `scripts/build-live-pages.ts` (8 parents, 5 schools, 20 events, 5 bases, 25 repertoire childhoods from live.html). 163 pages, every wikilink resolves.
- Brain: keyless PGLite gbrain; judge's command `gbrain search "translator grandparent win" --limit 3` returns `childhoods/live-006`. Owner-stamp repair procedure in `docs/retro.md`.
- Evals: `evals/` harness (held_out_recall, self_recognition lineup, consistency) with prototype, stub, gbrain and Claude (`llm`) brains; founders dataset (`evals/data/public/`), blind outcome prediction (`evals/outcomes.ts`), per-model reports in `evals/results/*.md`.
- Docs: `docs/ceo-review.md`, `docs/retro.md`, `CONSENT.md`, `RUNNING_NOTES.md`, brain lessons page.
