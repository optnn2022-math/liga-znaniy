#!/usr/bin/env bash
set -euo pipefail

FILE="russian/lesson02/assets/js/lesson02.js"

python3 - <<'PY'
from pathlib import Path
p=Path("russian/lesson02/assets/js/lesson02.js")
s=p.read_text(encoding="utf-8")

old="""let selected=null, dragged=null;
document.querySelectorAll('#bank .chip').forEach(c=>{c.addEventListener('dragstart',()=>dragged=c);c.onclick=()=>{selected=c;document.querySelectorAll('#bank .chip,.zone .chip').forEach(x=>x.classList.remove('selected'));c.classList.add('selected')}})
document.querySelectorAll('.zone').forEach(z=>{z.addEventListener('dragover',e=>e.preventDefault());z.addEventListener('drop',e=>{e.preventDefault();if(dragged)z.appendChild(dragged)});z.onclick=()=>{if(selected){z.appendChild(selected);selected.classList.remove('selected');selected=null}}})
document.getElementById('checkSort').onclick=()=>{let chips=[...document.querySelectorAll('#sortActivity .zone .chip')];let ok=chips.length===6&&chips.every(c=>c.parentElement.dataset.zone===c.dataset.kind);let f=document.getElementById('sortFeedback');f.textContent=ok?'Всё распределено верно! +1 гол ⚽':'Есть ошибка или не все карточки распределены.';f.className='feedback '+(ok?'ok':'no');if(ok)add('sort')};
document.getElementById('resetSort').onclick=()=>document.querySelectorAll('#sortActivity .zone .chip').forEach(c=>document.getElementById('bank').appendChild(c));
"""

new="""let selected=null, dragged=null;
const sortBank=document.getElementById('labBank');
const sortActivity=document.getElementById('sortActivity');

// Задание 2: единая механика для ПК (HTML5 drag&drop) и телефона (тап карточка → тап область).
if(sortActivity && sortBank){
  sortActivity.querySelectorAll('.chip').forEach(c=>{
    c.setAttribute('draggable','true');

    c.addEventListener('dragstart',e=>{
      dragged=c;
      selected=null;
      c.classList.add('selected');
      if(e.dataTransfer){
        e.dataTransfer.effectAllowed='move';
        e.dataTransfer.setData('text/plain',c.textContent.trim());
      }
    });

    c.addEventListener('dragend',()=>{
      c.classList.remove('selected');
      dragged=null;
    });

    c.addEventListener('click',e=>{
      e.stopPropagation();
      selected=c;
      sortActivity.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'));
      c.classList.add('selected');
    });
  });

  sortActivity.querySelectorAll('.zone').forEach(z=>{
    z.addEventListener('dragenter',e=>{
      e.preventDefault();
      z.classList.add('drag-over');
    });
    z.addEventListener('dragover',e=>{
      e.preventDefault();
      if(e.dataTransfer) e.dataTransfer.dropEffect='move';
      z.classList.add('drag-over');
    });
    z.addEventListener('dragleave',e=>{
      if(!z.contains(e.relatedTarget)) z.classList.remove('drag-over');
    });
    z.addEventListener('drop',e=>{
      e.preventDefault();
      e.stopPropagation();
      z.classList.remove('drag-over');
      if(dragged){
        z.appendChild(dragged);
        dragged.classList.remove('selected');
        dragged=null;
      }
    });
    z.addEventListener('click',()=>{
      if(selected){
        z.appendChild(selected);
        selected.classList.remove('selected');
        selected=null;
      }
    });
  });
}

document.getElementById('checkSort').onclick=()=>{let chips=[...document.querySelectorAll('#sortActivity .zone .chip')];let ok=chips.length===6&&chips.every(c=>c.parentElement.dataset.zone===c.dataset.kind);let f=document.getElementById('sortFeedback');f.textContent=ok?'Всё распределено верно! +1 гол ⚽':'Есть ошибка или не все карточки распределены.';f.className='feedback '+(ok?'ok':'no');if(ok)add('sort')};
document.getElementById('resetSort').onclick=()=>{
  document.querySelectorAll('#sortActivity .zone .chip').forEach(c=>sortBank.appendChild(c));
  selected=null;
  dragged=null;
  sortActivity?.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));
};
"""

if old not in s:
    raise SystemExit("ERROR: expected old drag/drop block not found; file left unchanged")

p.write_text(s.replace(old,new,1),encoding="utf-8")
print("OK: PC drag-and-drop fixed in",p)
PY

git add "$FILE"
git commit -m "Fix Russian lesson 2 drag and drop on PC"
git push origin main
