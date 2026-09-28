import { REPERTOIRE, SEEDS } from "../evals/brains/prototype-data";
const html = await Bun.file("prototype/which-childhood-is-yours.html").text();
const grab = (name: string, close: string) => { const s = html.indexOf(`const ${name} =`); const e = html.indexOf(close, s) + close.length; return html.slice(s, e); };
const S = new Function(grab("SEEDS", "\n};") + "; return SEEDS;")();
const R = new Function(grab("REPERTOIRE", "\n];") + "; return REPERTOIRE;")();
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const ok = same(S, SEEDS) && same(R.map((c: any) => ({ links: c.links, text: c.text })), REPERTOIRE.map(c => ({ links: c.links, text: c.text })));
console.log(ok ? "parity OK: prototype HTML and evals/brains/prototype-data.ts agree" : "PARITY BROKEN: re-run scripts/extract-prototype.ts");
process.exit(ok ? 0 : 1);
