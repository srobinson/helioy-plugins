#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m pip install --quiet --upgrade build twine
python3 -m build
python3 -m twine upload dist/*
rm -rf ~/.name-claim/{{NAME}}
