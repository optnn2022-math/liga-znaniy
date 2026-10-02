#!/usr/bin/env bash
set -euo pipefail
test -d russian || { echo "ERROR: run from repository root"; exit 1; }
cp russian/index.html russian/index.html.bak-written-card-layout 2>/dev/null || true
cp -f "$(dirname "$0")/russian/index.html" russian/index.html
echo "OK: Russian main page restored to single burgundy Written works card."
echo "The card opens written-works.html; internal hierarchy is unchanged."
