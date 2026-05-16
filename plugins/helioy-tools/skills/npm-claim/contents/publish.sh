#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm login
npm publish --access public
rm -rf ~/.name-claim/{{NAME}}
