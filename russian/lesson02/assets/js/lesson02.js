
let stage=0, score=0; const earned=new Set();
const stages=[...document.querySelectorAll('.stage')], steps=[...document.querySelectorAll('.step')];
function show(n){
const player=document.getElementById('rutubePlayer');
if(stage===1 && n!==1 && player){const s=player.src;player.src='about:blank';setTimeout(()=>player.src=s,0);}
stage=n;stages.forEach((x,i)=>x.classList.toggle('active',i===n));steps.forEach((x,i)=>x.classList.toggle('active',i===n));document.getElementById('stageLabel').textContent=`Этап ${n+1} из ${stages.length}`;document.getElementById('bar').style.width=((n+1)/stages.length*100)+'%'; if(n===7){document.getElementById('finalScore').textContent=score;document.getElementById('finalText').textContent=score>=10?'Отличная работа! Ты уверенно понял роль языка.':score>=7?'Хорошая работа! Основная идея понятна.':'Вернись к заданиям и попробуй заработать ещё несколько голов.';} window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>show(+b.dataset.next)); steps.forEach(b=>b.onclick=()=>show(+b.dataset.go));
function add(key){if(!earned.has(key)){earned.add(key);score++;document.getElementById('score').textContent=score;}}
document.querySelectorAll('.activity[data-id]').forEach(a=>{a.querySelectorAll('.choice').forEach(btn=>btn.onclick=()=>{if(a.classList.contains('done'))return;let ok=btn.dataset.correct==='1';btn.classList.add(ok?'good':'bad');let f=a.querySelector('.feedback');f.textContent=ok?'Верно! +1 гол ⚽':'Пока нет. Подумай ещё и выбери другой вариант.';f.className='feedback '+(ok?'ok':'no');if(ok){a.classList.add('done');a.querySelectorAll('.choice').forEach(x=>x.disabled=true);add(a.dataset.id);}})});
let selected=null, dragged=null;
document.querySelectorAll('#bank .chip').forEach(c=>{c.addEventListener('dragstart',()=>dragged=c);c.onclick=()=>{selected=c;document.querySelectorAll('#bank .chip,.zone .chip').forEach(x=>x.classList.remove('selected'));c.classList.add('selected')}})
document.querySelectorAll('.zone').forEach(z=>{z.addEventListener('dragover',e=>e.preventDefault());z.addEventListener('drop',e=>{e.preventDefault();if(dragged)z.appendChild(dragged)});z.onclick=()=>{if(selected){z.appendChild(selected);selected.classList.remove('selected');selected=null}}})
document.getElementById('checkSort').onclick=()=>{let chips=[...document.querySelectorAll('#sortActivity .zone .chip')];let ok=chips.length===6&&chips.every(c=>c.parentElement.dataset.zone===c.dataset.kind);let f=document.getElementById('sortFeedback');f.textContent=ok?'Всё распределено верно! +1 гол ⚽':'Есть ошибка или не все карточки распределены.';f.className='feedback '+(ok?'ok':'no');if(ok)add('sort')};
document.getElementById('resetSort').onclick=()=>document.querySelectorAll('#sortActivity .zone .chip').forEach(c=>document.getElementById('bank').appendChild(c));
let order=[];document.querySelectorAll('#chain .chip').forEach(c=>c.onclick=()=>{if(order.includes(c))return;order.push(c);c.classList.add('selected');c.style.order=order.length});
document.getElementById('checkChain').onclick=()=>{let expected=['человек','мысль','язык','сообщение','другой человек'];let got=order.map(x=>x.textContent.trim());let ok=JSON.stringify(got)===JSON.stringify(expected);let f=document.getElementById('chainFeedback');f.textContent=ok?'Цепочка собрана! +1 гол ⚽':'Порядок пока неверный. Начни: человек → мысль → ...';f.className='feedback '+(ok?'ok':'no');if(ok)add('chain')};
document.getElementById('resetChain').onclick=()=>{order=[];document.querySelectorAll('#chain .chip').forEach(c=>{c.classList.remove('selected');c.style.order=''})};
document.getElementById('restart').onclick=()=>{score=0;earned.clear();document.getElementById('score').textContent='0';document.querySelectorAll('.activity').forEach(a=>{a.classList.remove('done');a.querySelectorAll('.choice').forEach(x=>{x.disabled=false;x.classList.remove('good','bad')});let f=a.querySelector('.feedback');if(f){f.textContent='';f.className='feedback'}});document.getElementById('resetSort')?.click();document.getElementById('resetChain')?.click();document.getElementById('labReset')?.click();show(0)};

// Return to the Russian-language topics page.
// In the full site this resolves naturally from lessons/lesson-02/ to the subject index.
// For isolated preview, browser history is used first.
document.getElementById('toTopics').onclick=()=>{
  const isLocalPreview = location.protocol==='file:' || location.href.startsWith('content:');
  if(isLocalPreview && history.length>1){ history.back(); return; }
  location.href='../index.html';
};

// Новая словарная лаборатория: отдельные имена переменных, чтобы не конфликтовать
// с интерактивами предыдущих страниц урока.
let labSelected=null, labDragged=null, labWon=false;

document.querySelectorAll('.dictionary-lab-stage .card').forEach(c=>{
  c.addEventListener('dragstart',()=>labDragged=c);
  c.addEventListener('click',()=>{
    labSelected=c;
    document.querySelectorAll('.dictionary-lab-stage .card').forEach(x=>x.classList.remove('selected'));
    c.classList.add('selected');
  });
});

