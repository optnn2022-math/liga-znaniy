#!/usr/bin/env bash
set -euo pipefail
FILE="russian/index.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found. Run from repository root."; exit 1; }
cp "$FILE" "$FILE.bak-written-red-card"
python3 - <<'PY'
from pathlib import Path
p=Path('russian/index.html')
s=p.read_text(encoding='utf-8')
start=s.find('<aside class="writing-side" aria-label="Письменные работы">')
if start < 0:
    raise SystemExit('ERROR: old writing-side block not found')
end=s.find('</aside>', start)
if end < 0:
    raise SystemExit('ERROR: closing aside not found')
end += len('</aside>')
new="""<aside class=\"writing-side written-work-approved side-work\" aria-label=\"Письменные работы\"><div class=\"written-card\"><div class=\"written-kicker\">ПИСЬМЕННЫЕ РАБОТЫ</div><h3>Письменные работы</h3><p class=\"side-sub\">Диктанты, изложения и сочинения по темам курса русского языка.</p><img src=\"assets/dictation-trophy.png\" alt=\"Письменные работы\"><button type=\"button\" onclick=\"location.href='written-works.html'\">Открыть раздел →</button><div id=\"dictation1Status\" style=\"margin-top:10px;font-weight:900;color:#ffe49a;text-align:center\">Диктант №1 доступен</div></div></aside>"""
s=s[:start]+new+s[end:]
p.write_text(s, encoding='utf-8')
print('OK: Russian written works card restored to approved red layout.')
PY
grep -q 'writing-side written-work-approved side-work' "$FILE"
grep -q 'background:linear-gradient(180deg,#b4144c' "$FILE"
grep -q "location.href='written-works.html'" "$FILE"
echo "PATCH OK"
