/* Регрессионная проверка рандомайзера версии 6.4: все темы и сценарии. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const engine=fs.readFileSync('ustny-schet/topics/engine.js','utf8');
const adaptive=fs.readFileSync('ustny-schet/topics/adaptive.js','utf8');
let seed=20261031;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const context={window:{},Math:math,Date};
vm.runInNewContext(engine,context,{filename:'engine.js'});
vm.runInNewContext(adaptive,context,{filename:'adaptive.js'});
const T=context.window.MathTrainer,A=context.window.LigaAdaptive;
assert.equal(T.topics.length,16,'Ожидается ровно 16 утверждённых тем');
let tested=0;
for(const {id} of T.topics)for(let level=1;level<=4;level++){
 for(let n=0;n<180;n++){
  const p=T.make(id,level);
  assert.equal(p.topic,id);assert.equal(p.level,level);
  assert.ok(p.key&&p.expression&&p.solution,'Полное условие: '+id);
  assert.equal(p.key,A.key(p),'Ключ примера должен быть постоянным');
  const raw=p.kind==='split'?p.parts.join(' + '):String(p.answer);
  const verdict=T.check(p,raw);
  assert.ok(verdict.valid&&verdict.correct,JSON.stringify({id,level,p,verdict}));
  if(p.kind==='split'){
   assert.ok(p.parts.length===2||p.parts.length===3);
   assert.ok(p.parts.every(x=>Number.isSafeInteger(x)&&x>0));
   assert.equal(p.parts.reduce((sum,x)=>sum+x,0),p.target);
   assert.equal(p.operation==='subtract'?p.base-p.target:p.base+p.target>=0,true);
   assert.equal(T.check(p,'0 + 0').correct,false,'Запрещено неверное разложение');
  }else if(p.kind==='yesno'){
   const opposite=p.answer==='да'?'нет':'да';
   assert.equal(T.check(p,opposite).correct,false,'Проверка признака делимости');
  }else if(p.kind==='rational'){
   assert.ok(p.expected && Number.isInteger(p.expected.n) && p.expected.d>0);
   if(id==='fractions')assert.ok(p.expected.n>0&&p.expected.n<p.expected.d,
    'Для обыкновенных дробей должен получаться правильный ответ');
  }else{
   assert.ok(Number.isInteger(p.answer)&&p.answer>=0,'Целый неотрицательный ответ');
  }
  tested++;
 }
}
for(const topic of ['decompose','subtract_parts']){
 const p=T.make(topic,5);
 assert.equal(p.kind,'split');
 assert.ok(T.check(p,p.parts.join(' + ')).correct);
 tested++;
}
// Моделируем длительный спринт: при исчерпании 5 заданий появляется новый
// цикл, но соседние задания не совпадают.
let sequence=0,prev='',cycles=0;
const opts={topics:['sample'],level:2,used:new Set(),review:{},mistakes:[],
 cycle:true,lastKey:'',create:()=>({topic:'sample',level:2,key:'sample|'+(sequence++%5),expression:'example'})};
for(let i=0;i<90;i++){
 const v=A.chooseWithCycle(opts);
 assert.ok(v.task,'Спринт не должен прерываться после первого цикла');
 assert.notEqual(v.task.key,prev,'Соседние примеры не должны совпадать');
 if(v.cycled)cycles++;
 prev=v.task.key;opts.lastKey=prev;opts.used.add(prev);
}
assert.ok(cycles>=1,'Должен произойти переход в новый цикл');
// Кандидат из ошибок не должен нарушать исключения и выбранную сложность.
const history={sessions:[{date:'2026-10-31',history:[
 {topic:'fractions',key:'fractions|1/2 + 1/4 = ?',correct:false},
 {topic:'fractions',key:'fractions|1/2 + 1/4 = ?',correct:true}
]}]};
A.ensure(history);
assert.equal(history.review['fractions|1/2 + 1/4 = ?'].wrong,1);
assert.equal(history.review['fractions|1/2 + 1/4 = ?'].attempts,2);
const mistakes=[{topic:'x',key:'x|error',level:2,errors:4}];
const fresh=()=>({topic:'x',key:'x|new',level:2});
let drawn=0,wrong=0;
for(let i=0;i<1000;i++){
 const p=A.choose({topics:['x'],level:2,create:fresh,used:new Set(),mistakes,review:{}});
 if(p.key==='x|error')wrong++;drawn++;
}
assert.ok(wrong>200&&wrong<360,'Повторение ошибок должно иметь умеренную частоту: '+wrong);
assert.equal(A.choose({topics:['x'],level:2,create:fresh,used:new Set(['x|error']),mistakes,review:{}}).key,'x|new');
assert.equal(A.choose({topics:['x'],level:1,create:fresh,used:new Set(),mistakes,review:{}}).key,'x|new');
console.log('Randomizer QA passed: '+tested+' tasks across 16 topics; '+cycles+' cycle resets; '+wrong+'/'+drawn+' mistake returns.');