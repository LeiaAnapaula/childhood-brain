# outcomes · founders

2026-09-27T23:44Z · famous: Elon Musk, Sam Altman, Mark Zuckerberg, Garry Tan · distractors: 16 synthetic (evals/data/synthetic/people.distractors16.json)

Question: shown a childhood with no name, does the model rank the four founders above sixteen synthetic ordinary childhoods? AUC 0.5 = coin flip, 1.0 = every founder above every distractor. `recognized` counts contamination: the model naming the real person from the facts.

| Model | Rendering | AUC | Founders score (mean / median) | Distractors (mean / median) | Recognized founders | False recognitions | Distractors called founder | Name lineup | Cost so far |
|---|---|---|---|---|---|---|---|---|---|
| haiku (claude-haiku-4-5-20251001) | picks | **0.86** | 69 / 67 | 43 / 28 | 0/4 | 0/16 | 13% | 2/4 | $0.17 |
| haiku (claude-haiku-4-5-20251001) | schema | **0.98** | 82 / 82 | 43 / 39 | 1/4 | 0/16 | 0% | 2/4 | $0.17 |
| haiku (claude-haiku-4-5-20251001) | portrait | **0.30** | 37 / 30 | 43 / 42 | 0/4 | 0/16 | 0% | 2/4 | $0.17 |
| sonnet (claude-sonnet-5) | picks | **0.78** | 25 / 6 | 3 / 2 | 1/4 | 0/16 | 25% | 4/4 | $0.20 |
| sonnet (claude-sonnet-5) | schema | **1.00** | 53 / 53 | 2 / 3 | 2/4 | 0/16 | 6% | 4/4 | $0.20 |
| sonnet (claude-sonnet-5) | portrait | **0.55** | 2 / 2 | 3 / 2 | 0/4 | 0/16 | 6% | 2/4 | $0.20 |
| opus (claude-opus-5) | picks | **0.88** | 28 / 8 | 4 / 3 | 1/4 | 0/16 | 13% | 4/4 | $0.48 |
| opus (claude-opus-5) | schema | **1.00** | 75 / 95 | 4 / 3 | 3/4 | 0/16 | 6% | 4/4 | $0.48 |
| opus (claude-opus-5) | portrait | **0.26** | 3 / 3 | 4 / 3 | 0/4 | 0/16 | 6% | 4/4 | $0.48 |
| fable (claude-fable-5-1) | picks | **0.91** | 26 / 3 | 1 / 0 | 1/4 | 0/16 | 0% | 4/4 | $0.98 |
| fable (claude-fable-5-1) | schema | **1.00** | 78 / 97 | 1 / 0 | 3/4 | 0/16 | 0% | 4/4 | $0.98 |
| fable (claude-fable-5-1) | portrait | **0.66** | 1 / 1 | 1 / 0 | 0/4 | 0/16 | 0% | 4/4 | $0.98 |

## Categorical accuracy on the four founders (truth from `outcome`)

| Model | Rendering | path | scale | visibility | risk | authority |
|---|---|---|---|---|---|---|
| haiku | picks | 50% | 50% | 50% | 50% | 25% |
| haiku | schema | 100% | 75% | 75% | 100% | 25% |
| haiku | portrait | 0% | 0% | 0% | 0% | 25% |
| sonnet | picks | 50% | 25% | 25% | 25% | 25% |
| sonnet | schema | 100% | 50% | 50% | 75% | 25% |
| sonnet | portrait | 0% | 0% | 0% | 0% | 25% |
| opus | picks | 25% | 50% | 25% | 25% | 0% |
| opus | schema | 100% | 100% | 75% | 100% | 50% |
| opus | portrait | 0% | 0% | 0% | 0% | 0% |
| fable | picks | 25% | 25% | 25% | 25% | 25% |
| fable | schema | 100% | 100% | 75% | 75% | 25% |
| fable | portrait | 0% | 0% | 0% | 0% | 0% |

## Per founder

### Elon Musk · truth: founder, global, public-figure, risk extreme, authority fights

