/* Проверка уровней умножения на круглые числа — Лига знаний 6.9. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=6915;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ctx={window:{},Math:math,Date};
vm.runInNewContext(fs.readFileSync('ustny-schet/topics/engine.js','utf8'),ctx);
const E=ctx.window.MathTrainer;
assert.equal(E.topics.length,17);
assert.equal(E.topics.filter(t=>t.group===1).length,4);
const stats={};
for(const level of [1,2,3,4]){
 let distribution={ten:0,hundred:0,thousand:0,round:0};
 let seen=new Set(),examples=[];
 for(let n=0;n<3600;n++){
  const t=E.make('multiply_round',level);
  assert.equal(t.level,level);
  assert.equal(t.roundScheme,69);
  assert.ok(t.key&&t.hint&&t.solution);
  const m=t.expression.match(/^(\d+) × (\d+) = \?$/);
  assert.ok(m,t.expression);
  const a=Number(m[1]),b=Number(m[2]);
  assert.ok(Number.isSafeInteger(t.answer)&&t.answer>0);
  assert.equal(t.answer,a*b,t.expression);
  assert.ok(E.check(t,String(a*b)).correct,t.expression);
  assert.equal(E.check(t,String(a*b+1)).correct,false);
  if(level===1){assert.ok(a>=2&&a<=99);assert.ok([10,100,1000].includes(b),'Начальный только на 10, 100, 1000: '+t.expression);}
  if(level===2){assert.ok(a>=20&&a<=90&&a%10===0,'Базовый: первый множитель круглый');assert.ok([20,30,40,50,60,70,80,90,100,200,300,400,500].includes(b));}
  if(level===3){assert.ok(a>=11&&a<=99&&a%10!==0,'Уверенный: двузначное некруглое число');assert.ok(b>=20&&b%10===0);}
  if(level===4){assert.ok(a>=100&&a<=990&&a%10===0,'Профи: трёхзначное круглое число');assert.ok(b>=20&&b%10===0);}
  distribution[b===10?'ten':b===100?'hundred':b===1000?'thousand':'round']++;
  seen.add(t.expression);if(examples.length<3)examples.push(t.expression);
 }
 assert.ok(seen.size>40,'Мало случайных комбинаций');
 if(level===1){assert.ok(distribution.ten>500&&distribution.hundred>500&&distribution.thousand>500);}
 if(level>=2)assert.ok(distribution.round>600,'Недостаточно заданий на круглые множители');
 stats[level]={unique:seen.size,distribution,examples};
}
// Регрессия: обычные таблицы и деление на круглые числа НЕ меняются.
for(const level of [1,2,3,4]){
 for(const topic of ['multiply','divide','divide_round','tens']){
  for(let i=0;i<1400;i++){
   const p=E.make(topic,level),m=p.expression.match(/^(\d+) ([+−×÷]) (\d+) = \?$/);
   assert.ok(m);const a=+m[1],op=m[2],b=+m[3],answer=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b;
   assert.equal(p.answer,answer);
   assert.ok(E.check(p,String(answer)).correct);
   if(topic==='tens')assert.ok(['+','−'].includes(op));
   if(topic==='multiply')assert.ok(a>=2&&a<=9&&b>=2&&b<=9);
   if(topic==='divide')assert.ok(b>=2&&b<=9&&answer>=2&&answer<=9);
   if(topic==='divide_round')assert.equal(a%b,0);
  }
 }
}
const lessons=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
for(const example of ['5 × 10 = 50','5 × 100 = 500','13 × 10 = 130','43 × 1000 = 43000','50 × 20 = 1000','30 × 200 = 6000','12 × 20 = 240','45 × 500 = 22500','120 × 20 = 2400'])assert.ok(lessons.includes(example),'Отсутствует урок: '+example);
for(const level of ['Начальный: на 10, 100 и 1000','Базовый: круглое на круглое','Уверенный: двузначное число на круглое','Профи: большие круглые числа'])assert.ok(lessons.includes(level));
const preview=fs.readFileSync('ustny-schet/topics/app.js','utf8');
for(const sample of ['5 × 10 = ?','5 × 100 = ?','13 × 10 = ?','43 × 1000 = ?','50 × 20 = ?','30 × 200 = ?','12 × 20 = ?','45 × 500 = ?','120 × 20 = ?'])assert.ok(preview.includes(sample),'Превью: '+sample);
assert.ok(preview.includes("p.roundScheme===69"),'Старые ошибки не должны попадать в новые уровни');
const adaptive=fs.readFileSync('ustny-schet/topics/adaptive.js','utf8');assert.ok(adaptive.includes("p.roundScheme===69"));
console.log('6.9 PASS: 14400 примеров новых уровней + 22400 регрессий по другим темам.',JSON.stringify(stats));
