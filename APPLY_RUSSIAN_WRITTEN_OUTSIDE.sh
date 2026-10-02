#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
[ -f russian/index.html ] && cp russian/index.html "russian/index.html.bak-written-outside-$(date +%Y%m%d-%H%M%S)"
cp "$(dirname "$0")/russian/index.html" russian/index.html
echo "OK: topics unchanged; Written works moved outside topics panel."
