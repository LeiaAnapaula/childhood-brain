export const FACT_TYPES = ["facts", "preferences", "fears", "stress", "fragments"] as const;
export type FactType = (typeof FACT_TYPES)[number];
export type Fact = { field: string; type: FactType; value: string };
export type Person = { id: string; name: string; bucket: string; consent: "synthetic" | "consented" | "public"; facts: Fact[] };
export type Question = { id: string; field: string; type: FactType; text: string };
export type Picks = { parent1: string; parent2: string; school: string; events: string[] };
