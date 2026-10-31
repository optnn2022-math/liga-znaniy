(()=>{
'use strict';
const {$}= { $: id=>document.getElementById(id) };
const {topics,groups,make}=window.MathTrainer;
const byId=Object.fromEntries(topics.map(t=>[t.id,t]));
const STORAGE='liga_math_sprint_v2';
const defaults=()=>({sessions:[],mistakes:[]});
function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE));return d&&Array.isArray(d.sessions)&&Array.isArray(d.mistakes)?d:defaults();}catch(_){return defaults();}}
let saved=load(),selectedTopic='composition',selectedMode='learn',level=1,duration=60,game=null,timer=null,autoNext=null;
let lessonState={topic:null,variant:0,step:0,preview:false};let hintStep=0;let activeSplitInput=null;
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch(_){window.alert('Не удалось сохранить результат. Проверьте память браузера и сделайте резервную копию на странице статистики.');}}
const $id=id=>$(id);
function show(view){['home','play','results','lesson'].forEach(id=>$id(id).classList.toggle('hidden',id!==view));document.body.classList.toggle('playing',view==='play'||view==='lesson');window.scrollTo({top:0,behavior:'instant'});}
const text=(id,s)=>{$id(id).textContent=String(s);};
const elapsed=()=>game?Math.max(0,(Date.now()-game.start)/1000):0;
const fmt=n=>`${Math.floor(Math.max(0,n)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,n)%60).toString().padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function latexMarkup(raw,topic,asFormula=false){
 try{return window.LigaLatex[asFormula?'formula':'inline'](String(raw),topic);}
 catch(_){return String(raw).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
}
function showLatex(id,raw,topic,asFormula=false){document.getElementById(id).innerHTML=latexMarkup(raw,topic,asFormula);}

function mountTopics(){const root=$id('topicGroups');for(let i=0;i<groups.length;i++){
  const group=groups[i];const section=document.createElement('details');section.open=i===0;
  if(i===0||i===4){const block=document.createElement('h2');block.className='blocktitle';block.textContent=i===0?'🌱 Блок 1 · Основы и приёмы устного счёта':'🎓 Блок 2 · Дроби и делимость';root.appendChild(block);}section.className='group';
  const heading=document.createElement('summary');heading.className='topic-group-summary';heading.textContent=group.icon+' '+group.title;section.appendChild(heading);
  const sub=document.createElement('p');sub.textContent=group.subtitle;section.appendChild(sub);
  const grid=document.createElement('div');grid.className='topics';
  for(const t of topics.filter(t=>t.group===i)){
   const btn=document.createElement('button');btn.type='button';btn.className='topic';btn.dataset.topic=t.id;
   const emoji=document.createElement('span');emoji.className='topic-icon';emoji.textContent=t.icon;
   const copy=document.createElement('span'),title=document.createElement('strong'),sample=document.createElement('small');title.textContent=t.title;sample.innerHTML=latexMarkup(t.sample,t.id,true);
   copy.append(title,sample);btn.append(emoji,copy);btn.addEventListener('click',()=>{selectedTopic=t.id;if(level===5)level=1;section.open=true;refreshSelection();$id('configPanel').scrollIntoView({behavior:'smooth',block:'nearest'});});grid.appendChild(btn);
  }
  // Самостоятельный подбор — отдельная карточка в первом блоке, не под обычной темой.
  if(i===0){
   const manual=document.createElement('button');manual.type='button';manual.id='manualSummandsTopic';
   manual.className='topic manual-topic';manual.setAttribute('aria-pressed','false');
   manual.innerHTML='<span class="topic-icon" aria-hidden="true">🧩</span><span><strong>Подбери слагаемые сам</strong><small>Дополнительная тренировка · разложение на 2–3 части</small></span>';
   manual.addEventListener('click',()=>{selectedTopic='decompose';level=5;selectedMode='learn';section.open=true;refreshSelection();$id('configPanel').scrollIntoView({behavior:'smooth',block:'nearest'});});
   grid.appendChild(manual);
  }
  section.appendChild(grid);root.appendChild(section);
 }
 for(const [name,topic] of [['allTopics','all'],['advancedTopics','all-advanced']])$id(name).addEventListener('click',()=>{selectedTopic=topic;refreshSelection();$id('configPanel').scrollIntoView({behavior:'smooth',block:'nearest'});});
}
function updateStats(){const ss=saved.sessions,total=ss.reduce((s,p)=>s+p.total,0),correct=ss.reduce((s,p)=>s+p.correct,0);
 text('statSessions',ss.length);text('statAccuracy',total?Math.round(correct/total*100)+'%':'—');
 text('statRecord',ss.filter(s=>s.mode==='sprint').reduce((m,s)=>Math.max(m,Math.round(s.correct*60/Math.max(1,s.seconds))),0));
 text('statMistakes',saved.mistakes.length);
}
function refreshSelection(){
 if(selectedTopic!=='decompose'&&level===5)level=4;
 const manualActive=selectedTopic==='decompose'&&level===5;
 const manualCard=$id('manualSummandsTopic');
 manualCard.classList.toggle('active',manualActive);
 manualCard.setAttribute('aria-pressed',String(manualActive));
 document.querySelector('[data-level="5"]').classList.toggle('hidden',selectedTopic!=='decompose');
 document.querySelectorAll('[data-topic]').forEach(el=>{const active=el.dataset.topic===selectedTopic&&!manualActive;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
 for(const [name,id] of [['allTopics','all'],['advancedTopics','all-advanced']]){$id(name).classList.toggle('active',selectedTopic===id);$id(name).setAttribute('aria-pressed',String(selectedTopic===id));}
 document.querySelectorAll('[data-mode]').forEach(el=>{const active=el.dataset.mode===selectedMode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('[data-level]').forEach(el=>{const active=Number(el.dataset.level)===level;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('[data-duration]').forEach(el=>{const active=Number(el.dataset.duration)===duration;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
 $id('sprintOptions').classList.toggle('hidden',selectedMode!=='sprint');
 document.querySelectorAll('[data-quick-mode]').forEach(el=>{const active=el.dataset.quickMode===selectedMode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
 text('summaryTitle',level===5&&selectedTopic==='decompose'?'🧩 Подбери слагаемые сам':byId[selectedTopic]?.title||'Смешанный тренажёр');
 text('summaryMethod',level===5&&selectedTopic==='decompose'?'Раздели второе число на 2–3 части. Все верные разложения принимаются, а удобство оценивается отдельно.':selectedMode==='sprint'?'На скорость, без подсказок':selectedMode==='learn'?'Сначала способ, затем самостоятельный счёт':'Повтори приём и закрепи навык');
 $id('previewGuide').classList.toggle('hidden',!window.LigaLessons.has(selectedTopic)||(selectedTopic==='decompose'&&level!==5));
 const t=byId[selectedTopic];
 if(manualActive){
  text('previewTitle','🧩 Подбери слагаемые сам');
  text('previewSample','38 + 27 = 38 + □ + □');
  text('previewLabel','Дополнительное задание · Блок 1');
  text('previewExplanation','Разложи второе число на два или три удобных слагаемых. Введи свой способ и проверь сумму.');
 }else if(t){text('previewTitle',t.icon+' '+t.title);showLatex('previewSample',t.sample,t.id,true);text('previewLabel',groups[t.group].title);text('previewExplanation',t.method);}
 else{text('previewTitle',selectedTopic==='all'?'🎲 Все 12 тем блока 1':'🎓 Все 4 темы блока 2');text('previewSample',selectedTopic==='all'?'8 = 5 + ?  ·  7 × 8 = ?':'354 делится на 3? · 1/4 + 2/4');text('previewLabel','Смешанная тренировка');text('previewExplanation','Примеры выбираются из соответствующего блока. Сначала лучше потренировать одну тему.');}
 const belongs=p=>selectedTopic==='all'?byId[p.topic]?.group<4:selectedTopic==='all-advanced'?byId[p.topic]?.group===4:p.topic===selectedTopic;
 const err=saved.mistakes.filter(belongs).length;
 text('startNote',selectedTopic==='decompose'&&level===5?'Самостоятельное разложение: укажи 2 или 3 натуральных слагаемых. Проверяем сумму и рекомендуем рациональный способ.':selectedMode==='mistakes'?`На повторение для выбранной темы: ${err}. Верно решённые примеры удаляются из списка ошибок.`:
    selectedMode==='learn'?'Учебный режим: 10 заданий, подсказки и подробное объяснение после ответа.':
    selectedMode==='sprint'?`Спринт на ${duration} секунд: без подсказок и с автоматической сменой примеров.`:
    'Тренировка: 15 заданий без ограничения времени; можно попросить подсказку.');
 $id('start').disabled=selectedMode==='mistakes'&&err===0;
}
function endTimers(){if(timer){clearInterval(timer);timer=null;}if(autoNext){clearTimeout(autoNext);autoNext=null;}}
function chooseTask(){if(game.mode==='mistakes')return game.queue[game.index]||null;
 let task,tries=0;do{
  const pool=game.topic==='all'?topics.filter(t=>t.group<4):game.topic==='all-advanced'?topics.filter(t=>t.group===4):null;
  const topic=pool?pool[Math.floor(Math.random()*pool.length)].id:game.topic;
  task=make(topic,game.effectiveLevel);tries++;
 }while(task.key===game.prevKey&&tries<24);
 return task;
}
function openLesson(preview){
 if(!window.LigaLessons.has(selectedTopic))return;
 lessonState={topic:selectedTopic,variant:window.LigaLessons.defaultVariant(selectedTopic,level),step:0,preview:!!preview};
 renderLesson();show('lesson');
}
function renderLesson(){
 const L=window.LigaLessons,def=L.lessons[lessonState.topic],v=def.variants[lessonState.variant],st=v.steps[lessonState.step];
 text('lessonTitle',def.title);const root=$id('lessonVariants');root.replaceChildren();
 def.variants.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.className='lesson-variant'+(i===lessonState.variant?' active':'');b.textContent=item.name;b.setAttribute('aria-pressed',String(i===lessonState.variant));b.addEventListener('click',()=>{lessonState.variant=i;lessonState.step=0;renderLesson();});root.appendChild(b);});
 text('lessonIndex',`Шаг ${lessonState.step+1} из ${v.steps.length}`);text('lessonStepTitle',st[0]);
 $id('lessonFormula').innerHTML=L.formula(st[1],lessonState.topic);text('lessonExplanation',st[2]);
 $id('lessonPrev').disabled=lessonState.step===0;
 text('lessonNext',lessonState.step===v.steps.length-1?'Практика →':'Следующий шаг →');
}
function lessonNext(){const v=window.LigaLessons.lessons[lessonState.topic].variants[lessonState.variant];
 if(lessonState.step<v.steps.length-1){lessonState.step++;renderLesson();return;}
 window.LigaLessons.markSeen(window.LigaLessons.idFor(lessonState.topic,level));launchGame();
}
function learnerHint(){if(!game||game.finished||game.mode==='sprint')return;const p=game.current;if(!p)return;
 if(!hintStep){const method=byId[p.topic]?.method||'Проверь последовательность действий.';
 text('hint','💡 Вспомни правило: '+method);hintStep=1;text('hintButton','Показать первый шаг →');}
 else {text('hint','💡 Начни так: '+p.hint);hintStep=2;text('hintButton','Скрыть подсказку');}
 $id('hint').classList.remove('hidden');}
function begin(){
 if(selectedMode==='learn'&&window.LigaLessons.has(selectedTopic)&&(selectedTopic!=='decompose'||level===5)&&!window.LigaLessons.isSeen(window.LigaLessons.idFor(selectedTopic,level))){openLesson(false);return;}
 launchGame();}
function launchGame(){if(selectedMode==='mistakes'&&!saved.mistakes.some(p=>selectedTopic==='all'?byId[p.topic]?.group<4:selectedTopic==='all-advanced'?byId[p.topic]?.group===4:p.topic===selectedTopic))return;
 endTimers();const queue=selectedMode==='mistakes'?saved.mistakes.filter(p=>selectedTopic==='all'?byId[p.topic]?.group<4:selectedTopic==='all-advanced'?byId[p.topic]?.group===4:p.topic===selectedTopic).slice(-20).reverse().map(p=>({...p})):[];
 game={mode:selectedMode,topic:selectedTopic,level,effectiveLevel:level,duration,queue,index:0,target:selectedMode==='learn'?10:selectedMode==='practice'?15:queue.length,correct:0,wrong:0,streak:0,bestStreak:0,consecutiveWrong:0,answered:false,current:null,start:Date.now(),questionStart:Date.now(),lastTime:0,history:[],prevKey:'',finished:false};
 text('gameTitle',selectedTopic==='decompose'&&level===5?'🧩 Подбери слагаемые сам':selectedTopic==='all'?'Смешанная тренировка блока 1':selectedTopic==='all-advanced'?'Смешанная тренировка блока 2':byId[selectedTopic].title);
 text('gameMode', {learn:'📘 Изучаю приём',practice:'🎯 Закрепляю',sprint:'⚡ Считаю на скорость',mistakes:'🔁 Работа над ошибками'}[selectedMode]);
 show('play');nextQuestion();tick();timer=setInterval(tick,100);
}
function tick(){if(!game||game.finished)return;
 const e=elapsed();const remain=Math.max(0,game.duration-e);
 text('clock',game.mode==='sprint'?fmt(Math.ceil(remain)):fmt(e));
 $id('clock').classList.toggle('warning',game.mode==='sprint'&&remain<=10);
 if(game.mode==='sprint')$id('progressbar').style.width=(remain/game.duration*100)+'%';
 if(game.mode==='sprint'&&remain<=0)finish();
}
function nextQuestion(){if(!game||game.finished)return;
 if(game.mode!=='sprint'&&game.index>=game.target){finish();return;}
 let task=chooseTask();if(!task){finish();return;}
 game.current=task;game.prevKey=task.key;game.answered=false;game.questionStart=Date.now();
 text('questionLabel',task.kind==='split'?'СВОБОДНОЕ РАЗЛОЖЕНИЕ · СВОЙ СПОСОБ':byId[task.topic].title);showLatex('question',task.expression,task.topic,true);
 const split=task.kind==='split';
 $id('standardAnswer').classList.toggle('hidden',split);$id('splitAnswer').classList.toggle('hidden',!split);$id('answer').required=!split;
 document.body.classList.toggle('split-input-mode',split);
 if(split){$id('splitTaskText').textContent=`Разложи ${task.target} на два или три положительных слагаемых:`;
 ['splitPart1','splitPart2','splitPart3'].forEach(id=>{$id(id).value='';$id(id).disabled=false;});
 $id('splitPart3').classList.add('hidden');$id('splitPlus3').classList.add('hidden');
 $id('splitThirdButton').classList.remove('hidden');$id('splitCheck').disabled=false;activeSplitInput=$id('splitPart1');}
 else{activeSplitInput=null;}
 $id('question').classList.toggle('chain',task.topic==='chain'||task.expression.length>38);
 $id('answer').value='';$id('answer').disabled=false;$id('check').classList.remove('hidden');$id('next').classList.add('hidden');
 $id('numpad').classList.toggle('hidden',task.kind==='yesno');$id('yesno').classList.toggle('hidden',task.kind!=='yesno');
 $id('answer').dataset.entryKind=task.kind==='rational'&&(task.topic==='fractions'||task.topic==='mixed')?task.topic:'';
 $id('answer').placeholder=task.kind==='yesno'?'Да или нет':task.kind==='rational'?'1/2 или 2 1/3':'?';$id('answer').setAttribute('inputmode',task.kind==='rational'?'text':'numeric');
 $id('hint').classList.add('hidden');$id('hint').textContent='';hintStep=0;text('hintButton','💡 Как начать?');$id('feedback').textContent='';$id('feedback').className='feedback';
 $id('helpNear').classList.toggle('hidden',game.mode==='sprint');
 text('counter',game.mode==='sprint'?`Пример ${game.index+1}`:`Пример ${game.index+1} из ${game.target}`);
 text('correct',game.correct);text('streak',game.streak);text('skill',`Уровень ${game.effectiveLevel}`);
 if(game.mode!=='sprint')$id('progressbar').style.width=(game.index/game.target*100)+'%';
 if(window.matchMedia('(min-width: 680px)').matches)(split?$id('splitPart1'):$id('answer')).focus({preventScroll:true});
}
function toggleHint(){if(!game||game.mode==='sprint'||game.answered)return;if(hintStep>=2){$id('hint').classList.add('hidden');hintStep=0;text('hintButton','💡 Как начать?');return;}learnerHint();}
function addMistake(p){const m=saved.mistakes.find(x=>x.key===p.key);if(m){m.errors=(m.errors||1)+1;m.lastAt=new Date().toISOString();}else saved.mistakes.push({...p,errors:1,lastAt:new Date().toISOString()});saved.mistakes=saved.mistakes.slice(-100);persist();}
function submit(){if(!game||game.finished||game.answered)return;if(game.mode==='sprint'&&elapsed()>=game.duration){finish();return;}
 const p=game.current;
 const raw=p.kind==='split'?['splitPart1','splitPart2',...(!$id('splitPart3').classList.contains('hidden')?['splitPart3']:[])].map(id=>$id(id).value.trim()).join(' + '):$id('answer').value.trim();
 const checked=window.MathTrainer.check(p,raw);
 if(!checked.valid){text('feedback',checked.message);$id('feedback').className='feedback wrong';return;}
 const value=checked.user,right=checked.correct,time=Math.round((Date.now()-game.questionStart)/10)/100;
 game.index++;game.answered=true;game.history.push({topic:p.topic,expression:p.expression,answer:p.answer,user:value,correct:right,seconds:time,solution:p.kind==='split'?`${checked.reason} ${p.solution}`:p.solution});
 $id('answer').disabled=true;$id('check').classList.add('hidden');
 if(p.kind==='split'){$id('splitCheck').disabled=true;['splitPart1','splitPart2','splitPart3'].forEach(id=>$id(id).disabled=true);}
 $id('hint').classList.add('hidden');
 if(right){game.correct++;game.streak++;game.bestStreak=Math.max(game.bestStreak,game.streak);game.consecutiveWrong=0;
  if(game.mode==='mistakes'){saved.mistakes=saved.mistakes.filter(x=>x.key!==p.key);persist();}
  showLatex('feedback',p.kind==='split'?`✅ Верно! ${checked.reason} ${p.solution}`:game.mode==='sprint'?'✅ Верно!':`✅ Правильно! ${p.solution}`,p.topic);$id('feedback').className='feedback correct';
 }else{game.wrong++;game.streak=0;game.consecutiveWrong++;addMistake(p);
  showLatex('feedback',p.kind==='split'?`❌ ${checked.reason} ${p.solution}`:game.mode==='sprint'?`✗ Ответ: ${p.answer}`:`❌ Верный ответ: ${p.answer}. ${p.solution}`,p.topic);$id('feedback').className='feedback wrong';}
 if(game.mode==='practice'&&game.current?.topic!=='fractions'){
  if(game.streak>=4&&game.streak%4===0)game.effectiveLevel=Math.min(game.level===5?5:4,game.effectiveLevel+1);
  if(game.consecutiveWrong>=2){game.effectiveLevel=Math.max(game.level===5?5:1,game.effectiveLevel-1);game.consecutiveWrong=0;}
 }
 text('correct',game.correct);text('streak',game.streak);
 if(game.mode==='sprint'){autoNext=setTimeout(()=>{autoNext=null;nextQuestion();},right?240:550);}
 else{$id('progressbar').style.width=(game.index/game.target*100)+'%';$id('next').classList.remove('hidden');text('next',game.index>=game.target?'Посмотреть результат →':'Следующий пример →');$id('next').focus({preventScroll:true});}
}
function finish(){if(!game||game.finished)return;game.finished=true;endTimers();
 const seconds=Math.max(0.01,Math.min(game.mode==='sprint'?game.duration:Number.MAX_SAFE_INTEGER,elapsed()));
 const total=game.history.length,pct=total?Math.round(game.correct/total*100):0;
 const avg=total?(game.history.reduce((s,p)=>s+p.seconds,0)/total):null;
 if(total>0)saved.sessions.push({id:'topics-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),kind:'topics',date:new Date().toISOString(),topic:game.topic,mode:game.mode,level:game.level,seconds:Math.round(seconds),total,correct:game.correct,wrong:game.wrong,avgSeconds:avg,history:game.history});if(saved.sessions.length>450)saved.sessions=saved.sessions.slice(-450);persist();
 text('resultTitle',total===0?'Начни с первого задания!':pct>=95?'Прекрасный результат!':pct>=80?'Очень хорошо!':pct>=60?'Продолжай тренироваться!':'Потренируем приём ещё раз');
 text('resultSubtitle',game.mode==='sprint'?`${game.correct} правильных ответов за ${game.duration} секунд · точность`:'Точность выполнения заданий');
 text('percent',pct+'%');text('resCorrect',game.correct);text('resTotal',total);text('resTime',fmt(seconds));text('resSpeed',avg===null?'—':avg.toFixed(1)+' с');
 text('resultAdvice',game.mode==='sprint'?`Темп: ${(game.correct*60/Math.max(seconds,1)).toFixed(1)} правильных ответов в минуту. Сначала точность, потом скорость.`:
  pct>=90?'Приём освоен достаточно уверенно. Можно перейти к следующей теме или проверить скорость.':
  'Полезно открыть примеры с ошибками и повторить эту тему в режиме «Учусь».');
 $id('history').innerHTML=game.history.length?game.history.map(h=>`<li class="${h.correct?'ok':'bad'}">${esc(byId[h.topic]?.title||h.topic)}: ${latexMarkup(h.expression,h.topic,true)} — ${h.correct?'✓':'✗'} ваш ответ ${esc(h.user)}, верно ${latexMarkup(h.answer,h.topic)} (${h.seconds} с). ${latexMarkup(h.solution,h.topic)}</li>`).join(''):'<li>Пока нет ответов.</li>';
 show('results');updateStats();refreshSelection();
}
function exportPDF(){
 if(!game||!game.finished)return;
 const record=saved.sessions[saved.sessions.length-1];
 if(!record)return;
 const localHistory=(record.history||[]).map(h=>({...h,topicName:byId[h.topic]?.title||h.topic||''}));
 const name=byId[record.topic]?.title|| (record.topic==='all'?'Смешанная тренировка — блок 1':record.topic==='all-advanced'?'Смешанная тренировка — блок 2':'Тематический тренажёр');
 window.LigaSessionPDF.open({...record,topicName:name,history:localHistory});
}
mountTopics();updateStats();refreshSelection();
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{selectedMode=el.dataset.mode;refreshSelection();}));
document.querySelectorAll('[data-level]').forEach(el=>el.addEventListener('click',()=>{level=Number(el.dataset.level);refreshSelection();}));
document.querySelectorAll('[data-duration]').forEach(el=>el.addEventListener('click',()=>{duration=Number(el.dataset.duration);refreshSelection();}));
$id('start').addEventListener('click',begin);
$id('answerForm').addEventListener('submit',event=>{event.preventDefault();submit();});
$id('hintButton').addEventListener('click',toggleHint);
$id('next').addEventListener('click',nextQuestion);
$id('stop').addEventListener('click',finish);
$id('retry').addEventListener('click',begin);
$id('back').addEventListener('click',()=>{endTimers();game=null;show('home');});
$id('sessionPdfButton').addEventListener('click',exportPDF);
$id('splitThirdButton').addEventListener('click',()=>{$id('splitPart3').classList.remove('hidden');$id('splitPlus3').classList.remove('hidden');$id('splitThirdButton').classList.add('hidden');activeSplitInput=$id('splitPart3');});
['splitPart1','splitPart2','splitPart3'].forEach(id=>$id(id).addEventListener('focus',e=>activeSplitInput=e.target));
$id('previewGuide').addEventListener('click',()=>openLesson(true));
 $id('lessonNext').addEventListener('click',lessonNext);
 $id('lessonPrev').addEventListener('click',()=>{lessonState.step=Math.max(0,lessonState.step-1);renderLesson();});
 $id('lessonBack').addEventListener('click',()=>show('home'));
 document.querySelectorAll('[data-quick-mode]').forEach(el=>el.addEventListener('click',()=>{selectedMode=el.dataset.quickMode;refreshSelection();}));
$id('numpad').addEventListener('click',event=>{const btn=event.target.closest('[data-key]');if(!btn||!game||game.finished||game.answered)return;
 const split=game.current?.kind==='split',input=split?(activeSplitInput||$id('splitPart1')):$id('answer'),k=btn.dataset.key;
 if(split&&k==='+'){
  if(input.id==='splitPart1')activeSplitInput=$id('splitPart2');
  else if(input.id==='splitPart2'){
   if($id('splitPart3').classList.contains('hidden'))$id('splitThirdButton').click();
   activeSplitInput=$id('splitPart3');
  }
  if(window.matchMedia('(min-width: 680px)').matches)activeSplitInput.focus({preventScroll:true});
  return;
 }
 if(split&&!/^[0-9]$/.test(k)&&k!=='back')return;if(k==='back')input.value=input.value.slice(0,-1);else if(k==='−'){input.value=input.value.startsWith('-')?input.value.slice(1):'-'+input.value;}else if(input.value.length<22)input.value+=k;
 if(window.matchMedia('(min-width: 680px)').matches)input.focus({preventScroll:true});
});
 $id('yesno').addEventListener('click',e=>{const btn=e.target.closest('[data-yn]');if(!btn||!game||game.answered)return;$id('answer').value=btn.dataset.yn;submit();});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&game&&!game.finished&&game.answered&&game.mode!=='sprint'&&!$id('play').classList.contains('hidden')){e.preventDefault();nextQuestion();}});

})();