import type { Brain } from "../interface";
import type { Fact, Question } from "../types";
// The floor: answers only what it was told, never predicts. Any real brain must beat this.
export const stubBrain: Brain = {
  name: "stub",
  async query(person_facts: Fact[], question: Question) {
    const hit = person_facts.find(f => f.field === question.field);
    if (hit) return hit.value;
    if (question.field === "portrait") return person_facts.filter(f => f.type === "fragments").map(f => f.value).join(" ");
    return "unknown";
  },
};
export default stubBrain;
