const fs=require('fs'),path=require('path'),vm=require('vm');
const test=require('node:test'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),lesson=require('../lesson.js');
function run(file,storage,label={textContent:''}){
 const listeners={},localStorage={getItem:k=>storage.get(k)||null};
 const window={addEventListener:(k,fn)=>(listeners[k]||(listeners[k]=[])).push(fn)};
 const document={body:{},readyState:'complete',addEventListener(){},querySelectorAll:()=>[],getElementById:id=>id==='infoLesson01Progress'?label:null};
 const context=vm.createContext({window,document,localStorage,Map,Set,JSON,Number,String,Array,Math,MutationObserver:class{observe(){}},setInterval(){}});
 vm.runInContext(fs.readFileSync(file,'utf8'),context);
 return {window,label,event:name=>{for(const fn of listeners[name]||[])fn();}};
}
test('Main counter adds Informatics goals while retaining existing subject totals',()=>{
 const storage=new Map([
  ['liga-znaniy-course-v2',JSON.stringify({goals:{0:3,1:10},rayFirstGoals:{a:1}})],
  ['liga-znaniy-history-progress-v1',JSON.stringify({goals1:2})],
  ['liga-znaniy-russian-progress-v1',JSON.stringify({topic1Goals:3})],
  ['liga-znaniy-chinese-progress-v1',JSON.stringify({topic1Goals:2})],
  ['liga_math_workshop_v1',JSON.stringify({version:1,earned:['n1','n1','test:n2','unknown']})]
 ]);
 const app=run(path.resolve(root,'../../../shared/js/global-stars-v818.js'),storage);
 assert.equal(app.window.LigaGlobalStars.get(),18);
 storage.set(lesson.KEY,JSON.stringify({earned:[...lesson.required,...lesson.required,'q10','work5','unknown']}));
 assert.equal(app.window.LigaGlobalStars.get(),48);
 storage.set(lesson.KEY,JSON.stringify({done:{s0:1,p0:1,work5:1,unknown:1},earned:['s0','s0']}));
 assert.equal(app.window.LigaGlobalStars.get(),20);
 storage.set(lesson.KEY,'invalid JSON');assert.equal(app.window.LigaGlobalStars.get(),18);
});
test('Course card restores goals and updates completion when returning to topics',()=>{
 const storage=new Map([[lesson.KEY,JSON.stringify({earned:['s0','s0','unknown'],done:{p0:1}})]]);
 const app=run(path.join(root,'course-status.js'),storage);assert.match(app.label.textContent,/доступен.*2 \/ 30/);
 storage.set(lesson.KEY,JSON.stringify({earned:lesson.required,completed:true}));app.event('pageshow');
 assert.match(app.label.textContent,/пройден.*30 \/ 30/);
 storage.set(lesson.KEY,'invalid JSON');app.event('storage');assert.match(app.label.textContent,/доступен.*0 \/ 30/);
});
test('First topic opens the main course lesson and keeps the two programming sections',()=>{
 const html=fs.readFileSync(path.resolve(root,'../../index.html'),'utf8');
 assert.equal((html.match(/<li>/g)||[]).length,34);
 assert.match(html,/href="lessons\/01\/index.html\?v=20261012-info1"/);
 assert.match(html,/href="laboratory\/index.html"/);assert.match(html,/href="programming\/index.html"/);
});
