#!/usr/bin/env bash
set -euo pipefail
FILE="russian/lesson-01.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found"; exit 1; }
cp "$FILE" "$FILE.bak-video-lesson1"

python3 - <<'PY'
from pathlib import Path
import re

p=Path("russian/lesson-01.html")
s=p.read_text(encoding="utf-8")

# Verified direct RUTUBE video page:
video_id="16cbc702d77c6ec26aea0e403b23470f"
embed=f"https://rutube.ru/play/embed/{video_id}"

# Replace an existing RUTUBE embed first.
patterns=[
    r'https://rutube\.ru/play/embed/[A-Za-z0-9_-]+/?',
    r'https://rutube\.ru/video/[A-Za-z0-9_-]+/?',
]
changed=False
for pat in patterns:
    ns,n=re.subn(pat, embed, s, count=1)
    if n:
        s=ns; changed=True; break

# If the lesson currently has an empty/about:blank iframe, fill that.
if not changed:
    ns,n=re.subn(r'(<iframe\b[^>]*\bsrc=["\'])(?:about:blank)?(["\'])',
                 lambda m:m.group(1)+embed+m.group(2), s, count=1, flags=re.I)
    if n:
        s=ns; changed=True

# If iframe exists without src, add src.
if not changed:
    ns,n=re.subn(r'<iframe\b(?![^>]*\bsrc=)',
                 f'<iframe src="{embed}"', s, count=1, flags=re.I)
    if n:
        s=ns; changed=True

if not changed:
    raise SystemExit("ERROR: video iframe/source not found; no changes made")

p.write_text(s,encoding="utf-8")
print("OK video source:", embed)
PY

grep -q 'rutube.ru/play/embed/16cbc702d77c6ec26aea0e403b23470f' "$FILE"
echo "PATCH OK"
echo "Updated only: $FILE"
