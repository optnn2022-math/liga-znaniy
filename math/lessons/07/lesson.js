const LESSON_GOAL_KEY='primeLessonGoals';
let score=Number(localStorage.getItem(LESSON_GOAL_KEY)||0);
if(!Number.isFinite(score)||score<0)score=0;
const earnedKeys=new Set(JSON.parse(localStorage.getItem('primeLessonEarnedKeys')||'[]'));
function persistGoals(){localStorage.setItem(LESSON_GOAL_KEY,String(score));localStorage.setItem('primeLessonEarnedKeys',JSON.stringify([...earnedKeys]));}
function showBigGoal(){const el=document.createElement('div');el.className='goal-pop lesson07-goal-visible';el.setAttribute('role','status');el.setAttribute('aria-live','assertive');el.innerHTML='<span class="lesson07-goal-word">ГОЛ!</span><span class="lesson07-goal-ball" aria-hidden="true">⚽</span>';document.body.appendChild(el);setTimeout(()=>el.remove(),1900)}
function awardOnce(key){if(earnedKeys.has(key))return false;earnedKeys.add(key);score++;persistGoals();syncScore();showBigGoal();return true;}
const scoreEl=document.getElementById('score'),quizScoreEl=document.getElementById('quizScore');function syncScore(){scoreEl.textContent=score;if(quizScoreEl)quizScoreEl.textContent=score;const p=document.getElementById('practiceScore');if(p)p.textContent=score}function addGoal(key){if(key){if(!awardOnce(key))showBigGoal();}else{score++;persistGoals();syncScore();showBigGoal();}}function mathTopicsUrl(){return '../../'}function returnToTopics(){window.location.href='../../';}
const nums=[2,5,9,11,15,17,21,23,27,31,35,41], prime=new Set([2,5,11,17,23,31,41]);const balls=document.getElementById('balls');nums.forEach(n=>{let d=document.createElement('div');d.className='number-ball';d.draggable=true;d.dataset.n=n;d.innerHTML='<img src="assets/png_11_69948aa57063.png"><b>'+n+'</b>';d.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',n));balls.appendChild(d)});document.querySelectorAll('.goal-zone').forEach(g=>{g.addEventListener('dragover',e=>e.preventDefault());g.addEventListener('drop',e=>{e.preventDefault();let n=+e.dataTransfer.getData('text/plain'),el=[...document.querySelectorAll('.number-ball')].find(x=>+x.dataset.n===n);if(!el||el.classList.contains('done'))return;let ok=(g.dataset.kind==='prime')===prime.has(n);let f=document.getElementById('sortFb');if(ok){el.classList.add('done');f.textContent='ГОЛ! '+n+' отправлен верно.';addGoal()}else f.textContent='Мимо! Проверь делители числа '+n+'.'})});
document.getElementById('oneBtn').onclick=()=>{document.getElementById('oneFb').innerHTML='<b>Ловушка!</b> Число 1 — ни простое, ни составное: у него только один натуральный делитель.'};let trapDone=false;function trap(btn,ok,msg){document.getElementById('trapFb').textContent=msg;btn.classList.add(ok?'correct':'wrong');if(ok&&!trapDone){addGoal();trapDone=true}}
/* Mobile: drag a ball with a finger, or tap a ball then tap a goal. */
let selectedBall=null;
function chooseBall(el){
  document.querySelectorAll('.number-ball').forEach(x=>x.classList.remove('selected-ball'));
  selectedBall=el;
  if(el && !el.classList.contains('done')) el.classList.add('selected-ball');
}
function checkBallInGoal(el, goal){
  if(!el || el.classList.contains('done') || !goal) return;
  const n=+el.dataset.n;
  const ok=(goal.dataset.kind==='prime')===prime.has(n);
  const f=document.getElementById('sortFb');
  if(ok){
    el.classList.add('done');
    el.classList.remove('selected-ball');
    f.textContent='ГОЛ! '+n+' отправлен верно.';
    addGoal();
    selectedBall=null;
  } else {
    f.textContent='Мимо! Проверь делители числа '+n+'.';
    el.classList.add('wrong-ball');
    setTimeout(()=>el.classList.remove('wrong-ball'),500);
  }
}
document.querySelectorAll('.number-ball').forEach(el=>{
  el.addEventListener('click',()=>chooseBall(el));
  el.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse') return;
    chooseBall(el);
    el.setPointerCapture?.(e.pointerId);
  });
  el.addEventListener('pointerup',e=>{
    if(e.pointerType==='mouse') return;
    const under=document.elementFromPoint(e.clientX,e.clientY);
    const goal=under?.closest?.('.goal-zone');
    if(goal) checkBallInGoal(el,goal);
  });
});
document.querySelectorAll('.goal-zone').forEach(goal=>{
  goal.addEventListener('click',()=>{ if(selectedBall) checkBallInGoal(selectedBall,goal); });
});

