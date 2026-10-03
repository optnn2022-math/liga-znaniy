#!/usr/bin/env bash
set -e

IMG="russian/assets/written-works-hero.png"

if [ ! -f "$IMG" ]; then
  echo "ERROR: $IMG not found. Run this script from the project root after copying the russian folder from this package."
  exit 1
fi

# Find the Russian subject page and replace the image used in the "Письменные работы" card.
python3 - <<'PY'
from pathlib import Path
import re

candidates = [
    Path("russian/index.html"),
    Path("russian_index_fixed.html"),
]

target = next((p for p in candidates if p.exists()), None)
if target is None:
    raise SystemExit("ERROR: Russian subject page not found.")

text = target.read_text(encoding="utf-8")
original = text

# Locate a reasonable window around the written-works card.
m = re.search(r"Письменные работы", text, flags=re.I)
if not m:
    raise SystemExit(f"ERROR: 'Письменные работы' block not found in {target}")

start = max(0, m.start() - 2500)
end = min(len(text), m.end() + 2500)
chunk = text[start:end]

# Prefer replacing an <img src=...> in this card only.
img = re.search(r'(<img\b[^>]*\bsrc=["\'])([^"\']+)(["\'][^>]*>)', chunk, flags=re.I)
if not img:
    # Also support CSS background-image:url(...)
    bg = re.search(r'(background-image\s*:\s*url\(\s*["\']?)([^)"\']+)(["\']?\s*\))', chunk, flags=re.I)
    if not bg:
        raise SystemExit("ERROR: Image reference near 'Письменные работы' was not found.")
    chunk = chunk[:bg.start(2)] + "assets/written-works-hero.png" + chunk[bg.end(2):]
else:
    chunk = chunk[:img.start(2)] + "assets/written-works-hero.png" + chunk[img.end(2):]

text = text[:start] + chunk + text[end:]

if text == original:
    raise SystemExit("ERROR: No HTML changes made.")

target.write_text(text, encoding="utf-8")
print("OK: updated", target)
print("OK: image -> assets/written-works-hero.png")
PY

echo
echo "Files prepared. Review the page, then publish with:"
echo 'git add russian/assets/written-works-hero.png russian/index.html russian_index_fixed.html 2>/dev/null || true'
echo 'git commit -m "Update Russian written works image"'
echo 'git push'
