/* Регрессионный тест 6.6: счёт в пределах 10, все 4 уровня. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=6601;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const root={window:{},Math:math};
vm.runInNewContext(fs.readFileSync('ustny-schet/topics/engine.js','utf8'),root);
const trainer=root.window.MathTrainer;
assert.equal(trainer.topics.length,17);
assert.equal(trainer.topics.find(t=>t.id==='composition').title,'Счёт в пределах 10');
const statistics={};
for(const level of [1,2,3,4]){
 const count={'+':0,'−':0};
 const keys=new Set();
 for(let i=0;i<1500;i++){
  const p=trainer.make('composition',level);
  assert.equal(p.topic,'composition');assert.equal(p.level,level);
  assert.ok(p.key&&p.hint&&p.solution);
  assert.ok(Number.isInteger(p.answer)&&p.answer>=0&&p.answer<=10,JSON.stringify(p));
  assert.ok(p.operation==='+'||p.operation==='−');
  const m=p.expression.match(/\d+/g).map(Number);
  let expected;
  if(level===1){
   assert.match(p.expression,/^\d+ [+\u2212] \d+ = \?$/);
   assert.equal(m.length,2);
   const [a,b]=m;expected=p.operation==='+'?a+b:a-b;
   assert.ok(a>=1&&a<=10&&b>=1&&b<=10);
  }else if(level===2){
   assert.equal(m.length,2);
   if(p.operation==='+'){assert.match(p.expression,/^[3-7] = \? \+ \d+$/);expected=m[0]-m[1];}
   else{assert.match(p.expression,/^[3-8] \u2212 \? = \d+$/);expected=m[0]-m[1];}
   assert.ok(expected>=1&&expected<=10);
  }else if(level===3){
   assert.equal(m.length,2);assert.equal(m[0],10);
   if(p.operation==='+')assert.match(p.expression,/^10 = \? \+ [1-9]$/);
   else assert.match(p.expression,/^10 \u2212 \? = [1-9]$/);
   expected=10-m[1];assert.ok(expected>=1&&expected<=9);
  }else{
   assert.match(p.expression,/^\d+ [+\u2212] \d+ [+\u2212] \d+ = \?$/);
   assert.equal(m.length,3);
   const [a,b,c]=m;
   if(p.operation==='+'){
    assert.ok(p.expression.includes(' + '));expected=a+b+c;
    assert.ok(a+b<=10);
   }else{
    assert.ok(p.expression.includes(' − '));expected=a-b-c;
    assert.ok(a-b>=0);
   }
  }
  assert.equal(p.answer,expected,JSON.stringify(p));
  assert.ok(trainer.check(p,String(p.answer)).correct,'Должен принять ответ '+p.expression);
  assert.equal(trainer.check(p,String(p.answer+1)).correct,false,'Не должен принять неправильный ответ');
  count[p.operation]++;keys.add(p.expression);
 }
 assert.ok(count['+']>500&&count['−']>500,'Оба действия должны выдаваться на уровне '+level);
 assert.ok(keys.size>=12,'Разнообразие примеров на уровне '+level);
 statistics[level]={operations:count,unique:keys.size};
}
const lesson=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
for(const s of ['4 + 5 = 9','5 − 3 = 2','4 = □ + 2','5 − □ = 3','10 = □ + 8','10 − □ = 7','7 + 1 + 2 = 10','10 − 1 − 2 = 7'])assert.ok(lesson.includes(s),'Урок: '+s);
for(const s of ["composition-v66-level-","topic==='composition'?Math.max(0,Math.min(3"])assert.ok(lesson.includes(s),'Выбор урока: '+s);
const app=fs.readFileSync('ustny-schet/topics/app.js','utf8');
for(const s of ['4 = ? + 2','5 − ? = 3','10 = ? + 8','10 − ? = 7','7 + 1 + 2 = ?','10 − 1 − 2 = ?'])assert.ok(app.includes(s),'Превью: '+s);
console.log('Composition 6.6 tests passed: 6000 tasks, 4 levels, answers, bounds, teaching examples.',JSON.stringify(statistics));
