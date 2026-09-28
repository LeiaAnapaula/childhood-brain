import type { Brain } from "../interface";
import prototype from "./prototype";
import stub from "./stub";

export const DEFAULT_BRAIN = "prototype";
const REGISTRY: Record<string, () => Promise<Brain>> = {
  prototype: async () => prototype,
  stub: async () => stub,
  gbrain: async () => (await import("./gbrain")).default,
  llm: async () => (await import("./llm")).default,
};
// --brain prototype | stub | gbrain | ./path/to/module.ts (default export or `brain` export implementing Brain)
export async function loadBrain(name: string = DEFAULT_BRAIN): Promise<Brain> {
  if (REGISTRY[name]) return REGISTRY[name]();
  if (name.includes("/") || name.endsWith(".ts") || name.endsWith(".js")) {
    const m = await import(name.startsWith("/") ? name : `${process.cwd()}/${name}`);
    const b: Brain = m.default ?? m.brain;
    if (!b || typeof b.query !== "function") throw new Error(`${name} does not export a Brain`);
    return b;
  }
  throw new Error(`unknown brain "${name}"; use ${Object.keys(REGISTRY).join(", ")} or a module path`);
}
export const BRAIN_NAMES = Object.keys(REGISTRY);
