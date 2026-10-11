'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const data = require('../tasks.js');
const core = require('../core.js');

function memory(seed = {}) {
  const values = new Map(Object.entries(seed)), writes = [];
  return { values, writes, getItem(key) { return values.get(key) ?? null; }, setItem(key,value) { values.set(key,value); writes.push(key); } };
}
const gcd = (a,b) => b ? gcd(b,a%b) : a;
const lcm = (a,b) => a*b/gcd(a,b);
const divisors = n => Array.from({length:n},(_,i)=>i+1).filter(d=>n%d===0);
function permutations(values) { return values.length ? values.flatMap((v,i)=>permutations(values.filter((_,j)=>i!==j)).map(p=>[v,...p])) : [[]]; }
const permutationNumbers = permutations([0,2,5,7]).filter(p=>p[0]!==0).map(p=>Number(p.join('')));
const boxes = [];
for(let red=6;red<100;red++)for(let blue=1;blue<100;blue++)if(red+6===2*blue && red-6===blue)boxes.push(red+blue);
const answers = {
  n1:Math.floor(705406/1000)%10*1000,n2:24/3*9,n3:63708-60738,n4:7483405-300000+2000,n5:Math.max(...permutationNumbers)-Math.min(...permutationNumbers),n6:24,
  d1:Array.from({length:10},(_,x)=>x).find(x=>(4308+x*10)%9===0),
  d2:Array.from({length:10},(_,x)=>x).find(x=>(5204+x*10)%3===0&&(5204+x*10)%4===0),
  d3:Math.ceil(10000/36)*36,d4:divisors(360).length,d5:Array.from({length:100},(_,i)=>101+i).find(n=>divisors(n).length===3),
  g1:gcd(84,126),g2:lcm(18,24),g3:(84+126)/gcd(84,126),g4:lcm(lcm(12,18),30),g5:6*180/30,g6:gcd(24,36),
  o1:840-36*15+180/6,o2:125*48-125*32,o3:17*24+9,o4:(1560/24+35)*18-17*100,o5:Array.from({length:10},(_,x)=>x).find(x=>(1230+x)%11===0),o6:(840-360)/12+7*8,
  e1:(196-42)/7,e2:(24*3+18)/5,e3:(162-27)/(8-3),e4:96/4*3,e5:boxes[0],e6:(54-12)/3,
  m1:81/(12+15),m2:90/(18-3),m3:4*2/(12-4),m4:2*(20+4)+3*(20-4),m5:400/(6-4),m6:30/(6+4),
  a1:74/2-15,a2:2*(288/12+12),a3:45*1000/(50*30),a4:2*(12+8)+2*8,a5:Math.max(...Array.from({length:19},(_,i)=>(i+1)*(19-i))),a6:12*8-4*3,
  f1:480*3/8,f2:84/(35/100),f3:5/6-1/4+1/3,f4:80*25/100,f5:60/((1-1/3)*(1-1/2)),f6:48*5/8
};
function correctValue(task) {
  if(task.lab==='divisors')return task.options.filter(n=>n%4===0 && n%9===0);
  if(task.lab==='order')return {first:0,answer:String(answers[task.id])};
  if(task.lab==='fraction')return {parts:5,answer:String(answers[task.id])};
  return String(answers[task.id]);
}

