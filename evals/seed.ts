export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export type Rng = {
  next(): number;
  int(n: number): number;
  pick<T>(a: readonly T[]): T;
  shuffle<T>(a: readonly T[]): T[];
  sample<T>(a: readonly T[], k: number): T[];
  split<T>(a: readonly T[], frac: number): [T[], T[]];
};
export function rng(seed: number | string): Rng {
  let a = typeof seed === "string" ? hashSeed(seed) : seed >>> 0;
  const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (n: number) => Math.floor(next() * n);
  const shuffle = <T,>(arr: readonly T[]) => { const b = [...arr]; for (let i = b.length - 1; i > 0; i--) { const j = int(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return {
    next, int,
    pick: (arr) => arr[int(arr.length)],
    shuffle,
    sample: (arr, k) => shuffle(arr).slice(0, k),
    split: (arr, frac) => { const s = shuffle(arr); const n = Math.max(1, Math.round(s.length * frac)); return [s.slice(0, n), s.slice(n)]; },
  };
}
