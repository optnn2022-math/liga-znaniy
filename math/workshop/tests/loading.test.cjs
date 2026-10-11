'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script = html.match(/<script id="workshopBootScript">([\s\S]*?)<\/script>/)[1];
function boot() {
  const message = { textContent: 'Загружаем мастерскую…' }, handlers = {};
  let timeout, cleared = false;
  const window = { addEventListener(type,fn) { handlers[type]=fn; } };
  const location = { href: 'https://example.org/math/workshop/index.html?v=old#practice', hash: '#practice' };
  const document = { getElementById() { return message; }, addEventListener(type,fn) { handlers[type]=fn; } };
  vm.runInNewContext(script,{window,location,document,Date,setTimeout(fn) { timeout=fn;return 1; },clearTimeout() { cleared=true; }});
  return { window,location,message,handlers,timeout,cleared:()=>cleared };
}
test('Initial HTML has visible content and a retry button before any task script runs',()=>{
  assert.match(html,/<section[^>]*id="workshopBoot"/);
  assert.match(html,/Математическая мастерская/);
  assert.match(html,/onclick="window\.LigaWorkshopBoot\.reload\(\)"/);
});
test('All client scripts and styles request the same fresh asset version',()=>{
  const refs=[...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)[^\"]*)"/g)].map(m=>m[1]);
  assert.equal(refs.length,5);for(const ref of refs)assert.ok(ref.endsWith('?v=20261012-2'));
});
test('Slow or failed resource loading leaves a readable retry message',()=>{
  const b=boot();b.timeout();assert.match(b.message.textContent,/Обновить страницу/);
  b.message.textContent='initial';b.handlers.error({target:{tagName:'SCRIPT'}});assert.match(b.message.textContent,/Обновить страницу/);
});
test('Successful initialization cancels the fallback and ignores unrelated later errors',()=>{
  const b=boot();b.window.LigaWorkshopBoot.ready();assert.equal(b.cleared(),true);b.timeout();b.handlers.error({message:'later error'});assert.equal(b.message.textContent,'Загружаем мастерскую…');
});
test('Retry changes the cache key and retains the current task route',()=>{
  const b=boot();b.window.LigaWorkshopBoot.reload();assert.match(b.location.href,/index\.html\?v=\d+#practice$/);assert.ok(!b.location.href.includes('v=old'));
});
test('Missing task dependencies keep the fallback instead of crashing startup',()=>{
  let called=false;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','workshop.js'),'utf8'),{window:{LigaWorkshopBoot:{fail(){called=true;}}}});
  assert.equal(called,true);
});
