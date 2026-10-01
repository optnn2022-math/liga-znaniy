(function(){
  const READY={
    math:{name:'Математика · первые три темы',text:'Видео, задачи и тест по темам 1–3',button:'Открыть блок →'},
    history:{name:'История · 5 класс',text:'34 темы курса истории',button:'Открыть блок →'},
    russian:{name:'Русский язык · 5 класс',text:'157 тем курса русского языка',button:'Открыть блок →'},
    biology:{name:'Биология · 5 класс',text:'95 тем курса биологии',button:'Открыть блок →'},
    chinese:{name:'Китайский язык · с нуля',text:'56 тем курса китайского языка',button:'Открыть блок →'}
  };
  let selected='math';
  function select(subject,btn){
    selected=subject;
    document.querySelectorAll('#landing .subject').forEach(x=>x.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const info=READY[subject];
    const open=document.getElementById('openSubject');
    if(!info){ if(open){open.disabled=true;open.textContent='Пока готовится';} return; }
    const t=document.getElementById('subjectCommentTitle'), l=document.getElementById('subjectCommentLead'), n=document.getElementById('subjectCommentName'), x=document.getElementById('subjectCommentText');
    if(t)t.textContent='Егор, ты выбрал предмет!'; if(l)l.textContent='Посмотри, что тебя ждёт, и открывай блок.'; if(n)n.textContent=info.name; if(x)x.textContent=info.text;
    if(open){open.disabled=false;open.textContent=info.button;}
  }
  function showLocal(id){
    document.querySelectorAll('section.screen').forEach(s=>s.classList.add('hidden'));
    const el=document.getElementById(id); if(el){el.classList.remove('hidden'); window.scrollTo(0,0);}
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('#landing .subject[data-subject]');
    if(!btn)return;
    e.preventDefault(); e.stopImmediatePropagation(); select(btn.dataset.subject,btn);
  },true);
  document.addEventListener('click',function(e){
    const open=e.target.closest&&e.target.closest('#openSubject'); if(!open)return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(selected==='math'){location.href='/math/index.html';return;}
    if(selected==='history'){location.href='/history/index.html';return;}
    if(selected==='russian'||selected==='biology'||selected==='chinese'){showLocal(selected);return;}
  },true);
  // Reliable returns to the subject chooser, independent of legacy handlers.
  ['russianBack','chineseBack','biologyBack','historyBack','backSubjects'].forEach(id=>{
    const b=document.getElementById(id); if(b)b.addEventListener('click',function(e){e.preventDefault();showLocal('landing')},true);
  });
  select('math',document.getElementById('subjectMath'));
})();
