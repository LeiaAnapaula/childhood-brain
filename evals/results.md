# Quiz evals (2026-09-28)

Against `site/index.html`. Rerun: `bun run evals/run.ts`.

| Eval | Number | Method |
|---|---|---|
| Matcher accuracy | 23/25 top-1 (92%), median 1 childhood(s) left after 7 taps | Each of the 25 childhoods becomes a person whose picks are its links; they walk the quiz's own bestSplit/narrow/match over the quiz's base pool (5 childhoods per city). All-25 pool: 18/25, median 1. Forced wrong parent/school taps: 8. |
| Narrowing | 23/25 (92%) reach 1 before the seventh tap | Same walk; first tap at which the "still possible" counter reads 1. All-25 pool: 14/25. |
| Hallucination | 0% of 10 people got an invented capitalized token; 7 had job words, 0 had inner-life verbs | 10 synthetic people with names, roles, cities, school, stories. The quiz's rewritePrompt is sent to claude-sonnet-4-6; capitalized mid-sentence tokens not in the particulars or a common-word list are flagged. |
| GBrain agreement | 20/25 (80%) strict; 20/25 among live-* pages | For the 25 people, `gbrain search` on the concatenated link names; top childhood page compared with the quiz's match. Brain: /Users/apple/Souling/childhood-brain/.scratch-home. No result: 0. |

## Hallucination flags

| Person | Childhood | Invented tokens | Job words | Inner-life verbs |
|---|---|---|---|---|
| Leia | live-001 | – | – | – |
| Marcus | live-002 | – | teacher | – |
| Valentina | live-007 | – | teacher | – |
| Aarav | live-012 | – | teacher | – |
| Wei | live-017 | – | – | – |
| Ximena | live-023 | – | teacher | – |
| Jonah | live-004 | – | – | – |
| Isabel | live-008 | – | teacher | – |
| Ananya | live-011 | – | teacher | – |
| Diego | live-021 | – | teacher | – |

## GBrain rows

| Person | Quiz match | GBrain top | Top live-* |
|---|---|---|---|
| live-001 | live-001 | live-001 | live-001 |
| live-002 | live-002 | live-002 | live-002 |
| live-003 | live-003 | live-003 | live-003 |
| live-004 | live-004 | live-004 | live-004 |
| live-005 | live-005 | live-005 | live-005 |
| live-006 | live-006 | live-021 | live-021 |
| live-007 | live-007 | live-022 | live-022 |
| live-008 | live-008 | live-023 | live-023 |
| live-009 | live-009 | live-024 | live-024 |
| live-010 | live-010 | live-025 | live-025 |
| live-011 | live-011 | live-011 | live-011 |
| live-012 | live-012 | live-012 | live-012 |
| live-013 | live-013 | live-013 | live-013 |
| live-014 | live-014 | live-014 | live-014 |
| live-015 | live-015 | live-015 | live-015 |
| live-016 | live-016 | live-016 | live-016 |
| live-017 | live-017 | live-017 | live-017 |
| live-018 | live-018 | live-018 | live-018 |
| live-019 | live-019 | live-019 | live-019 |
| live-020 | live-020 | live-020 | live-020 |
| live-021 | live-021 | live-021 | live-021 |
| live-022 | live-022 | live-022 | live-022 |
| live-023 | live-023 | live-023 | live-023 |
| live-024 | live-024 | live-024 | live-024 |
| live-025 | live-025 | live-025 | live-025 |
