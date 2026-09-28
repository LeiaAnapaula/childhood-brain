// bun run server.ts  -> http://localhost:3000
// Serves the quiz, answers /api/search through gbrain, writes person pages to brain/people/ and re-imports.
// GBRAIN_HOME=<dir> points every gbrain call at a scratch brain (a HOME with its own ~/.gbrain); unset = your live brain.
import { $ } from "bun";
const PORT = Number(process.env.PORT ?? 3000);
const GBRAIN = process.env.GBRAIN_BIN ?? `${process.env.HOME}/.bun/bin/gbrain`;
const ENV = process.env.GBRAIN_HOME ? { ...process.env, HOME: process.env.GBRAIN_HOME } : process.env;
export const SYNC_CMD = [GBRAIN, "import", "./brain", "--no-embed"];
export const QUERY_CMD = (q: string) => [GBRAIN, "search", q, "--json", "--limit", "5"];
const run = async (cmd: string[]) => { const p = Bun.spawn(cmd, { env: ENV, stdout: "pipe", stderr: "pipe" }); const [out, err] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]); await p.exited; return { out, err, code: p.exitCode }; };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "you";
type Hit = { slug: string; title: string; text: string };
function pickHits(v: any, acc: Hit[] = []): Hit[] {
  if (Array.isArray(v)) { v.forEach(x => pickHits(x, acc)); return acc; }
  if (v && typeof v === "object") {
    const slug = v.slug ?? v.page_slug ?? v.id;
    const text = v.chunk_text ?? v.content ?? v.text ?? v.snippet ?? v.body;
    if (typeof slug === "string" && typeof text === "string") acc.push({ slug, title: v.title ?? slug, text });
    else Object.values(v).forEach(x => pickHits(x, acc));
  }
  return acc;
}
const fragmentOf = (text: string) => { const m = text.match(/## Fragment\s+([\s\S]*?)(\n## |\s*$)/); return (m ? m[1] : text).trim(); };
const isChildhood = (h: Hit) => h.slug.startsWith("childhoods/");

export async function search(q: string) {
  const { out, err } = await run(QUERY_CMD(q));
  let hits: Hit[] = [];
  try { hits = pickHits(JSON.parse(out)); } catch {}
  const seen = new Set<string>();
  hits = hits.filter(isChildhood).filter(h => !seen.has(h.slug) && seen.add(h.slug)).map(h => ({ ...h, text: fragmentOf(h.text) }));
  return { results: hits, raw: hits.length ? undefined : (out || err).slice(0, 2000) };
}

export function personPage(p: { name: string; city: string; picks: { kind: string; slug: string; name: string; who?: string }[]; childhood?: string; fragment?: string; money?: string; social?: string }) {
  return `---
type: person
title: ${p.name}
city: ${p.city}
---
# ${p.name}

Nearest childhood: ${p.childhood ? `[[childhoods/${p.childhood}]]` : "none found"}

## Adapter
${p.picks.map(k => `- [[${k.kind}/${k.slug}]] ${k.name}${k.who ? ": " + k.who : ""}`).join("\n")}
${p.money ? `\n## Money story\n${p.money}\n` : ""}${p.social ? `\n## Social story\n${p.social}\n` : ""}${p.fragment ? `\n## Fragment\n${p.fragment}\n` : ""}`;
}

// Coalesce imports: a page saved while an import is running would otherwise never be imported (the old
// `syncing ??=` returned the in-flight promise and nothing followed). Now one more import runs after the current one.
let syncing: Promise<unknown> | null = null, syncAgain = false;
const sync = (): Promise<unknown> => {
  if (syncing) { syncAgain = true; return syncing; }
  syncing = run(SYNC_CMD).then(r => { if (r.code !== 0) console.error(`[sync] gbrain import exited ${r.code}: ${(r.err || r.out).slice(0, 300)}`); return r; })
    .finally(() => { syncing = null; if (syncAgain) { syncAgain = false; sync(); } });
  return syncing;
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") { const f = Bun.file("index.html"); if (!(await f.exists())) return new Response("index.html missing: run `bun run scripts/wire-prototype.ts`", { status: 500 }); return new Response(f, { headers: { "content-type": "text/html; charset=utf-8" } }); }
    if (url.pathname === "/api/search") return Response.json(await search(url.searchParams.get("q") ?? ""));
    if (url.pathname === "/api/person" && req.method === "POST") {
      const p = await req.json().catch(() => null);
      if (!p || typeof p.name !== "string" || !p.name.trim() || !Array.isArray(p.picks)) return Response.json({ error: "name (string) and picks (array) are required" }, { status: 400 });
      p.picks = p.picks.filter((k: any) => k && typeof k.slug === "string" && /^[a-z0-9-]+$/.test(k.slug) && ["parents", "schools", "events"].includes(k.kind));
      if (typeof p.childhood === "string" && !/^[a-z0-9-]+$/.test(p.childhood)) delete p.childhood;
      const path = `brain/people/person-${slugify(p.name)}.md`;
      await Bun.write(path, personPage(p));
      sync();
      return Response.json({ path });
    }
    if (url.pathname === "/api/reset" && req.method === "POST") { await reset(); return Response.json({ ok: true }); }
    if (url.pathname === "/api/health") return Response.json({ ok: true, brain: process.env.GBRAIN_HOME ?? "live" });
    return new Response("not found", { status: 404 });
  },
});
export async function reset() { const { rmSync, mkdirSync } = await import("node:fs"); rmSync("brain/people", { recursive: true, force: true }); mkdirSync("brain/people", { recursive: true }); await run(SYNC_CMD); }
console.log(`childhood-brain on http://localhost:${PORT} (brain: ${process.env.GBRAIN_HOME ?? "live ~/.gbrain"})`);