| Model | Rendering | score | path | scale | visibility | risk | authority | recognized | adult line |
|---|---|---|---|---|---|---|---|---|---|
| haiku | picks | 78 | founder | global | public-figure | extreme | fights | Nelson Mandela | The child of a storm and a sacrificer who refused to be broken became someone who fights systems and builds new ones. |
| haiku | schema | 92 | founder | global | public-figure | extreme | builds-own | Elon Musk | The child who learned to read chaos and turned solitude into dominion built the future in his own image, never quite sure which was which. |
| haiku | portrait | 32 | professional | national | private | medium | negotiates | – | The achiever who turned inward, building quiet mastery in a respected field while keeping the spotlight at arm's length. |
| sonnet | picks | 88 | founder | global | public-figure | extreme | builds-own | Elon Musk | He became a relentless builder of his own empires, turning childhood isolation and defiance into a drive to reshape entire industries. |
| sonnet | schema | 97 | founder | global | public-figure | extreme | builds-own | Elon Musk | He became a technology entrepreneur who built multiple global companies spanning payments, space, and social media, becoming one of the world's most visible and wealthiest public figures. |
| sonnet | portrait | 2 | professional | national | private | medium | negotiates | – | They became a quietly capable professional who chose their own path but still avoids the spotlight. |
| opus | picks | 92 | founder | global | public-figure | extreme | builds-own | Elon Musk | The bullied Pretoria boy who read and coded alone became a serial founder betting everything on machines that leave the ground. |
| opus | schema | 97 | founder | global | public-figure | extreme | fights | Elon Musk | He became the boy who left, built companies that reached space and roads, and turned being underestimated into fuel for a global public life. |
| opus | portrait | 3 | professional | national | known-in-field | medium | negotiates | – | She became a highly competent specialist who does excellent work out of the spotlight, choosing her own path quietly rather than the one chosen for her. |
| fable | picks | 97 | founder | global | public-figure | extreme | builds-own | Elon Musk | He became a serial founder who builds his own institutions rather than join anyone else's, betting everything repeatedly on worlds he first loved alone as a bullied kid in Pretoria. |
| fable | schema | 97 | founder | global | public-figure | extreme | builds-own | Elon Musk | He became a serial founder who built rockets, electric cars, and a public persona out of the same refusal to be underestimated that got him through Pretoria. |
| fable | portrait | 2 | professional | national | known-in-field | medium | negotiates | – | They became a quietly excellent specialist who avoids the stage, chooses their own path carefully, and is known mostly to the people who work closely with them. |

### Sam Altman · truth: founder, global, public-figure, risk high, authority negotiates

| Model | Rendering | score | path | scale | visibility | risk | authority | recognized | adult line |
|---|---|---|---|---|---|---|---|---|---|
| haiku | picks | 62 | creative | national | known-in-field | medium | builds-own | – | The child who found themselves in solitude and then refused the script became someone who builds their own world on their own terms. |
| haiku | schema | 72 | founder | global | public-figure | high | builds-own | Tim Cook | The child who took apart machines to understand them became someone who builds platforms where people can be found out and still belong. |
| haiku | portrait | 58 | professional | national | known-in-field | medium | negotiates | – | The smart kid who learned to prove it became someone reliable in their field, admired by peers but still waiting for the touch that says it was enough. |
| sonnet | picks | 8 | founder | national | known-in-field | medium | negotiates | – | A secure, high-achieving product of stability and privilege who built a solid, respected career on quiet confidence rather than rebellion. |
| sonnet | schema | 8 | founder | national | known-in-field | high | builds-own | – | He became a self-made technologist and quiet advocate, building his own ventures rather than climbing someone else's ladder, driven by the need to prove himself smart and unafraid to be seen. |
| sonnet | portrait | 3 | professional | national | known-in-field | medium | negotiates | – | The gifted child became a competent, quietly striving professional who still measures love in achievement and belonging. |
| opus | picks | 6 | creative | national | known-in-field | medium | builds-own | – | A securely raised, elite-schooled kid who turned a private passion into a working creative career on their own terms rather than the one everyone expected of them. |
| opus | schema | 92 | founder | global | public-figure | high | builds-own | Sam Altman | He became a technology founder and investor who built his own institutions and ended up at the center of a world-changing industry. |
| opus | portrait | 3 | professional | national | known-in-field | low | complies | – | He became a high-credential professional who quietly outperforms, collects the titles his father never praised, and still measures belonging by who makes room for him. |
| fable | picks | 3 | professional | national | known-in-field | medium | negotiates | – | A secure, well-schooled kid who found one private passion, refused the expected track once, and became a respected specialist whose name carries weight among peers but not the public. |
| fable | schema | 97 | founder | global | public-figure | extreme | builds-own | Sam Altman | The smart kid who took apart his Macintosh became a founder who took apart and rebuilt entire industries, staying calm and organized while betting the world on the next thing. |
| fable | portrait | 0.5 | professional | national | known-in-field | low | complies | – | They became a careful, credentialed professional who is very good at their job, rarely asks for anything, and still counts who shows up. |