document.querySelectorAll('.dictionary-lab-stage .drop').forEach(z=>{
  z.addEventListener('dragover',e=>e.preventDefault());
  z.addEventListener('drop',e=>{
    e.preventDefault();
    if(labDragged){ z.appendChild(labDragged); labDragged=null; }
  });
  z.addEventListener('click',e=>{
    if(e.target===z && labSelected){
      z.appendChild(labSelected);
      labSelected.classList.remove('selected');
      labSelected=null;
    }
  });
});

const labCheckBtn=document.getElementById('labCheck');
const labResetBtn=document.getElementById('labReset');
const labFeedback=document.getElementById('labFeedback');
const labBank=document.getElementById('labBank');

if(labCheckBtn){
  labCheckBtn.addEventListener('click',()=>{
    const cards=[...document.querySelectorAll('.dictionary-lab-stage .drop .card')];
    const ok=cards.length===12 && cards.every(c=>c.parentElement.dataset.zone===c.dataset.kind);
    labFeedback.textContent=ok
      ? 'Отлично! Все ситуации распределены верно. +1 гол ⚽'
      : 'Есть ошибка или не все карточки распределены. Попробуй ещё раз.';
    labFeedback.style.color=ok?'#17643f':'#a52d3f';
    if(ok && !labWon){
      labWon=true;
      if(typeof add==='function') add('dictionary-lab');
    }
  });
}

if(labResetBtn){
  labResetBtn.addEventListener('click',()=>{
    document.querySelectorAll('.dictionary-lab-stage .drop .card').forEach(c=>labBank.appendChild(c));
    labFeedback.textContent='';
    labSelected=null;
    labDragged=null;
  });
}

// Clean rebuilt dictionary laboratory (stage 5)
let lab5Selected=null,lab5Dragged=null,lab5Won=false;
document.querySelectorAll('.lab5-bank .lab-card').forEach(c=>{
 c.addEventListener('dragstart',()=>lab5Dragged=c);
 c.addEventListener('click',()=>{
   lab5Selected=c;
   document.querySelectorAll('.lab5-stage .lab-card').forEach(x=>x.classList.remove('selected'));
   c.classList.add('selected');
 });
});
document.querySelectorAll('.lab5-drop').forEach(z=>{
 z.addEventListener('dragover',e=>e.preventDefault());
 z.addEventListener('drop',e=>{e.preventDefault();if(lab5Dragged){z.appendChild(lab5Dragged);lab5Dragged=null;}});
 z.addEventListener('click',e=>{if(e.target===z&&lab5Selected){z.appendChild(lab5Selected);lab5Selected.classList.remove('selected');lab5Selected=null;}});
});
document.getElementById('lab5Check')?.addEventListener('click',()=>{
 const cs=[...document.querySelectorAll('.lab5-drop .lab-card')];
 const ok=cs.length===12&&cs.every(c=>c.parentElement.dataset.zone===c.dataset.kind);
 const f=document.getElementById('lab5Feedback');
 f.textContent=ok?'Отлично! Все ситуации распределены верно. +1 гол ⚽':'Есть ошибка или не все карточки распределены. Попробуй ещё раз.';
 f.style.color=ok?'#9cffba':'#ffd0d0';
 if(ok&&!lab5Won){lab5Won=true;if(typeof add==='function')add('dictionary-lab-clean');}
});
document.getElementById('lab5Reset')?.addEventListener('click',()=>{
 const bank=document.getElementById('lab5Bank');
 document.querySelectorAll('.lab5-drop .lab-card').forEach(c=>bank.appendChild(c));
 document.getElementById('lab5Feedback').textContent='';
 lab5Selected=null;lab5Dragged=null;
});


function fitPlanToItems(){
  const stage=document.querySelector('.lab5-stage');
  if(!stage || !stage.classList.contains('active')) return;
  const candidates=[...document.querySelectorAll('aside, .sidebar, .plan, .lesson-plan')];
  const plan=candidates.find(el=>el.textContent && el.textContent.includes('План урока') && el.textContent.includes('8. Итог'));
  if(plan){
    plan.style.height='fit-content';
    plan.style.minHeight='0';
    plan.style.alignSelf='start';
    plan.style.paddingBottom='12px';
  }
}
setTimeout(fitPlanToItems,50);
document.querySelectorAll('[data-next], .lab5-nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(fitPlanToItems,50)));


function lab5FitDrops(){
 document.querySelectorAll('.lab5-drop').forEach(z=>{
   const cards=[...z.querySelectorAll('.lab-card')], n=cards.length;
   let cols=n<=2?2:(n<=6?3:4);
   let rows=Math.max(1,Math.ceil(n/cols));
   z.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;
   z.style.gridTemplateRows=`repeat(${rows},minmax(0,1fr))`;
   cards.forEach(c=>{
     c.style.fontSize = n<=2 ? '7px' : n<=4 ? '6px' : n<=6 ? '5px' : '4.3px';
   });
 });
}
document.querySelectorAll('.lab5-drop').forEach(z=>{
 new MutationObserver(lab5FitDrops).observe(z,{childList:true});
});
lab5FitDrops();


function lab5CenterTransferredCards(){
 document.querySelectorAll('.lab5-drop').forEach(z=>{
   z.style.removeProperty('grid-template-columns');
   z.style.removeProperty('grid-template-rows');
   [...z.querySelectorAll('.lab-card')].forEach(c=>{
     c.style.removeProperty('font-size');
   });
 });
}
document.querySelectorAll('.lab5-drop').forEach(z=>{
 new MutationObserver(lab5CenterTransferredCards).observe(z,{childList:true});
});
lab5CenterTransferredCards();

