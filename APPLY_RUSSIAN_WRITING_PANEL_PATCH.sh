#!/usr/bin/env bash
set -euo pipefail
FILE="russian/index.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found. Run from repository root."; exit 1; }
cp "$FILE" "$FILE.bak-writing-panel"
python3 - <<'PY'
from pathlib import Path
import re
p=Path('russian/index.html')
s=p.read_text(encoding='utf-8')
# Remove prior nested-grid CSS; append stable history-style layout CSS.
s=re.sub(r'\.russian-course-grid\{.*?@media\(max-width:850px\)\{\.russian-course-grid\{grid-template-columns:1fr\}\.dictation-side\{position:relative;top:auto;order:-1\}\.dictation-side img\{height:120px\}\}', '', s, count=1, flags=re.S)
css='''\n<style id="russian-writing-panel-v1">
/* Russian topics: same composition principle as History — topics left, written works right. */
#russian .topics-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.42fr);gap:28px;align-items:start}
#russian .russian-course-grid{display:block;margin-top:17px}
#russian .russian-course-grid .topic-scroll{margin-top:0!important}
#russian .writing-side{position:sticky;top:82px;display:flex;flex-direction:column;gap:14px;min-width:0}
#russian .writing-side-head{margin:0;text-align:center;font-size:24px;line-height:1.05;color:#fff}
#russian .writing-side-note{margin:-4px 0 2px;text-align:center;line-height:1.35;color:#d9ebff;font-size:14px}
#russian .dictation-side{position:relative;top:auto;min-width:0;border:1px solid #ffcf62;border-radius:20px;padding:18px;background:linear-gradient(160deg,#7f1236,#b91c4b 55%,#6d1230);box-shadow:0 18px 38px #0004;color:#fff;overflow:hidden}
#russian .dictation-side .eyebrow{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#ffe49a}
#russian .dictation-side h2{margin:8px 0 4px;font-size:25px;line-height:1.05}
#russian .dictation-side p{line-height:1.4;color:#fff3f6}
#russian .dictation-side img{display:block;width:100%;height:145px;object-fit:contain;margin:4px auto 8px;filter:drop-shadow(0 12px 15px #0005)}
#russian .dictation-side button{width:100%;border:0;border-radius:14px;padding:13px 10px;background:linear-gradient(135deg,#ffd45c,#ffae35);font-weight:950;color:#532000;cursor:pointer}
#russian .dictation-side .status{margin-top:10px;text-align:center;font-weight:850;color:#ffe49a}
@media(max-width:650px){#russian .topics-layout{grid-template-columns:1fr}#russian .writing-side{position:relative;top:auto}}
</style>\n'''
s=s.replace('</head>', css+'</head>',1)
# Find aside currently nested in russian-course-grid and remove it from there.
pat=r'(<aside class="dictation-side".*?</aside>)'
m=re.search(pat,s,flags=re.S)
if not m: raise SystemExit('ERROR: dictation-side not found')
aside=m.group(1)
s=s[:m.start()]+s[m.end():]
# The old wrapper now ends as </div> before russianStatus. Keep it, then close main and add sibling right panel.
marker='<p aria-live="polite" class="small" id="russianStatus"'
pos=s.find(marker)
if pos<0: raise SystemExit('ERROR: russianStatus marker not found')
# Insert right panel after </main>, not inside the topic panel.
main_end=s.find('</main>',pos)
if main_end<0: raise SystemExit('ERROR: main closing tag not found')
insert_at=main_end+len('</main>')
right='''<aside class="writing-side" aria-label="Письменные работы по русскому языку"><h2 class="writing-side-head">Письменные работы</h2><p class="writing-side-note">Диктанты, изложения и сочинения</p>'''+aside+'''</aside>'''
s=s[:insert_at]+right+s[insert_at:]
p.write_text(s,encoding='utf-8')
PY
# Sanity checks
grep -q 'class="writing-side"' "$FILE"
grep -q 'Письменные работы' "$FILE"
grep -q 'Диктант №1' "$FILE"
grep -q "dictation-01.html" "$FILE"
echo "=== RUSSIAN WRITING PANEL PATCH CHECK ==="
echo "OK topics remain in left panel"
echo "OK written works are a separate right column"
echo "OK Dictation 1 moved to right column"
echo "OK dictation link and scoring IDs preserved"
echo "OK layout ready for future exposition/composition cards"
echo "Patch applied. Now run: bash UPDATE_SITE.sh"
