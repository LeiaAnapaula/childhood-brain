# childhood-brain eval results

Newest run first. JSON per run sits next to this file.

## llm-fable.d16

brain: **llm:fable** · people: 16 · seed: 7 · 2026-09-28T00:11Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 41.7% (40/96) | 14.6% base rate | +27.1 pts |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 48.0% | 12.0% | +36.0 pts |
| preferences | 8 | 37.5% | 12.5% | +25.0 pts |
| fears | 10 | 80.0% | 30.0% | +50.0 pts |
| stress | 10 | 20.0% | 10.0% | +10.0 pts |
| fragments | 18 | 16.7% | 16.7% | +0.0 pts |

Weakest fact type: **fragments** (16.7% accuracy, +0.0 pts over base rate).

## llm-opus.d16

brain: **llm:opus** · people: 16 · seed: 7 · 2026-09-28T00:05Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 35.4% (34/96) | 14.6% base rate | +20.8 pts |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 48.0% | 12.0% | +36.0 pts |
| preferences | 8 | 25.0% | 12.5% | +12.5 pts |
| fears | 10 | 40.0% | 30.0% | +10.0 pts |
| stress | 10 | 40.0% | 10.0% | +30.0 pts |
| fragments | 18 | 0.0% | 16.7% | -16.7 pts |

Weakest fact type: **fragments** (0.0% accuracy, -16.7 pts over base rate).

## llm-sonnet.d16

brain: **llm:sonnet** · people: 16 · seed: 7 · 2026-09-28T00:01Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 28.1% (27/96) | 14.6% base rate | +13.5 pts |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 36.0% | 12.0% | +24.0 pts |
| preferences | 8 | 25.0% | 12.5% | +12.5 pts |
| fears | 10 | 40.0% | 30.0% | +10.0 pts |
| stress | 10 | 30.0% | 10.0% | +20.0 pts |
| fragments | 18 | 0.0% | 16.7% | -16.7 pts |

Weakest fact type: **fragments** (0.0% accuracy, -16.7 pts over base rate).

## llm-haiku.d16

brain: **llm:haiku** · people: 16 · seed: 7 · 2026-09-27T23:58Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 27.1% (26/96) | 14.6% base rate | +12.5 pts |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 30.0% | 12.0% | +18.0 pts |
| preferences | 8 | 25.0% | 12.5% | +12.5 pts |
| fears | 10 | 50.0% | 30.0% | +20.0 pts |
| stress | 10 | 40.0% | 10.0% | +30.0 pts |
| fragments | 18 | 0.0% | 16.7% | -16.7 pts |

Weakest fact type: **fragments** (0.0% accuracy, -16.7 pts over base rate).

## llm.founders

brain: **llm:opus** · people: 4 · seed: 7 · 2026-09-27T23:57Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 33.3% (8/24) | 25.0% base rate | +8.3 pts |
| self_recognition | 100.0% picked own (4/4, simulated) · felt 4.75/5 | 20% chance | +80.0 pts |
| consistency | 89.6% agreement · 15 contradictions | – | – |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 12 | 50.0% | 33.3% | +16.7 pts |
| preferences | 2 | 0.0% | 50.0% | -50.0 pts |
| fears | 2 | 50.0% | 0.0% | +50.0 pts |
| stress | 3 | 33.3% | 33.3% | +0.0 pts |
| fragments | 5 | 0.0% | 0.0% | +0.0 pts |

Weakest fact type: **preferences** (0.0% accuracy, -50.0 pts over base rate).

self_recognition answers are SIMULATED (word overlap with the person's own fragments). Real numbers need humans: `bun run lineup`.

## stub.d16

brain: **stub** · people: 16 · seed: 7 · 2026-09-27T23:57Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 0.0% (0/96) | 14.6% base rate | -14.6 pts |
| consistency | 100.0% agreement · 0 contradictions | – | – |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 0.0% | 12.0% | -12.0 pts |
| preferences | 8 | 0.0% | 12.5% | -12.5 pts |
| fears | 10 | 0.0% | 30.0% | -30.0 pts |
| stress | 10 | 0.0% | 10.0% | -10.0 pts |
| fragments | 18 | 0.0% | 16.7% | -16.7 pts |

Weakest fact type: **fears** (0.0% accuracy, -30.0 pts over base rate).

## prototype.d16

brain: **prototype** · people: 16 · seed: 7 · 2026-09-27T23:57Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 33.3% (32/96) | 14.6% base rate | +18.7 pts |
| consistency | 100.0% agreement · 0 contradictions | – | – |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 50 | 4.0% | 12.0% | -8.0 pts |
| preferences | 8 | 62.5% | 12.5% | +50.0 pts |
| fears | 10 | 60.0% | 30.0% | +30.0 pts |
| stress | 10 | 60.0% | 10.0% | +50.0 pts |
| fragments | 18 | 72.2% | 16.7% | +55.6 pts |

Weakest fact type: **facts** (4.0% accuracy, -8.0 pts over base rate).

## prototype.founders

brain: **prototype** · people: 4 · seed: 7 · 2026-09-27T23:42Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 8.3% (2/24) | 25.0% base rate | -16.7 pts |
| self_recognition | 0.0% picked own (0/4, simulated) · felt 3.00/5 | 20% chance | -20.0 pts |
| consistency | 100.0% agreement · 0 contradictions | – | – |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 12 | 8.3% | 33.3% | -25.0 pts |
| preferences | 2 | 50.0% | 50.0% | +0.0 pts |
| fears | 2 | 0.0% | 0.0% | +0.0 pts |
| stress | 3 | 0.0% | 33.3% | -33.3 pts |
| fragments | 5 | 0.0% | 0.0% | +0.0 pts |

Weakest fact type: **stress** (0.0% accuracy, -33.3 pts over base rate).

self_recognition answers are SIMULATED (word overlap with the person's own fragments). Real numbers need humans: `bun run lineup`.

## toy

brain: **prototype** · people: 5 · seed: 7 · 2026-09-27T23:34Z

| Eval | Score | Baseline / chance | Lift |
|---|---|---|---|
| held_out_recall (headline) | 26.7% (8/30) | 6.7% base rate | +20.0 pts |
| self_recognition | 20.0% picked own (1/5, simulated) · felt 2.00/5 | 20% chance | +0.0 pts |
| consistency | 100.0% agreement · 0 contradictions | – | – |

held_out_recall by fact type:

| Type | n | Brain | Baseline | Lift |
|---|---|---|---|---|
| facts | 17 | 5.9% | 11.8% | -5.9 pts |
| preferences | 2 | 100.0% | 0.0% | +100.0 pts |
| fears | 4 | 50.0% | 0.0% | +50.0 pts |
| stress | 2 | 50.0% | 0.0% | +50.0 pts |
| fragments | 5 | 40.0% | 0.0% | +40.0 pts |

Weakest fact type: **facts** (5.9% accuracy, -5.9 pts over base rate).

self_recognition answers are SIMULATED (word overlap with the person's own fragments). Real numbers need humans: `bun run lineup`.