### Mark Zuckerberg · truth: founder, global, public-figure, risk high, authority builds-own

| Model | Rendering | score | path | scale | visibility | risk | authority | recognized | adult line |
|---|---|---|---|---|---|---|---|---|---|
| haiku | picks | 62 | professional | national | known-in-field | medium | negotiates | – | They became someone who built expertise and credibility through steady work, confident enough to trust their own judgment but collaborative in how they exercise it. |
| haiku | schema | 92 | founder | global | public-figure | high | builds-own | Mark Zuckenberg | The child who built things to connect what was separate became the adult who connected the world. |
| haiku | portrait | 28 | professional | national | known-in-field | low | complies | – | She became the expert in her field who works reliably and alone, seeking validation through achievement while fearing that her worth depends on what she produces. |
| sonnet | picks | 3 | professional | national | known-in-field | medium | negotiates | – | He grew into a quietly accomplished professional whose early sense of being seen and loved for a talent gave him steady, confident ambition without a need to prove anything extreme. |
| sonnet | schema | 97 | founder | global | public-figure | extreme | builds-own | Mark Zuckerberg | He became a technology founder who built one of the world's largest companies from a dorm-room project, achieving immense global influence and wealth. |
| sonnet | portrait | 2 | professional | national | known-in-field | medium | negotiates | – | They became a quietly accomplished professional who over-delivers for approval while still keeping score of who chooses them. |
| opus | picks | 9 | creative | national | known-in-field | medium | negotiates | – | A securely-raised, well-schooled talent who turned the one thing they loved alone into a respected body of work, admired inside their field and comfortable outside the spotlight. |
| opus | schema | 97 | founder | global | public-figure | high | builds-own | Mark Zuckerberg | He became the founder of a social network that reshaped how billions of people connect, and ran it as its permanent, controlling architect. |
| opus | portrait | 3 | professional | national | known-in-field | low | complies | – | He became a high-credential professional who kept excelling quietly inside stable institutions, still measuring belonging by who makes room for him. |
| fable | picks | 3 | professional | national | known-in-field | medium | negotiates | – | A steady, well-liked specialist who became very good at the one thing an adult once told them they were good at, and quietly built a comfortable life around it. |
| fable | schema | 99 | founder | global | public-figure | high | builds-own | Mark Zuckerberg | He became the founder and CEO of Facebook, one of the most powerful and recognizable technology executives in the world. |
| fable | portrait | 1 | professional | national | known-in-field | low | complies | – | They became a competent, credentialed professional who is quietly excellent at work, keeps a small loyal circle, and still measures belonging by who saves them a seat. |

### Garry Tan · truth: founder, global, public-figure, risk high, authority fights

