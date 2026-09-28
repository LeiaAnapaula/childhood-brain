// bun run reset  -> clears brain/people/ and re-imports ./brain into gbrain (honors GBRAIN_HOME). One command between demo takes.
import { rmSync, mkdirSync } from "node:fs";
const GBRAIN = process.env.GBRAIN_BIN ?? `${process.env.HOME}/.bun/bin/gbrain`;
const env = process.env.GBRAIN_HOME ? { ...process.env, HOME: process.env.GBRAIN_HOME } : process.env;
rmSync("brain/people", { recursive: true, force: true }); mkdirSync("brain/people", { recursive: true });
const p = Bun.spawn([GBRAIN, "import", "./brain", "--no-embed"], { env, stdout: "inherit", stderr: "inherit" }); await p.exited;
console.log(`reset: brain/people/ cleared, ./brain re-imported (${process.env.GBRAIN_HOME ?? "live brain"})`);
