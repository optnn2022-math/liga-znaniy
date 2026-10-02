#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
FILE="russian/lesson-01.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found"; exit 1; }
cp "$FILE" "$FILE.bak-bg-nav-$(date +%Y%m%d-%H%M%S)"
python3 - <<'PY'
from pathlib import Path
import re
p=Path('russian/lesson-01.html')
s=p.read_text(encoding='utf-8')
# 1) Load the same shared styles used by Russian main page.
links=''.join(f'<link rel="stylesheet" href="../shared/css/style-0{i}.css">' for i in range(1,8))
if '../shared/css/style-01.css' not in s:
    s=s.replace('<style>', links+'\n  <style>', 1)
# 2) Let the shared site CSS provide the approved football-field page background.
# Remove only the custom lesson body background, preserving sizing/color/overflow.
pat=r'(body\{margin:0;min-height:100vh;color:var\(--white\);)background:\s*radial-gradient\(circle at 82% 4%,#b6274b55 0,transparent 25%\),\s*radial-gradient\(circle at 10% 0,#2279c766 0,transparent 30%\),\s*linear-gradient\(155deg,#020d25 0,#082b5b 48%,#061a3e 100%\);(overflow-x:hidden\})'
s,n=re.subn(pat,r'\1\2',s,count=1,flags=re.S)
if n!=1:
    print('WARNING: custom lesson background pattern not found; no background block removed')
# Hide lesson-only decorative letters so the approved site background remains clean.
if 'body:before{display:none!important}' not in s:
    s=s.replace('</style>','\n    body:before{display:none!important}\n  </style>',1)
# 3) Direct-nav: keep only Topics, remove Subjects.
nav_pat=r'<div id="v8DirectNav"[^>]*>\s*<button([^>]*)>← Темы</button>\s*<button[^>]*>Предметы</button>\s*</div>'
m=re.search(nav_pat,s,flags=re.S)
if m:
    # Rebuild clean single-button nav, same Topics behavior.
    s=re.sub(nav_pat,'<div id="v8DirectNav" style="position:fixed;z-index:99999;left:10px;top:10px"><button onclick="location.href=\'index.html\'" style="padding:8px 11px;border-radius:12px;border:1px solid #fff8;background:#07346ddd;color:white;font-weight:800">← Темы</button></div>',s,count=1,flags=re.S)
else:
    # Fallback: remove only the Subjects button if markup has shifted slightly.
    s=re.sub(r'<button[^>]*onclick="location\.href=\'\.\./index\.html\'"[^>]*>Предметы</button>','',s,count=1)
p.write_text(s,encoding='utf-8')
PY

echo "=== CHECK ==="
grep -q '../shared/css/style-01.css' "$FILE" && echo 'OK shared site background styles connected'
! grep -q '>Предметы</button>' "$FILE" && echo 'OK extra Subjects button removed'
grep -q '>← Темы</button>' "$FILE" && echo 'OK Topics button preserved'
echo 'PATCH OK: russian/lesson-01.html updated only.'
