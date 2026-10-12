// Runs the real page scripts against a minimal DOM; does not check browser layout.
const fs=require('fs'),path=require('path'),vm=require('vm');
const test=require('node:test'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function app(storage=new Map(),blocked=false){
 const nodes=new Set(),ids=new Map(),docEvents={},winEvents={};
 class Element{
  constructor(tag,attrs={}){
   this.tag=tag;this.attrs={...attrs};this.children=[];this.parent=null;this.listeners={};this.style={};this.textContent='';
   this.className=attrs.class||'';this.hidden='hidden'in attrs;this.disabled='disabled'in attrs;this.dataset={};this.paused=true;this.pauseCount=0;
   for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
   const classes=()=>this.className.split(/\s+/).filter(Boolean);
   this.classList={contains:c=>classes().includes(c),add:(...cs)=>this.className=[...new Set([...classes(),...cs])].join(' '),remove:(...cs)=>this.className=classes().filter(c=>!cs.includes(c)).join(' '),toggle:(c,on)=>{const active=on===undefined?!classes().includes(c):on;active?this.classList.add(c):this.classList.remove(c);return active;}};
   nodes.add(this);if(attrs.id)ids.set(attrs.id,this);
  }
  setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}
  appendChild(n){n.parent=this;this.children.push(n);return n;}
  remove(){for(const child of [...this.children])child.remove();nodes.delete(this);if(this.attrs.id)ids.delete(this.attrs.id);if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
  replaceChildren(...children){for(const child of [...this.children])child.remove();this.children=[];for(const child of children)this.appendChild(child);}
  inside(parent){for(let p=this.parent;p;p=p.parent)if(p===parent)return true;return false;}
  querySelectorAll(s){return [...nodes].filter(n=>n!==this&&n.inside(this)&&matches(n,s));}
  addEventListener(k,fn){(this.listeners[k]||(this.listeners[k]=[])).push(fn);}
  dispatch(k){for(const fn of this.listeners[k]||[])fn({target:this});}
  click(){if(this.disabled)return;if(this.onclick)this.onclick();this.dispatch('click');if(this.tag==='a'&&this.attrs.href)location.href=this.attrs.href;}
  pause(){this.paused=true;this.pauseCount++;}play(){this.paused=false;return Promise.resolve();}
 }
 function matches(n,s){if(s.startsWith('.'))return n.classList.contains(s.slice(1));if(s.startsWith('[')){const m=s.match(/^\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]$/);return !!m&&m[1]in n.attrs&&(m[2]===undefined||n.attrs[m[1]]===m[2]);}return n.tag===s;}
 const body=new Element('body'),stack=[body],html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of html.matchAll(/<\/?([a-zA-Z][\w:-]*)\b([^>]*?)>/g)){
  const tag=m[1].toLowerCase();if(m[0][1]==='/'){for(let i=stack.length-1;i>0;i--)if(stack[i].tag===tag){stack.length=i;break;}continue;}
  const attrs={};for(const a of m[2].matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';
  const node=new Element(tag,attrs);stack.at(-1).appendChild(node);if(!['input','img','meta','link','br','hr','source'].includes(tag))stack.push(node);
 }
 const document={body,hidden:false,getElementById:id=>ids.get(id)||null,createElement:tag=>new Element(tag),querySelectorAll:s=>[...nodes].filter(n=>matches(n,s)),addEventListener:(k,fn)=>(docEvents[k]||(docEvents[k]=[])).push(fn)};
 const localStorage={getItem:k=>{if(blocked)throw new Error('Storage disabled');return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw new Error('Storage disabled');storage.set(k,v);}};
 const window={localStorage,scrollTo(){},addEventListener:(k,fn)=>(winEvents[k]||(winEvents[k]=[])).push(fn)};
 const location={href:'index.html'};
 const context=vm.createContext({window,document,location,localStorage,Map,Set,Date,JSON,Number,String,Array,Math,SyntaxError,console});
 for(const file of ['data.js','lesson.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const api=window.LigaInformaticsLesson1;
 return {document,storage,api,location,id:id=>{assert.ok(ids.get(id),'Missing '+id);return ids.get(id);},state:()=>JSON.parse(storage.get(api.KEY)||'{}'),answer(id,choice){const button=document.querySelectorAll('[data-answer-id]').find(n=>n.attrs['data-answer-id']===id&&(choice===undefined||n.attrs['data-choice']===String(choice)));assert.ok(button,'Missing '+id);button.click();return button;},event(name){for(const fn of winEvents[name]||[])fn();},visibility(hidden){document.hidden=hidden;for(const fn of docEvents.visibilitychange||[])fn();}};
}
function allCorrect(a){for(const id of a.api.required){const entry=a.api.entries.get(id);a.answer(id,id.startsWith('safe')||id.startsWith('work')?undefined:entry.correct);}}
test('Navigation covers seven stages and pauses video when leaving it',()=>{const a=app();assert.equal(a.document.querySelectorAll('.step').length,7);assert.equal(a.id('prev').disabled,true);a.id('next').click();assert.equal(a.id('counter').textContent,'2 / 7');a.id('lessonVideo').play();a.id('next').click();assert.equal(a.id('lessonVideo').paused,true);a.id('prev').click();assert.equal(a.state().step,1);});
test('Wrong first answer is red, locked and awards no goals',()=>{const a=app();a.answer('s0',0);a.answer('s0',1);assert.equal(a.state().answers.s0,0);assert.equal(a.state().earned.length,0);const options=a.document.querySelectorAll('[data-answer-id]').filter(n=>n.attrs['data-answer-id']==='s0');assert.ok(options.every(n=>n.disabled));assert.ok(options[0].classList.contains('wrong'));assert.match(a.id('senseFeed').textContent,/неверно/);});
test('Unsafe workplace actions are red and safe ones earn one goal',()=>{const a=app();a.answer('work5');assert.equal(a.state().earned.length,0);const bad=a.document.querySelectorAll('[data-answer-id]').find(n=>n.attrs['data-answer-id']==='work5');assert.ok(bad.classList.contains('wrong'));assert.ok(bad.disabled);a.answer('work0');assert.equal(a.state().earned.length,1);assert.match(a.id('workFeed').textContent,/Верно/);});
test('Finding five hazards earns five goals and shows completion feedback',()=>{const a=app();a.answer('safe5');for(let i=0;i<5;i++)a.answer('safe'+i);assert.equal(a.state().earned.length,5);assert.match(a.id('safetyFeed').textContent,/пять/);});
test('All practices and ten quiz answers allow completion and return to topics',()=>{const a=app();allCorrect(a);assert.equal(a.id('finish').hidden,false);assert.match(a.id('score').textContent,/30 \/ 30/);a.id('lessonVideo').play();a.id('finishLesson').click();assert.equal(a.state().completed,true);assert.equal(a.location.href,'../../index.html');assert.equal(a.id('lessonVideo').paused,true);});
test('Completing only the quiz sends the learner to unfinished practice',()=>{const a=app();for(let i=0;i<10;i++)a.answer('q'+i,a.api.entries.get('q'+i).correct);a.id('finishLesson').click();assert.equal(a.state().step,2);assert.equal(a.state().completed,false);assert.equal(a.location.href,'index.html');assert.match(a.id('notice').textContent,/Сначала/);});
test('New attempt and reload retain goals without awarding them again',()=>{const a=app();allCorrect(a);a.id('restart').click();assert.equal(a.state().earned.length,30);assert.equal(Object.keys(a.state().answers).length,0);assert.equal(a.state().step,0);assert.equal(a.id('finish').hidden,true);const b=app(a.storage);allCorrect(b);assert.equal(b.state().earned.length,30);assert.match(b.id('score').textContent,/30 \/ 30/);});
test('Reload restores answers and stage without touching other lesson data',()=>{const storage=new Map([['otherLesson','unchanged']]);const a=app(storage);a.answer('s0',1);for(let i=0;i<3;i++)a.id('next').click();const b=app(storage);assert.equal(b.state().step,3);assert.equal(b.state().answers.s0,1);assert.equal(storage.get('otherLesson'),'unchanged');});
test('Video fallback, tab hiding and return button use real handlers',()=>{const a=app();a.id('lessonVideo').dispatch('error');assert.equal(a.id('videoStatus').hidden,false);a.id('lessonVideo').dispatch('loadedmetadata');assert.equal(a.id('videoStatus').hidden,true);a.id('lessonVideo').play();a.visibility(true);assert.equal(a.id('lessonVideo').paused,true);a.id('lessonVideo').play();a.document.querySelectorAll('[data-return-topics]')[0].click();assert.equal(a.location.href,'../../index.html');assert.equal(a.id('lessonVideo').paused,true);});
test('Blocked local storage leaves exercises usable and explains saving limit',()=>{const a=app(new Map(),true);a.answer('s0',1);assert.match(a.id('score').textContent,/1 \/ 30/);assert.match(a.id('notice').textContent,/не разрешает/);});
