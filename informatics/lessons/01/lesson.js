(function(root){
'use strict';
const data=typeof module!=='undefined'&&module.exports?require('./data.js'):root.InfoLessonData;
const KEY='liga_informatics_lesson01_v1',MAX_GOALS=30;
const entries=new Map(),required=[];
function register(items,prefix,stage){items.forEach((item,i)=>{const id=prefix+i;entries.set(id,{stage,correct:item.a,options:item.opts.length});required.push(id);});}
register(data.senses,'s',2);register(data.processes,'p',3);
for(const [prefix,items,stage] of [['safe',data.safety,4],['work',data.workplace,5]])items.forEach((item,i)=>{const id=prefix+i;entries.set(id,{stage,correct:item[1]?1:null,options:2});if(item[1])required.push(id);});
register(data.quiz,'q',6);
const rewardIds=new Set(required);
const fresh=()=>({version:2,step:0,done:{},answers:{},earned:[],completed:false,completedAt:null,lastActivity:null});
function normalize(raw){
 const s=fresh();if(!raw||typeof raw!=='object')return s;
 s.step=Number.isInteger(raw.step)?Math.max(0,Math.min(6,raw.step)):0;
 const earned=new Set(Array.isArray(raw.earned)?raw.earned.filter(id=>rewardIds.has(id)):[]);
 for(const [id,entry] of entries){
  const choice=raw.answers&&raw.answers[id];
  if(Number.isInteger(choice)&&choice>=0&&choice<entry.options){s.answers[id]=choice;s.done[id]=choice===entry.correct?1:0;}
  else if(raw.done&&[0,1].includes(raw.done[id]))s.done[id]=raw.done[id];
  if(s.done[id]===1&&rewardIds.has(id))earned.add(id);
 }
 s.earned=[...earned];s.completed=raw.completed===true;
 s.completedAt=typeof raw.completedAt==='string'&&Number.isFinite(Date.parse(raw.completedAt))?raw.completedAt:null;
 s.lastActivity=typeof raw.lastActivity==='string'&&Number.isFinite(Date.parse(raw.lastActivity))?raw.lastActivity:null;
 return s;
}
function goals(s){return new Set(s.earned.filter(id=>rewardIds.has(id))).size;}
function attemptGoals(s){return required.filter(id=>s.done[id]===1).length;}
function firstIncomplete(s){const id=required.find(id=>s.answers[id]===undefined);return id?entries.get(id).stage:null;}
function answer(s,id,value){
 const entry=entries.get(id);
 if(!entry||s.answers[id]!==undefined||!Number.isInteger(value)||value<0||value>=entry.options)return {accepted:false,correct:false,awarded:false};
 const correct=value===entry.correct;s.answers[id]=value;s.done[id]=correct?1:0;
 const awarded=correct&&rewardIds.has(id)&&!s.earned.includes(id);
 if(awarded)s.earned.push(id);s.lastActivity=new Date().toISOString();
 return {accepted:true,correct,awarded};
}
function restart(s){const next=fresh();next.earned=[...s.earned];next.completed=s.completed;next.completedAt=s.completedAt;next.lastActivity=s.lastActivity;return next;}
function complete(s){const nextStep=firstIncomplete(s);if(nextStep!==null)return {completed:false,nextStep};s.completed=true;s.completedAt=new Date().toISOString();s.lastActivity=s.completedAt;return {completed:true,nextStep:null};}
const api={KEY,MAX_GOALS,data,normalize,goals,attemptGoals,firstIncomplete,answer,restart,complete,entries,required};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
root.LigaInformaticsLesson1=api;
const $=id=>document.getElementById(id),steps=[...document.querySelectorAll('.step')];
let state=fresh(),storageAvailable=true;
try{state=normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){if(!(e instanceof SyntaxError))storageAvailable=false;}
function save(){
 if(!storageAvailable)return;
 try{
  let previous;try{previous=normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){previous=fresh();}
  state.earned=[...new Set([...previous.earned,...state.earned])];
  if(previous.completed){state.completed=true;state.completedAt=state.completedAt||previous.completedAt;}
  localStorage.setItem(KEY,JSON.stringify(state));
 }catch(e){storageAvailable=false;$('notice').textContent='Браузер не разрешает сохранение: результаты доступны до закрытия страницы.';}
}
function pauseVideo(){const video=$('lessonVideo');if(video)video.pause();}
function updateScore(){$('score').textContent='⚽ '+goals(state)+' / 30 голов';}
function renderStep(){
 state.step=Math.max(0,Math.min(6,state.step));
 steps.forEach((step,i)=>step.classList.toggle('active',i===state.step));
 if(state.step!==1)pauseVideo();
 $('stageName').textContent=steps[state.step].dataset.name;
 $('counter').textContent=(state.step+1)+' / '+steps.length;
 $('bar').style.width=(state.step+1)/steps.length*100+'%';
 $('prev').disabled=state.step===0;$('next').style.display=state.step===6?'none':'';
 save();updateScore();window.scrollTo({top:0,behavior:'smooth'});
}
function record(id,value){const result=answer(state,id,value);if(result.accepted){save();updateScore();finishCheck();}return result;}
function exercise(container,items,prefix,feedback){
 const el=$(container);el.replaceChildren();
 items.forEach((item,i)=>{
  const id=prefix+i,chosen=state.answers[id],box=document.createElement('div');box.className='card';
  const title=document.createElement('b');title.textContent=(i+1)+'. '+item.q;box.appendChild(title);
  const choices=document.createElement('div');choices.className='choices';
  item.opts.forEach((option,j)=>{
   const button=document.createElement('button');button.type='button';button.className='choice';button.textContent=option;
   button.setAttribute('data-answer-id',id);button.setAttribute('data-choice',j);
   if(chosen!==undefined){button.disabled=true;if(j===item.a)button.classList.add('correct');else if(j===chosen)button.classList.add('wrong');}
   button.onclick=()=>{const result=record(id,j);if(!result.accepted)return;$(feedback).textContent=(result.correct?'Верно! ':'Пока неверно. ')+item.why;exercise(container,items,prefix,feedback);};
   choices.appendChild(button);
  });box.appendChild(choices);
  if(chosen!==undefined){const note=document.createElement('p');note.className='small';note.textContent=item.why;box.appendChild(note);}
  el.appendChild(box);
 });
}
function renderSafety(){
 const el=$('safety');el.replaceChildren();let found=0;
 data.safety.forEach(([label,bad,why],i)=>{
  const id='safe'+i,button=document.createElement('button'),done=state.answers[id]!==undefined;
  button.type='button';button.textContent=label;button.setAttribute('data-answer-id',id);button.disabled=done;
  if(done){button.classList.add(bad?'found':'notbad');button.textContent+=bad?' ✓':' — это безопасная ситуация';if(bad)found++;}
  button.onclick=()=>{const result=record(id,1);if(!result.accepted)return;$('safetyFeed').textContent=why;renderSafety();};el.appendChild(button);
 });if(found===5)$('safetyFeed').textContent='Все пять опасных ситуаций найдены!';
}
function renderWork(){
 const el=$('workplace');el.replaceChildren();let correct=0;
 data.workplace.forEach(([label,good],i)=>{
  const id='work'+i,button=document.createElement('button'),done=state.answers[id]!==undefined;
  button.type='button';button.textContent=label;button.setAttribute('data-answer-id',id);button.disabled=done;
  if(done){button.classList.add(good?'on':'wrong');button.textContent+=good?' ✓':' — небезопасно';if(good)correct++;}
  button.onclick=()=>{const result=record(id,1);if(!result.accepted)return;$('workFeed').textContent=good?'Верно! Это полезное действие.':'Это небезопасно. Выбери другое действие.';renderWork();};el.appendChild(button);
 });if(correct===5)$('workFeed').textContent='Все пять правильных действий выбраны!';
}
function finishCheck(){
 const answered=data.quiz.every((_,i)=>state.answers['q'+i]!==undefined);
 $('finish').hidden=!answered;
 if(answered)$('summary').textContent='Егор, в этой попытке: '+attemptGoals(state)+' из 30 правильных ответов. Всего накоплено: '+goals(state)+' из 30 голов. '+(firstIncomplete(state)===null?'Все испытания пройдены — можно завершить урок.':'Осталось пройти практические испытания.');
}
$('prev').onclick=()=>{if(state.step>0){state.step--;renderStep();}};
$('next').onclick=()=>{if(state.step<6){state.step++;renderStep();}};
$('restart').onclick=()=>{pauseVideo();state=restart(state);save();['senseFeed','processFeed','safetyFeed','workFeed','quizFeed'].forEach(id=>$(id).textContent='');renderAll();renderStep();$('notice').textContent='Новая попытка началась. Накопленные голы сохранены.';};
$('finishLesson').onclick=()=>{
 const result=complete(state);save();
 if(!result.completed){state.step=result.nextStep;renderStep();$('notice').textContent='Сначала выполни задания на этом этапе, затем заверши урок.';return;}
 pauseVideo();location.href='../../index.html';
};
document.querySelectorAll('[data-return-topics]').forEach(link=>link.addEventListener('click',()=>{pauseVideo();save();}));
window.addEventListener('pagehide',()=>{pauseVideo();save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseVideo();save();}});
const video=$('lessonVideo');
video.addEventListener('error',()=>{$('videoStatus').hidden=false;$('videoStatus').textContent='Видео пока не загрузилось. Попробуй открыть его отдельно по ссылке ниже.';});
video.addEventListener('loadedmetadata',()=>{$('videoStatus').hidden=true;});
video.querySelectorAll('source').forEach(source=>source.addEventListener('error',()=>{$('videoStatus').hidden=false;$('videoStatus').textContent='Не удалось загрузить видео. Открой файл отдельно по ссылке ниже.';}));
function renderAll(){exercise('senses',data.senses,'s','senseFeed');exercise('processes',data.processes,'p','processFeed');renderSafety();renderWork();exercise('quiz',data.quiz,'q','quizFeed');finishCheck();}
renderAll();renderStep();
if(!storageAvailable)$('notice').textContent='Результаты доступны до закрытия страницы: браузер не разрешает сохранение.';
})(typeof window!=='undefined'?window:globalThis);
