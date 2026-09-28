import type { Fact, Question } from "./types";
export interface Brain {
  name: string;
  query(person_facts: Fact[], question: Question): Promise<string>;
  close?(): Promise<void>;
}
