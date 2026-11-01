/* 6.8: независимые темы табличных действий и круглых чисел. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=6811;const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const root={window:{},Math:math};vm.runInNewContext(fs.readFileSync('ustny-schet/topics/engine.js','utf8'),root);
const E=root.window.MathTrainer;
assert.equal(E.topics.length,17,'Ожидаются 13 тем в первом блоке и 4 во втором');
assert.equal(E.topics.filter(t=>t.group<4).length,13);
assert.equal(E.topics.filter(t=>t.group===4).length,4);
assert.equal(E.topics.filter(t=>t.group===1).length,4,'Нужны четыре карточки табличных навыков');
const ids=E.topics.filter(t=>t.group===1).map(t=>t.id);
for(const id of ['multiply','divide','multiply_round','divide_round'])assert.ok(ids.includes(id));
assert.ok(!ids.includes('round_ops'),'Старую смешанную карточку нужно скрыть');
const result={};
for(const level of [1,2,3,4]){
 result[level]={};
 for(const topic of ['multiply','divide','multiply_round','divide_round','tens']){
  let types={table:0,ten:0,hundred:0,thousand:0,round:0};
  const seen=new Set();
  for(let n=0;n<1800;n++){
   const p=E.make(topic,level);
   assert.ok(p.key&&p.hint&&p.solution);
   assert.equal(p.level,level);
   assert.equal(p.topic,topic);
   const m=p.expression.match(/^(\d+) ([+−×÷]) (\d+) = \?$/);
   assert.ok(m,'Недопустимая форма '+p.expression);
   const a=Number(m[1]),sym=m[2],x=Number(m[3]);
   assert.ok(Number.isSafeInteger(p.answer)&&p.answer>=0);
   const ans=sym==='+'?a+x:sym==='−'?a-x:sym==='×'?a*x:a/x;
   assert.equal(p.answer,ans,'Неверный ответ '+p.expression);
   assert.ok(E.check(p,String(ans)).correct);
   assert.equal(E.check(p,String(ans+1)).correct,false);
   if(topic==='multiply'){assert.equal(sym,'×');assert.ok(a>=2&&a<=9&&x>=2&&x<=9,'Только таблица 2–9');types.table++;}
   if(topic==='divide'){assert.equal(sym,'÷');assert.ok(x>=2&&x<=9&&ans>=2&&ans<=9);types.table++;}
   if(topic==='tens'){assert.ok(['+','−'].includes(sym));assert.equal(x%10,0);types.ten++;}
   if(topic==='multiply_round'||topic==='divide_round'){
    assert.equal(sym,topic==='multiply_round'?'×':'÷');
    assert.ok(x>=10&&x%10===0,'Второй операнд только круглый: '+p.expression);
    if(topic==='divide_round')assert.equal(a%x,0,'Никаких дробных частных');
    const group=x===10?'ten':x===100?'hundred':x===1000?'thousand':'round';
    types[group]++;
    if(level===1)assert.equal(x,10);
    if(level===2)assert.ok([10,100,20,30,40].includes(x));
  }
   seen.add(p.expression);
  }
  assert.ok(seen.size>=(topic==='multiply_round'&&level===1?8:10),'Слишком мало разных заданий '+topic+level);
  if(topic.endsWith('_round')){
   assert.ok(types.ten>=40);
   if(level>=2){assert.ok(types.hundred>=40);assert.ok(types.round>=40);}
   if(level>=3)assert.ok(types.thousand>=40);
  }
  result[level][topic]={unique:seen.size,types};
 }
}
for(const old of ['7 × 8 = 56','56 ÷ 7 = 8','5 × 10 = 50','4 × 100 = 400','6 × 1000 = 6000','240 ÷ 10 = 24','2000 ÷ 100 = 20','240 ÷ 20 = 12','36000 ÷ 3000 = 12']){
 assert.ok(fs.readFileSync('ustny-schet/topics/lessons.js','utf8').includes(old),'Урок '+old);
}
const plan=fs.readFileSync('ustny-schet/plan.js','utf8');
assert.ok(plan.includes("topics:['multiply_round']"),'Нет отдельной тренировки');
assert.ok(!plan.includes("'round_ops'"),'Старая тема в планах');
const preview=fs.readFileSync('ustny-schet/topics/app.js','utf8');
assert.ok(preview.includes("Все 13 тем блока 1")&&preview.includes("multiply_round:['")&&preview.includes("divide_round:['"));
assert.ok(fs.readFileSync('ustny-schet/index.html','utf8').includes('17 тем'));
assert.ok(fs.readFileSync('ustny-schet/app.html','utf8').includes('17 тем'));
const legacy=E.make('round_ops',1);
assert.ok(Number.isInteger(legacy.answer),'Не ломать старые сохранённые задания round_ops');
console.log('6.8 OK: 36000 заданий, 17 тем, 4 отдельные карточки, деление без остатка, уроки и план.');
