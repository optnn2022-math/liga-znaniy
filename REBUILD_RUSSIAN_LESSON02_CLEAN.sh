#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

SRC="russian/lesson02/source/RUSSIAN_LESSON02_LAB_FULLPAGE_v11_FINAL.html"
DST="russian/lesson02/index.html"
BACKUP="russian/lesson02/index.html.bak-before-clean-rebuild"

[ -f "$SRC" ] || { echo "❌ Не найден эталон: $SRC"; exit 1; }
cp "$DST" "$BACKUP" 2>/dev/null || true
cp "$SRC" "$DST"

python3 - <<'PY'
from pathlib import Path
import re

p=Path("russian/lesson02/index.html")
s=p.read_text(encoding="utf-8")

css=r'''
<style id="lesson02-clean-rebuild-v1">
html,body{min-height:100%}
body{
 background:
 linear-gradient(rgba(3,27,59,.20),rgba(3,27,59,.36)),
 url("assets/images/background_or_ui_01_61776296.png")
 center top/cover fixed no-repeat !important;
}
.layout,main,.stage{background-color:transparent!important}

@media(min-width:1100px){
 .stage[data-stage="4"] .labs-bank{margin-top:0!important;margin-bottom:8px!important}
 .stage[data-stage="4"] .labs-zones{
  width:min(68%,900px)!important;margin:-35px auto -25px!important;
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:8px 12px!important;align-items:start!important
 }
 .stage[data-stage="4"] .lab5-zone{
  position:relative!important;width:100%!important;max-width:420px!important;margin:0 auto!important
 }
 .stage[data-stage="4"] .lab5-zone>img{
  display:block!important;width:65%!important;height:auto!important;margin:0 auto!important
 }
 .stage[data-stage="4"] .lab5-drop{
  position:absolute!important;left:25%!important;right:25%!important;
  top:48%!important;bottom:12%!important;display:flex!important;flex-wrap:wrap!important;
  align-content:center!important;justify-content:center!important;gap:3px!important;
  overflow:auto!important;box-sizing:border-box!important
 }
 .stage[data-stage="4"] .lab5-drop .lab-card{
  flex:0 1 calc(50% - 4px)!important;max-width:48%!important;min-width:0!important;
  padding:3px 4px!important;margin:0!important;font-size:9px!important;
  line-height:1.05!important;box-sizing:border-box!important
 }
}
@media(max-width:1099px){
 .stage[data-stage="4"] .labs-zones,
 .stage[data-stage="4"] .lab5-zone,
 .stage[data-stage="4"] .lab5-zone>img,
 .stage[data-stage="4"] .lab5-drop{zoom:1!important;transform:none!important}
}
#sortActivity .chip{
 cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none
}
#sortActivity .chip:active{cursor:grabbing}
#sortActivity .zone{min-height:90px}
#sortActivity .drag-over{outline:3px solid #ffd34e!important;outline-offset:3px}
#sortActivity .stage4-selected{outline:3px solid #ffd34e!important}
</style>
'''

js=r'''
<script id="lesson02-clean-dnd-v1">
(()=>{
 let dragged=null;
 function setup(){
  const root=document.querySelector('#sortActivity');
  if(!root)return;
  const chips=[...root.querySelectorAll('.chip')];
  const zones=[...root.querySelectorAll('.zone')];

  chips.forEach(chip=>{
   chip.draggable=true;
   chip.addEventListener('dragstart',e=>{
    dragged=chip;
    if(e.dataTransfer){
     e.dataTransfer.effectAllowed='move';
     e.dataTransfer.setData('text/plain',chip.textContent.trim());
    }
   });
   chip.addEventListener('dragend',()=>{
    zones.forEach(z=>z.classList.remove('drag-over'));
    dragged=null;
   });
   chip.addEventListener('click',()=>{
    chips.forEach(c=>c.classList.remove('stage4-selected'));
    chip.classList.add('stage4-selected');
    dragged=chip;
   });
  });

  zones.forEach(zone=>{
   zone.addEventListener('dragenter',e=>{e.preventDefault();zone.classList.add('drag-over')});
   zone.addEventListener('dragover',e=>{
    e.preventDefault();
    if(e.dataTransfer)e.dataTransfer.dropEffect='move';
    zone.classList.add('drag-over');
   });
   zone.addEventListener('dragleave',e=>{
    if(!zone.contains(e.relatedTarget))zone.classList.remove('drag-over')
   });
   zone.addEventListener('drop',e=>{
    e.preventDefault();zone.classList.remove('drag-over');
    if(dragged)zone.appendChild(dragged);
   });
   zone.addEventListener('click',e=>{
    if(e.target.closest('.chip'))return;
    const selected=root.querySelector('.chip.stage4-selected')||dragged;
    if(selected){
     zone.appendChild(selected);
     selected.classList.remove('stage4-selected');
     dragged=null;
    }
   });
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
 else setup();
})();
</script>
'''

if "</head>" not in s.lower() or "</body>" not in s.lower():
 raise SystemExit("❌ Неожиданная структура эталонного HTML")

s=re.sub(r'</head>',css+'\n</head>',s,count=1,flags=re.I)
s=re.sub(r'</body>',js+'\n</body>',s,count=1,flags=re.I)
p.write_text(s,encoding="utf-8")
print("✅ Чистая версия урока 2 собрана.")
PY

grep -q 'lesson02-clean-rebuild-v1' "$DST"
grep -q 'lesson02-clean-dnd-v1' "$DST"
grep -q 'data-stage="4"' "$DST"

git add "$DST"
git commit -m "Rebuild Russian lesson 2 from clean template" || true
git pull --rebase origin main
git push origin main

echo "✅ ГОТОВО"
echo "• урок 2 пересоздан из исходного v11"
echo "• основной фон установлен"
echo "• перетаскивание на ПК восстановлено"
echo "• на телефоне: карточка → зона"
echo "• лаборатория уменьшена только на ПК"
echo "• backup: $BACKUP"