test('Bank contains eight sections, all four categories, 48 unique tasks and 16 test questions',()=>{
  assert.equal(data.tasks.length,48);assert.equal(new Set(data.tasks.map(t=>t.id)).size,48);assert.equal(data.topics.length,8);assert.equal(data.testTaskIds.length,16);assert.equal(data.maxGoals,64);
  for(const topic of data.topics){const rows=data.tasks.filter(t=>t.topic===topic.id);assert.equal(rows.length,6);assert.equal(rows.filter(t=>t.category==='training').length,3);for(const category of ['advanced','olympiad','lab'])assert.equal(rows.filter(t=>t.category===category).length,1);}
  for(const task of data.tasks){assert.equal(task.hints.length,2);assert.ok(task.solution.length);assert.ok(task.source.includes('Авторские'));assert.ok(!task.prompt.includes('[['));}
  assert.deepEqual(new Set(data.testTaskIds.map(id=>core.byId.get(id).topic)),new Set(data.topics.map(t=>t.id)));
});
for(const task of data.tasks)test('Independent mathematical verification: '+task.id,()=>{
  if(task.answer!==null)assert.ok(Math.abs(task.answer-answers[task.id])<1e-10);
  assert.equal(core.grade(task,correctValue(task)),true);
  if(!task.lab)assert.equal(core.grade(task,String(answers[task.id]+1)),false);
});
test('Numbers accept spaces, decimal comma and equivalent fractions; reject blank, formulas and zero denominators',()=>{
  assert.equal(core.number(' 7 185 405 '),7185405);assert.equal(core.number('2,4'),2.4);assert.equal(core.number('22/24'),11/12);assert.equal(core.grade(core.byId.get('f3'),'22/24'),true);
  for(const raw of ['', '   ', '1/0', '2+3', 'Infinity', '2,4,0', 'NaN', '0x20', '1e3', '<script>'])assert.equal(core.number(raw),null);
});
test('Laboratories enforce full selection and both components of composite answers',()=>{
  const divisorTask=core.byId.get('d6');assert.equal(core.grade(divisorTask,[10404,12348]),false);assert.equal(core.grade(divisorTask,[10404,12348,17388,20161]),false);assert.equal(core.grade(divisorTask,[10404,10404,17388]),false);
  assert.equal(core.grade(core.byId.get('o6'),{first:3,answer:'96'}),false);
  assert.equal(core.grade(core.byId.get('f6'),{parts:4,answer:'30'}),false);
  for(const id of ['n6','g6','e6','m6','a6'])assert.equal(core.grade(core.byId.get(id),answers[id]+1),false);
});
test('Wrong answers do not earn goals; repeated correct answers and reopening do not duplicate goals',()=>{
  const storage=memory(),a=core.createStore(storage);assert.deepEqual(a.submit('n1','50'),{correct:false,awarded:false});assert.deepEqual(a.submit('n1','5000',true),{correct:true,awarded:true});
  assert.deepEqual(core.createStore(storage).submit('n1','5000'),{correct:true,awarded:false});assert.deepEqual(a.read().earned,['n1']);
});
test('Two open stores merge awards without overwriting other answers',()=>{
  const storage=memory(),a=core.createStore(storage),b=core.createStore(storage);a.read();b.read();a.submit('n1','5000');b.submit('g1','42');a.submit('g1','42');assert.deepEqual(new Set(a.read().earned),new Set(['n1','g1']));
});
test('Previous lesson keys and results remain untouched',()=>{
  const old={'liga-znaniy-course-v2':'{"goals":{"0":5}}','liga_math_topic6_goals':'11','liga_math_topic10_earned_v1':'["i1","t3"]'};
  const storage=memory(old),store=core.createStore(storage);store.submit('n1','5000');store.hint('n2');store.tick(15);store.startTest();store.answerTest('n2','72');
  for(const [key,value] of Object.entries(old))assert.equal(storage.getItem(key),value);assert.ok(storage.writes.every(k=>k===core.STORAGE_KEY));
});
test('Mistakes and assisted solutions enter review; an independent solution removes them',()=>{
  const store=core.createStore(memory());store.submit('e1','21');store.hint('e1');store.submit('e1','22',true);assert.equal(core.weakTasks(store.read())[0].id,'e1');assert.equal(core.summary(store.read()).hints,1);
  store.submit('e1','22');assert.equal(core.weakTasks(store.read()).length,0);assert.equal(core.summary(store.read()).independent,1);
});
test('Difficulty rises after independent answers and falls after errors',()=>{
  const store=core.createStore(memory());assert.equal(core.level(store.read(),'numbers'),1);store.submit('n1','5000');store.submit('n2','72');assert.equal(core.level(store.read(),'numbers'),2);store.submit('n3','2970');assert.equal(core.level(store.read(),'numbers'),3);
  store.submit('n3','20');store.submit('n2','23');assert.equal(core.level(store.read(),'numbers'),1);assert.equal(core.queue(store.read(),'numbers','training')[0],'n1');
});
test('Resume survives a reload including hints, retries and entered text',()=>{
  const storage=memory(),store=core.createStore(storage);const resume={id:'f3',queue:['f1','f3'],index:1,category:'training',hints:1,tries:2,done:false,review:false,value:'11/12'};store.resume(resume);
  assert.deepEqual(core.createStore(storage).read().resume,resume);store.resume(null);assert.equal(store.read().resume,null);
});
test('Test preserves its first answer after reload and resumes at the next question',()=>{
  const storage=memory(),store=core.createStore(storage);store.startTest();store.answerTest('n2','71');assert.equal(store.answerTest('n2','72'),null);
  const loaded=core.createStore(storage);loaded.startTest();assert.equal(loaded.read().test.answers.n2.value,'71');assert.equal(data.testTaskIds.find(id=>!loaded.read().test.answers[id]),'n4');
});
test('Assessment completes only after 16 answers; new attempts do not duplicate rewards',()=>{
  const store=core.createStore(memory());store.startTest();for(const id of data.testTaskIds.slice(0,-1))store.answerTest(id,correctValue(core.byId.get(id)));assert.equal(store.read().test.completed,null);
  store.answerTest('f4','20');assert.ok(store.read().test.completed);assert.equal(store.read().bestTest,16);assert.equal(store.read().earned.length,16);
  store.startTest();for(const id of data.testTaskIds)store.answerTest(id,correctValue(core.byId.get(id)));assert.equal(store.read().earned.length,16);
});
test('One complete task bank and one assessment earn exactly 64 goals',()=>{
  const store=core.createStore(memory());for(const task of data.tasks)store.submit(task.id,correctValue(task));store.startTest();for(const id of data.testTaskIds)store.answerTest(id,correctValue(core.byId.get(id)));assert.equal(store.read().earned.length,64);
});
test('Invalid saved state is bounded and unknown reward IDs are ignored',()=>{
  const state=core.normalize({version:1,earned:['n1','n1','invalid','test:n2','test:n1'],seconds:-5,resume:{id:'n2',queue:[],index:999},records:{bad:{wrong:200}}});assert.deepEqual(state.earned,['n1','test:n2']);assert.equal(state.seconds,0);assert.deepEqual(state.resume.queue,['n2']);assert.equal(state.resume.index,0);assert.deepEqual(state.records,{});
  const store=core.createStore(memory({[core.STORAGE_KEY]:'{broken JSON'}));assert.equal(store.read().earned.length,0);assert.equal(store.submit('n1','5000').awarded,true);
});
test('Blocked storage retains current progress in memory and shows a single notice',()=>{
  let notices=0;const store=core.createStore({getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}},()=>notices++);
  store.submit('n1','5000');store.submit('n2','72');assert.equal(store.read().earned.length,2);assert.equal(notices,1);
});
test('Active time increments are capped and do not mutate answer counts',()=>{
  const store=core.createStore(memory());store.tick(15);store.tick(-3);store.tick(1000);assert.equal(store.read().seconds,75);assert.equal(core.summary(store.read()).attempts,0);
});
function globalCounter(storage){
  const window={addEventListener(){}};const document={querySelectorAll(){return [];},addEventListener(){},readyState:'complete',body:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../..','shared/js/global-stars-v818.js'),'utf8'),{window,document,localStorage:storage,MutationObserver:class{observe(){}},setInterval(){}});return window.LigaGlobalStars.get();
}
test('Global score preserves legacy totals and counts validated unique workshop rewards',()=>{
  const storage=memory({'liga-znaniy-course-v2':JSON.stringify({goals:{0:3,1:1,2:2,3:4,4:5}})});assert.equal(globalCounter(storage),15);
  storage.setItem(core.STORAGE_KEY,JSON.stringify({version:1,earned:['n1','n1','test:n2','f3','test:unknown','test:n1','bad']}));assert.equal(globalCounter(storage),18);
});
test('Every reward in the full bank is recognized by the global score',()=>{
  const storage=memory(),store=core.createStore(storage);for(const task of data.tasks)store.submit(task.id,correctValue(task));store.startTest();for(const id of data.testTaskIds)store.answerTest(id,correctValue(core.byId.get(id)));assert.equal(globalCounter(storage),64);
});
