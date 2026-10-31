/* Устный счёт 6.5 — методические и арифметические проверки темы «Счёт десятками». */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=65;
const randomMath=Object.create(Math);
randomMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const context={window:{},Math:randomMath,Date};
vm.runInNewContext(fs.readFileSync('ustny-schet/topics/engine.js','utf8'),context);
const trainer=context.window.MathTrainer,levels=[1,2,3,4];
assert.equal(trainer.topics.length,16,'Нельзя терять ни одну из 16 тем');
const tens=trainer.topics.find(t=>t.id==='tens');
assert.ok(tens&&tens.title==='Счёт десятками');
const amounts={};
for(const level of levels){
 const counts={'+':0,'−':0,'×':0,'÷':0,sequence:0};
 for(let i=0;i<1800;i++){
  const p=trainer.make('tens',level);
  assert.equal(p.level,level);
  assert.equal(p.topic,'tens');
  assert.ok(p.key&&p.hint&&p.solution);
  assert.ok(Number.isSafeInteger(p.answer)&&p.answer>=0,JSON.stringify(p));
  assert.ok(counts[p.operation]!==undefined,'Неизвестная операция: '+p.operation);
  counts[p.operation]++;
  if(p.operation==='sequence'){
   const m=p.expression.match(/^(\d+), (\d+), (\d+), \?$/);
   assert.ok(m,'Ошибка формата ряда '+p.expression);
   const [a,b,c]=m.slice(1).map(Number);
   assert.equal(c-b,b-a,'Неравный шаг последовательности');
   assert.equal(p.answer,c+(c-b),'Неверный следующий член');
  }else{
   const m=p.expression.match(/^(\d+) ([+−×÷]) (\d+) = \?$/);
   assert.ok(m,'Ошибка формата операции '+p.expression);
   const a=Number(m[1]),symbol=m[2],b=Number(m[3]);
   assert.equal(symbol,p.operation);
   let expected;
   if(symbol==='+'){expected=a+b;assert.equal(b%10,0,'Слагаемое не кратно десяти');}
   if(symbol==='−'){expected=a-b;assert.equal(b%10,0,'Вычитаемое не кратно десяти');assert.ok(a>=b);}
   if(symbol==='×'){expected=a*b;assert.ok(b===10||b===100);}
   if(symbol==='÷'){expected=a/b;assert.ok(b===10||b===100);assert.equal(a%b,0);}
   assert.equal(p.answer,expected,JSON.stringify(p));
   if(level===1&&['×','÷'].includes(symbol))assert.equal(b,10);
   if(level===1&&['+','−'].includes(symbol))assert.equal(a%10,0);
  }
  const check=trainer.check(p,String(p.answer));
  assert.ok(check.valid&&check.correct,'Проверка правильного ответа '+p.expression);
  assert.equal(trainer.check(p,String(p.answer+1)).correct,false,'Проверка неправильного ответа');
 }
 for(const [name,count] of Object.entries(counts))assert.ok(count>=230,'Редко встречается '+name+' (уровень '+level+'): '+count);
 amounts[level]=counts;
}
const lessons=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
for(const task of ['20 + 10 = 30','40 − 10 = 30','25 + 20 = 45','45 − 10 = 35','5 × 10 = 50','4 × 100 = 400','240 ÷ 10 = 24','2000 ÷ 100 = 20']){
 assert.ok(lessons.includes(task),'Учебный пример отсутствует: '+task);
}
const plan=fs.readFileSync('ustny-schet/plan.js','utf8');
assert.ok(plan.includes("Складываем и вычитаем десятки, умножаем и делим на 10"));
console.log('Счёт десятками: 7200 примеров с правильными ответами, 4 уровня, все операции и методические примеры пройдены',JSON.stringify(amounts));
