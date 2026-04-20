#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
cargo publish
rm -rf /tmp/claim-{{NAME}}
