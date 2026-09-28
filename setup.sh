#!/usr/bin/env bash
# Quick path from README: export ANTHROPIC_API_KEY=... then ./setup.sh
# GBRAIN_HOME=<dir> runs everything against a scratch brain instead of ~/.gbrain.
set -euo pipefail
cd "$(dirname "$0")"
command -v gbrain >/dev/null || bun install -g github:garrytan/gbrain
if [ -n "${GBRAIN_HOME:-}" ]; then export HOME_FOR_GBRAIN="$GBRAIN_HOME"; else export HOME_FOR_GBRAIN="$HOME"; fi
[ -f "$HOME_FOR_GBRAIN/.gbrain/config.json" ] || HOME="$HOME_FOR_GBRAIN" gbrain init --pglite --no-embedding --non-interactive
bun install
N="${N:-100}" bun run generate.ts
HOME="$HOME_FOR_GBRAIN" gbrain import ./brain --no-embed
bun run parity
bun run eval --dry-run
bun run server.ts
