/* Устный счёт 6.7 — разделение десятков и табличных навыков. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=67001;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const ctx={window:{},Math:math,Date};vm.runInNewContext(fs.readFileSync('ustny-schet/topics/engine.js','utf8'),ctx);
const E=ctx.window.MathTrainer;
assert.equal(E.topics.length,16,'Сохранить 16 тем');
const topic=(id)=>E.topics.find(t=>t.id===id);
assert.ok(topic('tens')&&topic('multiply')&&topic('divide'));
assert.ok(!/×|÷|умнож|делен/.test(topic('tens').method),'В десятках не должно быть ×/÷');
const results={};
for(const level of [1,2,3,4]){
 const counts={tens:{'+':0,'−':0},multiply:{table:0,10:0,100:0,1000:0},divide:{table:0,10:0,100:0,1000:0}};
 for(let k=0;k<3000;k++){
  for(const id of ['tens','multiply','divide']){
   const p=E.make(id,level);
   assert.equal(p.topic,id);assert.equal(p.level,level);
   assert.ok(p.key&&p.hint&&p.solution);
   assert.ok(Number.isSafeInteger(p.answer)&&p.answer>=0,JSON.stringify(p));
   const m=p.expression.match(/^(\d+) ([+−×÷]) (\d+) = \?$/);
   assert.ok(m,'Неверная форма задания '+p.expression);
   const a=Number(m[1]),symbol=m[2],b=Number(m[3]);
   const expected=symbol==='+'?a+b:symbol==='−'?a-b:symbol==='×'?a*b:a/b;
   assert.equal(p.answer,expected,'Математическая ошибка: '+p.expression);
   const checked=E.check(p,String(p.answer));
   assert.ok(checked.valid&&checked.correct,'Правильный ответ не принят: '+p.expression);
   assert.equal(E.check(p,String(p.answer+1)).correct,false);
   if(id==='tens'){
    assert.ok(['+','−'].includes(symbol),'В десятках запрещены ×, ÷ и последовательности');
    assert.equal(b%10,0,'Слагаемое/вычитаемое должно быть кратно 10');
    if(level===1)assert.equal(a%10,0);
    if(symbol==='−')assert.ok(a>=b);
    counts.tens[symbol]++;
   }else if(id==='multiply'){
    assert.equal(symbol,'×');
    counts.multiply[[10,100,1000].includes(b)?b:'table']++;
    if([100,1000].includes(b))assert.ok(level>=2,'×100/1000 на слишком простом уровне');
    if(b===1000)assert.ok(level>=3);
   }else{
    assert.equal(symbol,'÷');assert.equal(a%b,0);
    counts.divide[[10,100,1000].includes(b)?b:'table']++;
    if([100,1000].includes(b))assert.ok(level>=2);
    if(b===1000)assert.ok(level>=3);
   }
  }
 }
 assert.ok(counts.tens['+']>1000&&counts.tens['−']>1000);
 for(const id of ['multiply','divide']){
  assert.ok(counts[id].table>400&&counts[id][10]>100,'Таблица и на 10 должны чередоваться');
  if(level>=2)assert.ok(counts[id][100]>80,'Не генерируется ×/÷100');
  if(level>=3)assert.ok(counts[id][1000]>50,'Не генерируется ×/÷1000');
 }
 results[level]=counts;
}
const lessons=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
for(const sample of ['20 + 10 = 30','40 − 10 = 30','25 + 20 = 45','45 − 10 = 35','5 × 10 = 50','4 × 100 = 400','6 × 1000 = 6000','240 ÷ 10 = 24','2000 ÷ 100 = 20','24000 ÷ 1000 = 24']){
 assert.ok(lessons.includes(sample),'Нет пояснения к '+sample);
}
assert.ok(lessons.includes('Табличное умножение и умножение на 10, 100, 1000'));
assert.ok(lessons.includes('Табличное деление и деление на 10, 100, 1000'));
const plan=fs.readFileSync('ustny-schet/plan.js','utf8');
assert.ok(plan.includes('Только сложение и вычитание десятков'));
const app=fs.readFileSync('ustny-schet/topics/app.js','utf8');
assert.ok(app.includes('2000 ÷ 100 = ?')&&app.includes('6 × 1000 = ?'));
console.log('Проверено 36000 заданий: десятки только +/−, табличные ×/÷ до 1000 на 4 уровнях.',JSON.stringify(results));
