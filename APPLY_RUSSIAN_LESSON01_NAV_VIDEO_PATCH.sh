#!/usr/bin/env bash
set -euo pipefail
FILE="russian/lesson-01.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found"; exit 1; }
cp "$FILE" "$FILE.bak-nav-video"
python3 - <<'PY2'
from pathlib import Path
p=Path("russian/lesson-01.html")
s=p.read_text(encoding="utf-8")
# remove duplicate floating button
s=s.replace('<body><div id="v8DirectNav" style="position:fixed;z-index:99999;left:10px;top:10px"><button onclick="location.href=\'index.html\'" style="padding:8px 11px;border-radius:12px;border:1px solid #fff8;background:#07346ddd;color:white;font-weight:800">← Темы</button></div>\n  <header class="hud">','<body>\n  <header class="hud">',1)
# rename the proper header button
s=s.replace('<button class="ghost" id="homeBtn" type="button">← К темам</button>','<button class="ghost" id="homeBtn" type="button">← Темы</button>',1)
# lazy-load rutube only when visible
old='<iframe id="ruleVideo" src="https://rutube.ru/play/embed/6ee4616d623a1320bb9eb1b6a9e38105/" title="Язык. Что мы знаем о русском языке. Видеоурок 1. Русский язык, 5 класс" loading="eager" allow="clipboard-write; autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
new='<iframe id="ruleVideo" src="about:blank" data-src="https://rutube.ru/play/embed/6ee4616d623a1320bb9eb1b6a9e38105/" title="Язык. Что мы знаем о русском языке. Видеоурок 1. Русский язык, 5 класс" loading="eager" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
if old not in s: raise SystemExit('ERROR: video iframe signature not found')
s=s.replace(old,new,1)
oldhook="document.addEventListener('lessonstagechange',event=>{stage=event.detail.stage;if(stage===5)updateScore()});"
newhook="""document.addEventListener('lessonstagechange',event=>{\n        stage=event.detail.stage;\n        const video=$('#ruleVideo');\n        if(video && stage===1 && video.dataset.src && (video.getAttribute('src')==='about:blank' || !video.getAttribute('src'))){\n          video.setAttribute('src',video.dataset.src);\n        }\n        if(stage===5)updateScore();\n      });"""
if oldhook not in s: raise SystemExit('ERROR: stage hook signature not found')
s=s.replace(oldhook,newhook,1)
# standalone return goes to topics instead of resetting lesson
s=s.replace("if(location.hash==='#from=league'&&history.length>1){history.back();return}\n        window.lessonGoTo(0)","if(location.hash==='#from=league'&&history.length>1){history.back();return}\n        location.href='index.html'",1)
p.write_text(s,encoding='utf-8')
PY2
python3 - <<'PY2'
from pathlib import Path
s=Path('russian/lesson-01.html').read_text(encoding='utf-8')
checks=[
('duplicate nav removed','id="v8DirectNav"' not in s),
('one Topics button',s.count('← Темы')==1),
('rutube deferred','id="ruleVideo" src="about:blank" data-src="https://rutube.ru/play/embed/6ee4616d623a1320bb9eb1b6a9e38105/"' in s),
('video loads on warmup',"stage===1 && video.dataset.src" in s),
('return to topics',"location.href='index.html'" in s),
]
for n,ok in checks: print(('OK  ' if ok else 'FAIL'),n)
if not all(ok for _,ok in checks): raise SystemExit(1)
print('PATCH OK')
PY2