function finishLesson(){location.href=mathTopicsUrl()}



function goalFxNew(){ /* Only awardOnce displays the approved GOAL animation. */ }
const warm=[
 ["Какая пара взаимно простая?",["8 и 15","8 и 12","14 и 21","18 и 24"],0],
 ["Какая пара НЕ взаимно простая?",["9 и 16","10 и 21","14 и 25","12 и 18"],3],
 ["Могут ли два составных числа быть взаимно простыми?",["Да","Нет","Только чётные","Только одинаковые"],0],
 ["У пары 14 и 25 общий делитель больше 1 есть?",["Да","Нет","Только 7","Только 5"],1]
];
let warmDone=0;
const cw=document.getElementById('coprimeWarmup');
warm.forEach((q,i)=>{
 let d=document.createElement('div');d.className='warm-q';d.innerHTML=`<b>${i+1}. ${q[0]}</b><div class="warm-options"></div><div class="wfb"></div>`;
 q[1].forEach((x,j)=>{let b=document.createElement('button');b.textContent=x;b.onclick=()=>{
   if(d.dataset.done)return;
   const options=[...d.querySelectorAll('.warm-options button')];
   options.forEach(option=>option.classList.remove('warm-answer-correct','warm-answer-wrong'));
   if(j===q[2]){
     d.dataset.done='1';warmDone++;
     b.classList.add('warm-answer-correct');
     b.setAttribute('aria-label',x+' — верно');
     d.querySelector('.wfb').textContent='✓ Верно!';
     d.querySelector('.wfb').className='wfb warm-feedback-correct';
     options.forEach(option=>option.disabled=true);
     goalFxNew();if(typeof addGoal==='function')addGoal('warm-'+i);
     if(warmDone===warm.length)document.getElementById('toPractice').disabled=false;
   } else {
     b.classList.add('warm-answer-wrong');
     d.querySelector('.wfb').textContent='✗ Неверно. Проверь общие делители ещё раз.';
     d.querySelector('.wfb').className='wfb warm-feedback-wrong';
   }
 };d.querySelector('.warm-options').appendChild(b)});
 cw.appendChild(d);
});





document.addEventListener('DOMContentLoaded',()=>{
 const pairs=[[8,15],[14,25],[16,27],[21,40]];
 const left=[8,14,16,21], right=[25,15,40,27];
 const L=document.getElementById('pairLeft'),R=document.getElementById('pairRight'),S=document.getElementById('pairStatus');
 if(!L||!R)return;
 let selected=null,done=0;
 const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
 function make(n,side){
  const b=document.createElement('button');b.className='pair-num';b.textContent=n;b.dataset.n=n;b.dataset.side=side;
  b.onclick=()=>{
   if(b.classList.contains('matched'))return;
   if(!selected){selected=b;b.classList.add('selected');S.textContent='Теперь выбери число из другого столбца';return}
   if(selected.dataset.side===side){selected.classList.remove('selected');selected=b;b.classList.add('selected');return}
   const a=+selected.dataset.n,c=+b.dataset.n;
   if(gcd(a,c)===1){
    selected.classList.remove('selected');selected.classList.add('matched');b.classList.add('matched');
    done++;S.textContent='ГОЛ! Пара '+a+' и '+c+' — взаимно простая.';
    if(typeof goalFxNew==='function')goalFxNew(); if(typeof addGoal==='function')addGoal('pair-'+[a,c].sort((x,y)=>x-y).join('-'));
    selected=null;
    if(done===4) setTimeout(()=>S.textContent='Отлично! Все 4 пары собраны ⚽',650);
   }else{
    const old=selected;old.classList.remove('selected');old.classList.add('wrong');b.classList.add('wrong');
    S.textContent='Эти числа имеют общий делитель больше 1. Попробуй ещё.';
    setTimeout(()=>{old.classList.remove('wrong');b.classList.remove('wrong')},450);selected=null;
   }
  };return b;
 }
 left.forEach(n=>L.appendChild(make(n,'L')));right.forEach(n=>R.appendChild(make(n,'R')));
const resetPairs=document.getElementById('resetPairs');
if(resetPairs) resetPairs.onclick=()=>{
  selected=null;
  done=0;
  L.querySelectorAll('.pair-num').forEach(b=>b.classList.remove('selected','matched','wrong'));
  R.querySelectorAll('.pair-num').forEach(b=>b.classList.remove('selected','matched','wrong'));
  S.textContent='Собери 4 пары';
};
});



