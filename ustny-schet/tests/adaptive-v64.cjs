const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ustny-schet/topics/adaptive.js','utf8');
const c={window:{},Math,Date};vm.runInNewContext(source,c);const A=c.window.LigaAdaptive;
const data={sessions:[{date:'2026-01-01',history:[{topic:'subtract_parts',expression:'263 − 162 = 263 − □ − □',correct:false}]}]};A.ensure(data);
assert.equal(data.review['subtract_parts|split|263|162'].wrong,1);
A.record(data,{topic:'x',key:'x|3'},true);assert.equal(data.review['x|3'].attempts,1);
assert.equal(A.choose({topics:['x'],level:1,used:new Set(['x|1']),create:()=>({topic:'x',key:'x|1'})}),null);
let i=0;assert.equal(A.choose({topics:['x'],level:1,used:new Set(['x|1']),create:()=>({topic:'x',key:'x|'+(1+i++%2)})}).key,'x|2');
assert.equal(A.adapt(4,4,false,0,2).level,3);assert.equal(A.adapt(4,3,true,3,0).level,4);assert.equal(A.adapt(5,5,false,0,2).level,5);
// Никаких повторов в короткой тренировке, затем новый цикл для спринта/плана.
let turn=0;const options={topics:['x'],level:1,used:new Set(),cycle:true,
 create:()=>({topic:'x',key:'x|'+(1+turn++%3)}),lastKey:''};
const seen=[];
for(let j=0;j<3;j++){
 const selected=A.chooseWithCycle(options);assert.ok(selected.task);assert.equal(selected.cycled,false);
 assert.ok(!seen.includes(selected.task.key));seen.push(selected.task.key);
 options.used.add(selected.task.key);options.lastKey=selected.task.key;
}
const fourth=A.chooseWithCycle(options);
assert.equal(fourth.cycled,true);assert.ok(fourth.task);
assert.notEqual(fourth.task.key,seen[2]);
assert.equal(options.used.size,1);
const exhausted=A.chooseWithCycle({topics:['x'],level:1,used:new Set(['x|1']),
 create:()=>({topic:'x',key:'x|1'}),cycle:false,lastKey:'x|1'});
assert.equal(exhausted.task,null);
const app=fs.readFileSync('ustny-schet/topics/app.js','utf8');
const plan=fs.readFileSync('ustny-schet/plan.js','utf8');
assert.ok(app.includes('adaptive.chooseWithCycle('));
assert.ok(plan.includes('adaptive.chooseWithCycle('));
assert.ok(plan.includes("p.kind==='split'?'Например: 20 + 8'"));
const html=fs.readFileSync('ustny-schet/v6-4.html','utf8');
for(const name of ['topics','plan']){const m=html.match(new RegExp('<script type="text/plain" id="page-'+name+'">([^<]+)</script>'));assert.ok(m);assert.ok(Buffer.from(m[1],'base64').toString('utf8').includes('Лига знаний 6.4: индивидуальные задания'));}
assert.ok(html.includes('id="page-stats"')&&html.includes('id="page-general"'));console.log('Adaptive checks passed');
