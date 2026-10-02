#!/usr/bin/env bash
set -euo pipefail
FILE="russian/lesson-01.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found"; exit 1; }

cp "$FILE" "$FILE.bak-working-video-pattern"

python3 - <<'PY'
from pathlib import Path
import re

p=Path("russian/lesson-01.html")
s=p.read_text(encoding="utf-8")

VIDEO_ID="16cbc702d77c6ec26aea0e403b23470f"
SRC=f"https://rutube.ru/play/embed/{VIDEO_ID}/"

# Find the RUTUBE iframe/source already placed in lesson 01 and normalize it
# to the exact working pattern used by the project's other lessons.
iframe_pat=r'<iframe\b([^>]*?rutube\.ru/(?:play/embed|video)/[^>]*?)></iframe>'
m=re.search(iframe_pat,s,re.I|re.S)

if m:
    old=m.group(0)
    title_m=re.search(r'\btitle=(["\'])(.*?)\1',old,re.I|re.S)
    title=(title_m.group(2) if title_m else
           "Русский язык. 5 класс. Урок 1. Богатство и выразительность русского языка")
    new=(f'<iframe src="{SRC}" '
         f'title="{title}" '
         f'allow="clipboard-write; autoplay; fullscreen; picture-in-picture" '
         f'allowfullscreen></iframe>')
    s=s[:m.start()]+new+s[m.end():]
else:
    # Fallback: replace the first iframe in the empty video area.
    m=re.search(r'<iframe\b[^>]*></iframe>',s,re.I|re.S)
    if not m:
        raise SystemExit("ERROR: iframe not found; file left unchanged")
    new=(f'<iframe src="{SRC}" '
         f'title="Русский язык. 5 класс. Урок 1. Богатство и выразительность русского языка" '
         f'allow="clipboard-write; autoplay; fullscreen; picture-in-picture" '
         f'allowfullscreen></iframe>')
    s=s[:m.start()]+new+s[m.end():]

p.write_text(s,encoding="utf-8")
PY

echo "=== CHECK ==="
grep -q 'https://rutube.ru/play/embed/16cbc702d77c6ec26aea0e403b23470f/' "$FILE"
echo "OK exact RUTUBE embed"
grep -q 'allow="clipboard-write; autoplay; fullscreen; picture-in-picture"' "$FILE"
echo "OK working allow pattern"
grep -q 'allowfullscreen' "$FILE"
echo "OK fullscreen"
echo "PATCH OK"
