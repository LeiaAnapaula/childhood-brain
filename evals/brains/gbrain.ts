import { spawn, type Subprocess } from "bun";
import { hashSeed } from "../seed";
import type { Brain } from "../interface";
import type { Fact, Question } from "../types";

// Retrieval brain over the local gbrain MCP server (stdio). Facts are stored with `remember` under a
// per-person entity, then `recall` answers the question. gbrain does not predict; it retrieves, so
// held-out recall measures how much of a hidden fact is recoverable from what was stored.
const BIN = process.env.GBRAIN_BIN ?? `${process.env.HOME}/.bun/bin/gbrain`;

class McpClient {
  private proc: Subprocess<"pipe", "pipe", "pipe">;
  private id = 0;
  private pending = new Map<number, (v: any) => void>();
  private buf = "";
  constructor() {
    this.proc = spawn([BIN, "serve"], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
    this.pump();
  }
  private async pump() {
    const reader = this.proc.stdout.getReader();
    const dec = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      this.buf += dec.decode(value);
      let nl;
      while ((nl = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, nl).trim(); this.buf = this.buf.slice(nl + 1);
        if (!line.startsWith("{")) continue;
        try { const m = JSON.parse(line); if (m.id !== undefined && this.pending.has(m.id)) { this.pending.get(m.id)!(m); this.pending.delete(m.id); } } catch {}
      }
    }
  }
  send(method: string, params: any, wait = true): Promise<any> {
    const id = ++this.id;
    const msg = wait ? { jsonrpc: "2.0", id, method, params } : { jsonrpc: "2.0", method, params };
    this.proc.stdin.write(JSON.stringify(msg) + "\n"); this.proc.stdin.flush();
    if (!wait) return Promise.resolve(undefined);
    return new Promise((res, rej) => {
      const t = setTimeout(() => { this.pending.delete(id); rej(new Error(`gbrain ${method} timed out`)); }, 30000);
      this.pending.set(id, (v) => { clearTimeout(t); res(v); });
    });
  }
  async init() {
    await this.send("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "childhood-brain-evals", version: "0" } });
    await this.send("notifications/initialized", {}, false);
  }
  async call(name: string, args: any): Promise<string> {
    const r = await this.send("tools/call", { name, arguments: args });
    const c = r?.result?.content ?? [];
    return c.map((x: any) => x.text ?? "").join("\n");
  }
  close() { this.proc.kill(); }
}

export class GbrainBrain implements Brain {
  name = "gbrain";
  private client: McpClient | null = null;
  private stored = new Set<string>();
  private async c() { if (!this.client) { this.client = new McpClient(); await this.client.init(); } return this.client; }
  async query(person_facts: Fact[], question: Question): Promise<string> {
    const known = person_facts.find(f => f.field === question.field);
    if (known) return known.value;
    const c = await this.c();
    const entity = "eval-person-" + hashSeed(person_facts.map(f => `${f.field}=${f.value}`).sort().join("|")).toString(16);
    if (!this.stored.has(entity)) {
      for (const f of person_facts) await c.call("remember", { entity, fact: `${f.field}: ${f.value}`, kind: f.type, request_id: `${entity}-${f.field}` }).catch(() => {});
      this.stored.add(entity);
    }
    const text = await c.call("recall", { entity, query: `${question.field} ${question.text}`, limit: 5 }).catch(() => "");
    const line = text.split("\n").map(l => l.trim()).find(l => l.toLowerCase().startsWith(question.field + ":"));
    if (line) return line.slice(question.field.length + 1).trim();
    return "unknown";
  }
  async close() { this.client?.close(); }
}
export default new GbrainBrain();
