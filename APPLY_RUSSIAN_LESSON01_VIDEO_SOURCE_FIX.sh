#!/usr/bin/env bash
set -euo pipefail
FILE="russian/lesson-01.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found"; exit 1; }
cp "$FILE" "$FILE.bak-video-source-fix"

python3 - <<'PY'
from pathlib import Path
import re
p=Path("russian/lesson-01.html")
s=p.read_text(encoding="utf-8")
OLD="6ee4616d623a1320bb9eb1b6a9e38105"
NEW="156d9960a794a410baeab5c9ef58e5bd"
s=s.replace(OLD,NEW)

pattern=r'<iframe id="ruleVideo"[^>]*></iframe>'
replacement='<iframe id="ruleVideo" src="https://rutube.ru/play/embed/'+NEW+'/" title="Что мы знаем о языке. Богатство и выразительность русского языка. Видеоурок 1. Русский язык, 5 класс" loading="eager" frameborder="0" allow="clipboard-write; autoplay; fullscreen; picture-in-picture" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
s,n=re.subn(pattern,replacement,s,count=1)
if n!=1: raise SystemExit("ERROR: ruleVideo iframe not found")

start="        const video=$('#ruleVideo');\n"
end="        if(stage===5)updateScore();"
a=s.find(start)
b=s.find(end,a)
if a!=-1 and b!=-1:
    s=s[:a]+s[b:]

p.write_text(s,encoding="utf-8")
PY

echo "=== CHECK ==="
python3 - <<'PY'
from pathlib import Path
s=Path("russian/lesson-01.html").read_text(encoding="utf-8")
checks={
 "new Rutube video": "156d9960a794a410baeab5c9ef58e5bd" in s,
 "old video removed": "6ee4616d623a1320bb9eb1b6a9e38105" not in s,
 "direct iframe": 'src="https://rutube.ru/play/embed/156d9960a794a410baeab5c9ef58e5bd/"' in s,
 "about blank removed": 'id="ruleVideo" src="about:blank"' not in s,
 "Topics button preserved": "← Темы" in s
}
for k,v in checks.items(): print(("OK  " if v else "FAIL"),k)
if not all(checks.values()): raise SystemExit("PATCH CHECK FAILED")
print("PATCH OK")
PY