document.addEventListener('DOMContentLoaded',()=>{
 const host=document.getElementById('practicePages');
 if(!host)return;
 host.innerHTML='<article class="v25-q" data-q="0" data-correct="1">\n<div class="v25-count">Задание 1 из 10</div>\n<h3>Какое из чисел является простым?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">21</button><button class="v25-answer" data-i="1">29</button><button class="v25-answer" data-i="2">39</button><button class="v25-answer" data-i="3">51</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="1" data-correct="3">\n<div class="v25-count">Задание 2 из 10</div>\n<h3>Какое из чисел является составным?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">31</button><button class="v25-answer" data-i="1">37</button><button class="v25-answer" data-i="2">41</button><button class="v25-answer" data-i="3">49</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="2" data-correct="2">\n<div class="v25-count">Задание 3 из 10</div>\n<h3>Какое утверждение о числе 1 верно?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">Простое</button><button class="v25-answer" data-i="1">Составное</button><button class="v25-answer" data-i="2">Ни простое, ни составное</button><button class="v25-answer" data-i="3">Единственное чётное простое</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="3" data-correct="1">\n<div class="v25-count">Задание 4 из 10</div>\n<h3>Какое число — единственное чётное простое?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">1</button><button class="v25-answer" data-i="1">2</button><button class="v25-answer" data-i="2">4</button><button class="v25-answer" data-i="3">6</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="4" data-correct="0">\n<div class="v25-count">Задание 5 из 10</div>\n<h3>Какая пара чисел взаимно простая?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">8 и 15</button><button class="v25-answer" data-i="1">12 и 18</button><button class="v25-answer" data-i="2">14 и 21</button><button class="v25-answer" data-i="3">16 и 24</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="5" data-correct="3">\n<div class="v25-count">Задание 6 из 10</div>\n<h3>Какая пара НЕ является взаимно простой?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">9 и 20</button><button class="v25-answer" data-i="1">14 и 25</button><button class="v25-answer" data-i="2">16 и 27</button><button class="v25-answer" data-i="3">15 и 35</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="6" data-correct="1">\n<div class="v25-count">Задание 7 из 10</div>\n<h3>Какое разложение доказывает, что 77 — составное?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">77 = 1 · 77</button><button class="v25-answer" data-i="1">77 = 7 · 11</button><button class="v25-answer" data-i="2">77 = 70 + 7</button><button class="v25-answer" data-i="3">77 = 80 − 3</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="7" data-correct="2">\n<div class="v25-count">Задание 8 из 10</div>\n<h3>Какое из чисел является простым?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">51</button><button class="v25-answer" data-i="1">57</button><button class="v25-answer" data-i="2">61</button><button class="v25-answer" data-i="3">69</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="8" data-correct="0">\n<div class="v25-count">Задание 9 из 10</div>\n<h3>Какая пара взаимно простая, хотя оба числа составные?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">8 и 15</button><button class="v25-answer" data-i="1">6 и 9</button><button class="v25-answer" data-i="2">10 и 15</button><button class="v25-answer" data-i="3">12 и 18</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article><article class="v25-q" data-q="9" data-correct="3">\n<div class="v25-count">Задание 10 из 10</div>\n<h3>Какое число является составным?</h3><div class="v25-answers"><button class="v25-answer" data-i="0">53</button><button class="v25-answer" data-i="1">59</button><button class="v25-answer" data-i="2">67</button><button class="v25-answer" data-i="3">91</button></div>\n<div class="v25-feedback" aria-live="polite"></div>\n</article>';
 const qs=[...host.querySelectorAll('.v25-q')];
 let idx=0;
 // Keep a lesson-wide total for the final page; never reset an existing score.
 let goals=score;
 window.lessonGoals=goals;
 function sync(){
   document.querySelectorAll('#practiceScore,[id*="Score"],.score span').forEach(el=>{
     if(el && /goal|score/i.test(el.id||el.parentElement?.className||'')) el.textContent=goals;
   });
   localStorage.setItem('primeLessonGoals',String(goals));
 }
 function fx(){ /* The shared GOAL effect is displayed by awardOnce. */ }
 function show(n){qs.forEach((q,i)=>q.classList.toggle('v25-active',i===n));window.scrollTo({top:0,behavior:'smooth'})}
 qs.forEach((q,qi)=>{
   const correct=Number(q.dataset.correct), fb=q.querySelector('.v25-feedback');
   q.querySelectorAll('.v25-answer').forEach(b=>b.addEventListener('click',()=>{
     const chosen=Number(b.dataset.i);
     if(q.dataset.solved==='1')return;
     if(chosen===correct){
       q.dataset.solved='1'; b.classList.add('v25-right');
       q.querySelectorAll('.v25-answer').forEach(x=>x.disabled=true);
       const earnedNow=awardOnce('practice-'+qi); if(!earnedNow)showBigGoal(); goals=score; window.lessonGoals=score; sync();
       fb.textContent=(earnedNow?'⚽ Верно! +1 гол. ':'⚽ Верно! Гол уже засчитан. ')+['У 29 только два делителя: 1 и 29.', '49 = 7 · 7, поэтому число составное.', 'Число 1 не является ни простым, ни составным.', 'Это число 2.', 'НОД(8,15)=1.', '15 и 35 имеют общий делитель 5.', '77 имеет делители 7 и 11.', '61 не делится ни на одно простое число, не превосходящее √61.', '8 и 15 — составные, но их общий делитель только 1.', '91 = 7 · 13.'][qi];
       let next=document.createElement('button'); next.className='v25-next v25-show';
       next.textContent=qi===qs.length-1?'Перейти к мини-тесту →':'Следующее задание →';
       q.appendChild(next);
       next.onclick=()=>{
         if(qi<qs.length-1){idx=qi+1;show(idx)}
         else {
           const b4=document.getElementById('toMiniTestV17')||document.getElementById('toMiniTestV16');
           if(b4) b4.click();
           else showLessonStep(4)
         }
       };
     } else {
       b.classList.add('v25-wrong'); fb.textContent='Пока нет. Попробуй ещё раз — гол не снимается.';
       setTimeout(()=>b.classList.remove('v25-wrong'),600);
     }
   }));
 });
 sync(); show(0);
});



