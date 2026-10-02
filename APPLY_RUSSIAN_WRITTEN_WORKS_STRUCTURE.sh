#!/usr/bin/env bash
set -euo pipefail
echo "=== Russian written works structure patch ==="
test -d russian || { echo "ERROR: run from repository root"; exit 1; }
cp russian/index.html "russian/index.html.bak-written-works" 2>/dev/null || true
cp -f "$(dirname "$0")/russian/index.html" russian/index.html
cp -f "$(dirname "$0")/russian/written-works.html" russian/written-works.html
echo "OK: main Russian page preserved; Written works now opens hierarchy page."
echo "Route: Russian -> Written works -> Dictations / Expositions / Essays -> topic -> work."
