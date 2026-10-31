/* Лига знаний: визуальный ввод обыкновенных и смешанных дробей, v5.6. */
(()=>{
'use strict';
const answer=document.getElementById('answer'),pad=document.getElementById('numpad');
const form=answer&&answer.closest('.answerform');
const question=document.getElementById('question'),label=document.getElementById('questionLabel');
const counter=document.getElementById('counter'),play=document.getElementById('play');
if(!answer||!pad||!form||!question||!label||!counter||!play)return;
const css=document.createElement('style');
css.textContent=[
'.fraction-entry{display:flex;align-items:center;justify-content:center;gap:9px;min-width:0;flex:1;min-height:97px;padding:8px 7px;background:#fff;border:2px solid #ded8fa;border-radius:17px}',
'.fraction-entry[hidden]{display:none!important}',
'.fraction-whole{display:flex;flex-direction:column;align-items:center;gap:4px}',
'.fraction-whole[hidden]{display:none!important}',
'.fraction-whole small{font:700 10px/1.1 system-ui,sans-serif;color:#77769d}',
'.fraction-stack{display:flex;flex-direction:column;min-width:65px;align-items:stretch;gap:3px}',
'.fraction-line{display:block;height:2px;border-radius:3px;background:#373276;margin:0 3px}',
'.fraction-entry .fraction-part{min-width:56px;min-height:32px;padding:3px 8px;border:1.5px solid transparent;border-radius:8px;background:#f6f5ff;color:#36306e;font:800 25px/1.15 system-ui,sans-serif;white-space:nowrap}',
'.fraction-entry .fraction-part[aria-pressed="true"]{border-color:#6a4fdf;background:#eae6ff;box-shadow:0 0 0 2px #e0d8ff}',
'.fraction-entry .fraction-part:focus-visible{outline:3px solid #ffbd4a;outline-offset:2px}',
'.fraction-entry .fraction-part.empty{color:#a19bbb}',
'body.fraction-entry-active .numpad .num[data-key=" "]{font-size:12px}',
'body.fraction-entry-active .numpad .num[data-key="/"]{font-size:13px}',
'@media(max-width:400px){.fraction-entry{min-height:90px;gap:5px}.fraction-stack{min-width:51px}.fraction-entry .fraction-part{min-width:47px;font-size:22px;padding:3px}.answerform{gap:6px}}'
].join('\n');
document.head.appendChild(css);
const entry=document.createElement('div');entry.className='fraction-entry';entry.id='fractionEntry';entry.hidden=true;
entry.setAttribute('aria-label','Ввод дроби: выберите числитель или знаменатель');
entry.innerHTML='<div class="fraction-whole" id="fractionWhole" hidden><small>Целая</small><button class="fraction-part" data-fpart="whole" type="button" aria-label="Целая часть">□</button></div><div class="fraction-stack"><button class="fraction-part" data-fpart="num" type="button" aria-label="Числитель">□</button><span class="fraction-line" aria-hidden="true"></span><button class="fraction-part" data-fpart="den" type="button" aria-label="Знаменатель">□</button></div>';
form.insertBefore(entry,answer);
const buttons=Object.fromEntries(['whole','num','den'].map(id=>[id,entry.querySelector('[data-fpart="'+id+'"]')]));
const whole=entry.querySelector('#fractionWhole');
const keys=Object.fromEntries(['/',' ',','].map(k=>[k,pad.querySelector('[data-key="'+k+'"]')]));
const defaultLabels=Object.fromEntries(Object.entries(keys).map(([k,b])=>[k,b?.textContent||'']));
let active=false,topic='',selected='num',signature=null,values={whole:'',num:'',den:''};
function taskMode(){
 if(play.classList.contains('hidden')||!answer.placeholder.includes('1/2'))return '';
 const t=label.textContent||'';
 return t.includes('Смешанные числа')?'mixed':t.includes('Обыкновенные дроби')?'fractions':'';
}
function updateAnswer(){
 const {whole:w,num:n,den:d}=values;
 answer.value=(n||d)?(w?w+' ':'')+n+'/'+d:w;
}
function paint(){
 for(const part of ['whole','num','den']){
  const el=buttons[part],value=values[part];
  el.textContent=value||'□';el.classList.toggle('empty',!value);
  el.setAttribute('aria-pressed',String(selected===part));
 }
 updateAnswer();
}
function selectPart(part){
 if(!active||answer.disabled||part==='whole'&&topic!=='mixed')return;
 selected=part;paint();
}
entry.addEventListener('click',e=>{const el=e.target.closest('[data-fpart]');if(el)selectPart(el.dataset.fpart);});
function restorePad(){for(const [k,el] of Object.entries(keys))if(el)el.textContent=defaultLabels[k];}
function sync(){
 const next=taskMode();
 const sig=next?next+'|'+counter.textContent+'|'+label.textContent+'|'+answer.placeholder:null;
 if(next===topic&&sig===signature&&active===!!next)return;
 active=!!next;topic=next;signature=sig;
 entry.hidden=!active;document.body.classList.toggle('fraction-entry-active',active);
 answer.style.display=active?'none':'';
 answer.setAttribute('aria-hidden',String(active));
 if(!active){restorePad();return;}
 answer.required=false;values={whole:'',num:'',den:''};selected=topic==='mixed'?'whole':'num';
 whole.hidden=topic!=='mixed';
 if(keys['/'])keys['/'].textContent='↓ Знаменатель';
 if(keys[' '])keys[' '].textContent=topic==='mixed'?'→ К дроби':'↑ Числитель';
 if(keys[','])keys[','].textContent='Очистить';
 paint();
}
function applyKey(k){
 if(!active||answer.disabled)return false;
 if(/^\d$/.test(k)){
  const s=values[selected];if(s.length<9)values[selected]=(s==='0'?k:s+k);
 }else if(k==='back'){
  if(values[selected])values[selected]=values[selected].slice(0,-1);
  else if(selected==='den')selected='num';
  else if(selected==='num'&&topic==='mixed')selected='whole';
 }else if(k==='/')selected='den';
 else if(k===' ')selected='num';
 else if(k===','){values={whole:'',num:'',den:''};selected=topic==='mixed'?'whole':'num';}
 else if(k==='−'||k==='-'){
  const part=selected==='den'?'num':selected;
  values[part]=values[part].startsWith('-')?values[part].slice(1):'-'+values[part];selected=part;
 }else return false;
 paint();return true;
}
// Кнопки экранной клавиатуры перехватываются до стандартного ввода текста.
pad.addEventListener('click',e=>{
 if(!active||answer.disabled)return;
 const b=e.target.closest('[data-key]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();applyKey(b.dataset.key);
},true);
document.addEventListener('keydown',e=>{
 if(!active||answer.disabled||e.ctrlKey||e.metaKey||e.altKey)return;
 const k=e.key==='Backspace'?'back':e.key===' ' ?' ':e.key;
 if(/^\d$/.test(k)||['/','back',' ','-', '−'].includes(k)){e.preventDefault();applyKey(k);}
},true);
const observer=new MutationObserver(sync);
observer.observe(answer,{attributes:true,attributeFilter:['placeholder']});
observer.observe(counter,{childList:true,subtree:true,characterData:true});
observer.observe(label,{childList:true,subtree:true,characterData:true});
observer.observe(play,{attributes:true,attributeFilter:['class']});
sync();
})();