document.addEventListener('DOMContentLoaded',()=>{
 const mt=document.getElementById('miniTestNew');if(!mt)return;
 const questions=[
 ['Запиши простое число между 20 и 25.','23','Между 20 и 25 только число 23 имеет ровно два натуральных делителя: 1 и 23.'],
 ['Запиши наименьшее составное натуральное число.','4','Числа 1, 2 и 3 не составные; у числа 4 три делителя: 1, 2 и 4.'],
 ['Сколько натуральных делителей у любого простого числа?','2','У простого числа ровно два натуральных делителя: 1 и само число.'],
 ['Запиши единственное чётное простое число.','2','Число 2 делится только на 1 и 2; любое другое чётное число делится ещё и на 2.'],
 ['Сколько натуральных делителей у числа 1?','1','У числа 1 только один натуральный делитель — само число 1.'],
 ['Запиши наименьшее двузначное простое число.','11','Число 10 составное, а 11 делится только на 1 и 11.'],
 ['Запиши наименьшее двузначное составное число.','10','10 = 2 · 5, поэтому у него есть делители 1, 2, 5 и 10.'],
 ['Найди НОД чисел 8 и 15.','1','Делители 8: 1, 2, 4, 8; делители 15: 1, 3, 5, 15. Общий только 1.'],
 ['Найди НОД чисел 14 и 25.','1','Делители 14: 1, 2, 7, 14; делители 25: 1, 5, 25. Общий только 1.'],
 ['Запиши простое число, которое больше 30, но меньше 35.','31','31 делится только на 1 и 31; 32, 33 и 34 — составные.']
 ];
 const normalize=v=>String(v).trim().replace(/\s+/g,'');
 let savedAnswers=Array(questions.length).fill('');
 window.drawMiniList=function(){
   if(mt.querySelector('.lesson07-final-list'))return;
   mt.innerHTML='<div class="lesson07-final-list">'+questions.map((q,i)=>`<article class="lesson07-final-item"><label for="lesson07-final-${i}"><strong>${i+1}. ${q[0]}</strong></label><input id="lesson07-final-${i}" class="lesson07-final-input" data-i="${i}" inputmode="numeric" autocomplete="off" placeholder="Введи ответ"><div class="lesson07-final-feedback" aria-live="polite"></div></article>`).join('')+'<div class="lesson07-final-actions"><button type="button" class="continue-btn lesson07-final-check">✓ Проверить ответы</button><button type="button" class="continue-btn lesson07-final-finish">🏁 Завершить урок</button></div><p class="lesson07-final-summary" aria-live="polite"></p></div>';
   const inputs=[...mt.querySelectorAll('.lesson07-final-input')],check=mt.querySelector('.lesson07-final-check'),finish=mt.querySelector('.lesson07-final-finish'),summary=mt.querySelector('.lesson07-final-summary');
   let checked=false;
   inputs.forEach((input,i)=>{input.value=savedAnswers[i];});
   const validate=()=>{
     let correct=0, newlyAwarded=0;
     const results=inputs.map((input,i)=>normalize(input.value)===questions[i][1]);
     inputs.forEach((input,i)=>{
       const ok=results[i];
       if(ok)correct++;
       const feedback=input.parentElement.querySelector('.lesson07-final-feedback');
       feedback.className='lesson07-final-feedback '+(ok?'is-correct':'is-wrong');
       feedback.textContent=ok?'✓ Верно':'Неверно. Правильный ответ: '+questions[i][1]+'. '+questions[i][2];
       input.classList.toggle('is-correct',ok);input.classList.toggle('is-wrong',!ok);
     });
     checked=true;
     results.forEach((ok,i)=>{if(ok&&awardOnce('lesson07-final-correct-'+i))newlyAwarded++;});
     summary.textContent='Верных ответов: '+correct+' из '+questions.length+'. '+(newlyAwarded?'Начислено голов: '+newlyAwarded+'. ':'')+(correct===questions.length?'Отлично, все ответы правильные!':'Неверные ответы отмечены и объяснены.');
     return correct;
   };
   check.onclick=validate;
   inputs.forEach((input,i)=>input.addEventListener('input',()=>{savedAnswers[i]=input.value;checked=false;input.classList.remove('is-correct','is-wrong');const fb=input.parentElement.querySelector('.lesson07-final-feedback');fb.textContent='';fb.className='lesson07-final-feedback';summary.textContent='Ответы изменены. Нажми «Проверить ответы» ещё раз.';}));
   finish.onclick=()=>{
     if(!checked){summary.textContent='Сначала нажми «Проверить ответы».';check.focus();return;}
     localStorage.setItem('liga_math_lesson07_test_checked','1');
     finishLesson();
   };
 };
});

