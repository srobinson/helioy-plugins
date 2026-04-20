#!/bin/sh
set -u

LOG_PATH="/tmp/helioy-tools-fmm-generate.log"
INPUT="$(cat 2>/dev/null || true)"

if ! command -v fmm >/dev/null 2>&1; then
  exit 0
fi

FILE=""
if command -v jq >/dev/null 2>&1 && [ -n "$INPUT" ]; then
  FILE="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"
fi

if [ -n "$FILE" ] && [ -f "$FILE" ]; then
  fmm generate "$FILE" >"$LOG_PATH" 2>&1 || true
  exit 0
fi

if [ ! -f "./.fmm.db" ]; then
  exit 0
fi

if fmm validate >"$LOG_PATH" 2>&1; then
  exit 0
fi

fmm generate >>"$LOG_PATH" 2>&1 || true