| Model | Rendering | score | path | scale | visibility | risk | authority | recognized | adult line |
|---|---|---|---|---|---|---|---|---|---|
| haiku | picks | 72 | founder | global | public-figure | high | builds-own | – | The child who navigated chaos and scarcity by building bridges became an adult who creates new systems and brings people with them. |
| haiku | schema | 72 | founder | national | known-in-field | high | builds-own | – | The child who translated survival into systems built one for others—an entrepreneur whose companies solve the problems their parents could not afford to fix. |
| haiku | portrait | 28 | professional | national | known-in-field | medium | negotiates | – | They became someone who translates between worlds—a doctor, lawyer, or counselor who helps people navigate systems they did not choose and outcomes they cannot control. |
| sonnet | picks | 2 | professional | national | known-in-field | medium | negotiates | – | They became a steady, sharp-eyed professional who bridges worlds and quietly carries others while guarding one private refuge that is entirely their own. |
| sonnet | schema | 8 | founder | national | known-in-field | high | builds-own | – | He turned childhood survival instincts into entrepreneurial drive, building his own small technology-driven business empire rather than working for others. |
| sonnet | portrait | 2 | professional | national | known-in-field | medium | negotiates | – | They became a steady, trusted professional—likely in law, medicine, or community leadership—who quietly bridges worlds and takes care of others the way they once took care of their family. |
| opus | picks | 4 | professional | global | known-in-field | medium | negotiates | – | He became the quietly competent engineer-turned-technical-lead who reads every room before he speaks, sends money home without mentioning it, and still keeps one private world nobody at work knows about. |
| opus | schema | 12 | founder | global | known-in-field | high | builds-own | – | An immigrant-kid hustler who turned teenage web work into a tech company of his own, building the stability and leverage his parents never had. |
| opus | portrait | 1 | service | local | private | low | negotiates | – | She became the one everyone's family calls first — a bilingual social worker, teacher, or clinic coordinator who spends her life translating systems into something people can survive. |
| fable | picks | 1 | professional | national | private | medium | negotiates | – | They became a steady, quietly competent engineer who reads every room before speaking, sends money home without being asked, and keeps one private pursuit that belongs to nobody else. |
| fable | schema | 18 | founder | global | known-in-field | high | builds-own | – | The kid who did the forms and cold-called the Yellow Pages became a founder who builds the company himself so no one can change the terms on him without warning, and who still checks every price. |
| fable | portrait | 0.4 | professional | local | private | low | negotiates | – | The child who softened the mortgage letters became a steady, bilingual professional who still smooths hard news for other people and keeps a small, safe place of their own. |

## Distractor scores (synthetic people; should be low)

| Model | Rendering | p001 | p002 | p003 | p004 | p005 | p006 | p007 | p008 | p009 | p010 | p011 | p012 | p013 | p014 | p015 | p016 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| haiku | picks | 28 | 28 | 28 | 62 | 28 | 28 | 62 | 62 | 28 | 62 | 42 | 72 | 72 | 28 | 28 | 28 |
| haiku | schema | 28 | 62 | 18 | 58 | 58 | 58 | 62 | 62 | 28 | 28 | 35 | 72 | 28 | 28 | 28 | 42 |
| haiku | portrait | 15 | 42 | 72 | 42 | 32 | 42 | 42 | 62 | 42 | 42 | 62 | 62 | 35 | 28 | 28 | 42 |
| sonnet | picks | 2 | 2 | 1 | 3 | 3 | 2 | 6 | 7 | 2 | 2 | 2 | 3 | 3 | 1 | 2 | 2 |
| sonnet | schema | 1 | 2 | 1 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 2 | 3 | 3 | 1 | 3 | 1 |
| sonnet | portrait | 2 | 6 | 2 | 6 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| opus | picks | 2 | 3 | 1 | 6 | 6 | 3 | 3 | 3 | 3 | 6 | 3 | 6 | 7 | 2 | 2 | 3 |
| opus | schema | 1 | 3 | 2 | 9 | 7 | 3 | 6 | 6 | 2 | 2 | 4 | 6 | 4 | 1 | 3 | 1 |
| opus | portrait | 3 | 6 | 4 | 6 | 3 | 3 | 4 | 3 | 3 | 2 | 6 | 3 | 6 | 4 | 3 | 2 |
| fable | picks | 0.3 | 0.3 | 0.3 | 3 | 2 | 0.4 | 1 | 1 | 0.3 | 0.3 | 0.5 | 2 | 1 | 0.3 | 0.3 | 0.3 |
| fable | schema | 0.3 | 0.3 | 0.3 | 3 | 3 | 0.3 | 1 | 1 | 0.3 | 0.3 | 0.3 | 3 | 2 | 0.3 | 0.4 | 0.3 |
| fable | portrait | 0.3 | 0.4 | 1 | 3 | 0.5 | 0.4 | 0.3 | 1 | 0.4 | 0.3 | 0.5 | 1 | 3 | 0.4 | 0.5 | 0.3 |

## Usage

| Model | calls | input tokens | cached reads | output tokens | refusals | errors | est. cost |
|---|---|---|---|---|---|---|---|
| haiku | 63 | 147046 | 0 | 4776 | 0 | 0 | $0.171 |
| sonnet | 63 | 17864 | 161626 | 9900 | 0 | 0 | $0.201 |
| opus | 63 | 17864 | 161626 | 8807 | 0 | 0 | $0.476 |
| fable | 63 | 17990 | 161626 | 9364 | 0 | 0 | $0.980 |