/* Pause native players and unload embedded players only when their page becomes hidden. */
function stopHiddenLessonVideos(){
 document.querySelectorAll('video').forEach(v=>{if(!v.closest('section')||v.closest('section').style.display==='none')v.pause();});
 document.querySelectorAll('iframe').forEach(frame=>{
   const section=frame.closest('section');
   if(!section||section.style.display!=='none')return;
   const src=frame.getAttribute('src');
   if(!src)return;
   frame.setAttribute('src','about:blank');
   frame.setAttribute('src',src);
 });
}
function showLessonStep(n){document.body.classList.remove('v19-page2','v19-page3','v19-page4');document.body.dataset.step=String(n);for(const [step,id] of [[1,'lessonPage1'],[2,'coprimeScreen'],[3,'practiceStage'],[4,'miniTestStage']]){const section=document.getElementById(id);if(section)section.style.setProperty('display',step===n?'block':'none','important');}stopHiddenLessonVideos();if(n===3){const qs=[...document.querySelectorAll('#practicePages .v25-q')];if(qs.length&&!qs.some(q=>q.classList.contains('v25-active')))qs[0].classList.add('v25-active');}window.scrollTo(0,0);if(n===4&&typeof window.drawMiniList==='function')window.drawMiniList()}
document.addEventListener('DOMContentLoaded',()=>{const next=document.querySelector('#lessonPage1 .lesson-next button');if(next)next.onclick=e=>{e.preventDefault();showLessonStep(2)};const go=document.getElementById('toPractice');if(go){go.disabled=warmDone!==warm.length;go.onclick=()=>{if(!go.disabled)showLessonStep(4)}};document.getElementById('coprimeScreen')?.querySelector('.screen-shell')?.insertAdjacentHTML('beforeend','');document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.closest('#practiceStage')&&/Перейти к мини-тесту/i.test(b.textContent||'')){e.preventDefault();e.stopImmediatePropagation();showLessonStep(4)}} ,true);});

/* Unified stage navigation. Hero markup and styles are intentionally unchanged. */
document.addEventListener('DOMContentLoaded',()=>{
  syncScore();
  for(const [n,id] of [[2,'coprimeScreen'],[3,'practiceStage'],[4,'miniTestStage']]){
    const section=document.getElementById(id);if(!section)continue;
    const nav=document.createElement('nav');nav.className='lesson-stage-navigation';
    const back=document.createElement('button');back.type='button';back.className='continue-btn';back.textContent='← Назад';back.onclick=()=>showLessonStep(n===4?2:n-1);
    const topics=document.createElement('button');topics.type='button';topics.className='continue-btn';topics.textContent='К списку уроков';topics.onclick=returnToTopics;
    nav.append(back,topics);section.querySelector('.screen-shell')?.prepend(nav);
  }
});
