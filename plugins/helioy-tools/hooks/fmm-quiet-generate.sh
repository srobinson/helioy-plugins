#!/bin/sh
set -u

LOG_PATH="/tmp/helioy-tools-fmm-generate.log"

if ! command -v fmm >/dev/null 2>&1; then
  exit 0
fi

if ! command -v git >/dev/null 2>&1 || ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

if [ ! -f "./.fmm.db" ]; then
  exit 0
fi

if fmm validate >"$LOG_PATH" 2>&1; then
  exit 0
fi

fmm generate --quiet >>"$LOG_PATH" 2>&1 || true
