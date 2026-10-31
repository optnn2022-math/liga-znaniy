(()=>{
'use strict';
const KEY_GENERAL='liga_math_sprint_v1',KEY_TOPICS='liga_math_sprint_v2',KEY_PLAN='liga_math_daily_plan_v1';
const TOPICS=new Map((window.MathTrainer?.topics||[]).map(t=>[t.id,t.title]));
const $=id=>document.getElementById(id);
const fmtInt=n=>Math.max(0,Number(n)||0).toLocaleString('ru-RU');
const n=x=>Number.isFinite(Number(x))?Number(x):0;
const fixSeconds=s=>Number.isFinite(s)?s.toFixed(1)+' с':'—';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const niceDate=x=>{const d=new Date(x);return Number.isNaN(+d)?'Дата неизвестна':d.toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});};
function getData(key){try{const v=JSON.parse(localStorage.getItem(key));return v&&Array.isArray(v.sessions)&&Array.isArray(v.mistakes)?v:{sessions:[],mistakes:[]};}catch(_){return {sessions:[],mistakes:[]};}}
function dataAll(){return {general:getData(KEY_GENERAL),topics:getData(KEY_TOPICS)};}
function getPlanData(){try{return JSON.parse(localStorage.getItem(KEY_PLAN));}catch(_){return null;}}
const sourceName=x=>x==='general'?'Общий спринт':'По темам';
const modes={learn:'Изучаю',practice:'Тренировка',sprint:'На скорость',mistakes:'Повтор ошибок',daily:'Ежедневное занятие'};
function topicName(topic,source){return source==='general'?'Четыре действия':(topic==='all'?'Смешанные темы блока 1':topic==='all-advanced'?'Смешанные темы блока 2':TOPICS.get(topic)||topic||'Темы');}
function allSessions(data){const list=[];for(const source of ['general','topics']){data[source].sessions.forEach((s,i)=>{
 if(!s||typeof s!=='object')return;
 const date=new Date(s.date);list.push({...s,_source:source,_id:s.id||source+'-legacy-'+i,_date:Number.isNaN(+date)?0:+date,_total:n(s.total??s.solved),_correct:n(s.correct)});
});}return list.sort((a,b)=>b._date-a._date);}
function selected(sessions){const src=$('sourceFilter').value,range=$('rangeFilter').value,now=Date.now(),start=range==='all'?0:now-Number(range)*86400000;return sessions.filter(s=>(src==='all'||s._source===src||(src==='daily'&&s.mode==='daily'))&&s._date>=start);}
function accuracy(s){return s._total?Math.round(s._correct/s._total*100):null;}
function timeAverage(s){const histories=Array.isArray(s.history)?s.history:[];const timed=histories.filter(h=>h&&Number.isFinite(h.seconds));if(timed.length)return timed.reduce((a,h)=>a+n(h.seconds),0)/timed.length;if(s._source==='topics'&&Number.isFinite(s.avgSeconds)&&s._total>0)return s.avgSeconds;return NaN;}
function filteredStats(list){const total=list.reduce((sum,s)=>sum+s._total,0),right=list.reduce((sum,s)=>sum+s._correct,0);
 let weighted=0,weights=0;
 for(const s of list){const avg=timeAverage(s);if(Number.isFinite(avg)&&s._total){weighted+=avg*s._total;weights+=s._total;}}
 const sprint=list.filter(s=>s.mode==='sprint'&&n(s.seconds)>0).map(s=>s._correct*60/n(s.seconds));
 const days=new Set(list.filter(s=>s._date>0).map(s=>{const d=new Date(s._date);return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}));
 return {total,right,accuracy:total?right/total*100:NaN,avg:weights?weighted/weights:NaN,record:sprint.length?Math.max(...sprint):NaN,activeDays:days.size};
}
function setMetrics(list){const x=filteredStats(list);$('mSessions').textContent=fmtInt(list.length);$('mQuestions').textContent=fmtInt(x.total);$('mAccuracy').textContent=Number.isFinite(x.accuracy)?Math.round(x.accuracy)+'%':'—';$('mSpeed').textContent=fixSeconds(x.avg);$('mRecord').textContent=Number.isFinite(x.record)?x.record.toFixed(1):'—';$('mActive').textContent=fmtInt(x.activeDays);}
function chart(list){const root=$('accuracyChart'),last=list.filter(s=>s._total>0).slice(0,14).reverse();$('chartCaption').textContent=last.length?last.length+' занятий':'';
 if(!last.length){root.innerHTML='<div class="empty">Пока нет завершённых тренировок с ответами. Пройдите первую тренировку — здесь появится график.</div>';return;}
 const W=740,H=230,L=45,T=13,R=12,B=38,plotH=H-T-B,plotW=W-L-R;
 const y=v=>T+plotH-v/100*plotH;
 const grids=[0,25,50,75,100].map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="#e9eafa"/><text x="${L-9}" y="${y(t)+4}" fill="#8990ae" text-anchor="end" font-size="11">${t}%</text>`).join('');
 const size=plotW/last.length,barW=Math.min(35,size*.60);
 const bars=last.map((s,i)=>{const value=accuracy(s),x=L+i*size+size/2,top=y(value),height=y(0)-top;
 const date=new Date(s._date),label=Number.isNaN(+date)?'?':date.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'});
 return `<g><rect x="${x-barW/2}" y="${top}" width="${barW}" height="${Math.max(.5,height)}" rx="6" fill="${value>=90?'#17b59b':value>=65?'#765bea':'#e489a3'}"><title>${esc(niceDate(s.date))}: ${value}% (${s._correct}/${s._total})</title></rect><text x="${x}" y="${Math.max(11,top-6)}" text-anchor="middle" font-size="11" fill="#4a3eb3" font-weight="750">${value}%</text><text x="${x}" y="${H-11}" text-anchor="middle" font-size="10.5" fill="#8a8fa9">${label}</text></g>`;
 }).join('');
 root.innerHTML=`<svg class="chart" role="img" aria-label="Точность последних тренировок в процентах" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${grids}${bars}</svg>`;
}
function rowsForSkills(list){const map=new Map();function get(key,name){if(!map.has(key))map.set(key,{key,name,total:0,correct:0,seconds:0,timed:0,dates:new Set()});return map.get(key);}
 for(const s of list){const history=Array.isArray(s.history)?s.history:[];
 if(history.length){for(const h of history){if(!h||typeof h!=='object')continue;const key=s._source==='general'?'general':h.topic||s.topic||'all';const value=get(s._source+':'+key,topicName(key,s._source));value.total++;value.correct+=h.correct?1:0;if(Number.isFinite(h.seconds)){value.seconds+=h.seconds;value.timed++;}value.dates.add(s._id);}}
 else{const key=s._source==='general'?'general':s.topic||'all',value=get(s._source+':'+key,topicName(key,s._source));value.total+=s._total;value.correct+=s._correct;value.dates.add(s._id);
 if(Number.isFinite(s.avgSeconds)&&s._total>0){value.timed+=s._total;value.seconds+=s.avgSeconds*s._total;}}
 }
 return [...map.values()].sort((a,b)=>b.total-a.total);
}
function renderSkills(list){const rows=rowsForSkills(list);$('topicTable').innerHTML=rows.length?`<table class="datatable"><thead><tr><th>Направление</th><th class="num">Примеров</th><th class="num">Точность</th><th class="num">Среднее время*</th><th class="num">Занятий</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td class="num">${fmtInt(r.total)}</td><td class="num"><span class="${r.total&&r.correct/r.total>=.9?'good':''}">${r.total?Math.round(r.correct/r.total*100)+'%':'—'}</span></td><td class="num">${r.timed?fixSeconds(r.seconds/r.timed):'—'}</td><td class="num">${r.dates.size}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">После первой тренировки здесь появятся результаты по навыкам.</div>';}
function renderSessions(list){$('sessionCount').textContent=list.length+' записей';$('sessionsTable').innerHTML=list.length?`<table class="datatable"><thead><tr><th>Дата</th><th>Тренажёр / режим</th><th class="num">Точность</th><th class="num">Время</th><th></th></tr></thead><tbody>${list.map(s=>`<tr><td>${esc(niceDate(s.date))}</td><td><b>${esc(topicName(s.topic,s._source))}</b><span class="small">${esc(sourceName(s._source))} · ${esc(modes[s.mode]||s.mode||'Тренировка')} · уровень ${n(s.level)||'—'}</span></td><td class="num"><span class="${s._total&&s._correct/s._total>=.9?'good':'warn'}">${s._total?Math.round(s._correct/s._total*100)+'%':'—'}</span><span class="small">${s._correct} / ${s._total}</span></td><td class="num">${fmtInt(s.seconds)} с</td><td><button type="button" data-session="${esc(s._id)}">Подробнее</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Пока нет тренировок за выбранный период.</div>';
 $('sessionsTable').querySelectorAll('button[data-session]').forEach(btn=>btn.addEventListener('click',()=>showSession(list.find(s=>s._id===btn.dataset.session))));}

function latexMarkup(raw,topic,asFormula=false){
 try{return window.LigaLatex[asFormula?'formula':'inline'](String(raw),topic);}
 catch(_){return String(raw).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
}
function showLatex(id,raw,topic,asFormula=false){document.getElementById(id).innerHTML=latexMarkup(raw,topic,asFormula);}

function showSession(s){if(!s)return;const hist=Array.isArray(s.history)?s.history:[];
 $('dialogTitle').textContent=topicName(s.topic,s._source);$('dialogInfo').textContent=`${niceDate(s.date)} · ${sourceName(s._source)} · ${modes[s.mode]||s.mode} · уровень ${s.level||'—'} · верно ${s._correct} из ${s._total} · ${fmtInt(s.seconds)} с`;
 $('dialogContent').innerHTML=hist.length?`<table class="datatable"><thead><tr><th>№</th><th>Пример</th><th class="num">Ответ</th><th class="num">Правильно</th><th class="num">Время</th></tr></thead><tbody>${hist.map((h,i)=>`<tr><td>${i+1}</td><td><b>${latexMarkup(h.expression,h.topic,true)}</b><span class="small">${esc(h.topic?topicName(h.topic,'topics'):'')}</span></td><td class="num ${h.correct?'good':'warn'}">${esc(h.user)}</td><td class="num">${latexMarkup(h.answer,h.topic)}</td><td class="num">${Number.isFinite(h.seconds)?fixSeconds(h.seconds):'—'}</td></tr>${!h.correct&&h.solution?`<tr><td colspan="5"><span class="small">💡 ${latexMarkup(h.solution,h.topic)}</span></td></tr>`:''}`).join('')}</tbody></table>`:'<div class="empty">Эта тренировка сохранена в старом формате: доступны итоговые показатели, подробные ответы не сохранялись.</div>';
 const d=$('sessionDialog');if(!d.open)d.showModal();}
function renderErrors(list){const map=new Map();for(const s of list){for(const h of Array.isArray(s.history)?s.history:[]){if(h.correct||!h.expression)continue;const key=s._source+'|'+h.expression;const obj=map.get(key)||{expression:h.expression,count:0};obj.count++;map.set(key,obj);}}
 const rows=[...map.values()].sort((a,b)=>b.count-a.count).slice(0,8);$('errors').innerHTML=rows.length?rows.map(r=>`<span class="error-chip">${latexMarkup(r.expression,/\d+\s+\d+\/\d+/.test(r.expression)?'mixed':/\d+\/\d+/.test(r.expression)?'fractions':'decimals',true)} <b>×${r.count}</b></span>`).join(''):'<div class="empty">Пока нет ошибок в сохранённых подробных ответах. Так держать!</div>';}
function renderPlan(){const state=getPlanData(),p=state?.plans?.find(x=>x.id===state.activeId),el=$('planSummary');if(!p){el.textContent='План ещё не создан. Вы можете выбрать программу на 7 или 30 дней.';return;}
 const n=p.type==='week'?7:30,done=Object.keys(p.completed||{}).length;const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})();const start=new Date(p.start+'T12:00:00');let missed=0;
 for(let i=0;i<n;i++){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(date<today&&!p.completed?.[i+1])missed++;}
 el.innerHTML=`<b style="font-size:21px;color:#5f49cb">${done} из ${n} дней выполнено ✅</b><p style="margin:8px 0">Блок ${p.block||1} · План ${p.type==='week'?'на неделю':'на месяц'} · пропущено: <b>${missed}</b>. Ежедневные занятия автоматически записываются в общую историю тренировок.</p>`;
}
function render(){const list=selected(allSessions(dataAll()));setMetrics(list);chart(list);renderSkills(list);renderSessions(list);renderErrors(list);renderPlan();}
function download(content,name,type){if(window.AndroidBridge){window.AndroidBridge.saveTextFile(name,type,content);return;}const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function pdfDocument(title,subtitle,body){
 const created=niceDate(new Date().toISOString());
 const styles=`@page{size:A4;margin:14mm 13mm 16mm}*{box-sizing:border-box}html{color:#26304d}body{font-family:Arial,'DejaVu Sans',sans-serif;font-size:10.5pt;line-height:1.4;margin:0;background:white}h1{font-size:21pt;margin:0 0 3mm;color:#4935a9}h2{font-size:13pt;margin:7mm 0 2mm;color:#4935a9}h3{font-size:11pt;margin:4mm 0 1mm;color:#303551}p{margin:1mm 0 2mm}.top{border-bottom:2px solid #6351d8;padding-bottom:5mm;margin-bottom:5mm}.small,.meta{font-size:9pt;color:#606b85}.pill{display:inline-block;background:#eeebff;color:#4837a5;border-radius:6px;padding:1mm 2mm;margin:1mm 2mm 1mm 0}.metrics{display:flex;flex-wrap:wrap;gap:2mm;margin:4mm 0 5mm}.metric{border:1px solid #dedaf8;border-radius:7px;padding:2mm 3mm;min-width:26mm}.metric strong{display:block;font-size:13pt;color:#382b91}.metric small{font-size:8pt;color:#68718b}.session{margin:5mm 0 6mm;break-before:auto}.session-head{border-left:3px solid #7661da;padding-left:3mm}.session-title{font-weight:bold;font-size:12pt;color:#372987}.session-meta{font-size:9pt;color:#626b81;margin:1mm 0 3mm}.table{border-collapse:collapse;width:100%;font-size:9pt;margin:3mm 0}th{background:#edeafe;color:#342979;text-align:left}td,th{padding:2mm 1.7mm;border-bottom:1px solid #dedff0;vertical-align:top;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}.right{text-align:right}.good{color:#08745b;font-weight:bold}.bad{color:#a02247;font-weight:bold}.solution{font-size:8.5pt;color:#536178;background:#f8f7ff}.foot{margin-top:8mm;border-top:1px solid #d9dbed;padding-top:3mm;color:#778097;font-size:8.5pt}.math{white-space:nowrap}mjx-container{display:inline-block!important;vertical-align:middle!important;margin:0!important}mjx-assistive-mml{display:none!important}svg{max-width:100%;overflow:visible}.empty{background:#f5f4ff;padding:5mm;border-radius:6px;color:#5e6281}@media screen{body{max-width:850px;padding:22px;margin:auto;background:white;box-shadow:0 4px 20px #dde}}@media print{body{padding:0!important;box-shadow:none!important}.session{break-inside:auto}}`;
 return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${styles}</style></head><body><header class="top"><div class="small">∑ ЛИГА ЗНАНИЙ · УСТНЫЙ СЧЁТ</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p><div class="meta">Сформировано: ${esc(created)} · Период: ${esc($('rangeFilter').selectedOptions[0].textContent)} · Режим: ${esc($('sourceFilter').selectedOptions[0].textContent)}</div></header>${body}<footer class="foot">Лига знаний · Учебный отчёт. Результаты сохранены локально на устройстве ученика.</footer></body></html>`;
}
function pdfMath(raw,topic){return `<span class="math">${latexMarkup(raw,topic,true)}</span>`;}
function pdfMetrics(list){const st=filteredStats(list);return `<div class="metrics"><div class="metric"><strong>${list.length}</strong><small>занятий</small></div><div class="metric"><strong>${st.total}</strong><small>примеров</small></div><div class="metric"><strong>${st.right}</strong><small>верно</small></div><div class="metric"><strong>${Number.isFinite(st.accuracy)?Math.round(st.accuracy)+'%':'—'}</strong><small>точность</small></div><div class="metric"><strong>${Number.isFinite(st.avg)?fixSeconds(st.avg):'—'}</strong><small>среднее время</small></div></div>`;}
function pdfOpen(html,name){
 if(window.AndroidBridge&&typeof window.AndroidBridge.openPdfReport==='function'){
  window.AndroidBridge.openPdfReport(html,name);$('notice').textContent='Открыт предварительный просмотр. Нажмите «Сохранить PDF» и выберите «Сохранить как PDF».';return;
 }
 const frame=document.createElement('iframe');frame.setAttribute('title','Печать PDF');frame.style.cssText='position:fixed;left:-20000px;top:0;width:850px;height:1100px;border:0;';document.body.append(frame);
 let finished=false;const cleanup=()=>{if(finished)return;finished=true;setTimeout(()=>frame.remove(),300);};
 frame.onload=()=>{try{const w=frame.contentWindow;w.addEventListener('afterprint',cleanup,{once:true});w.focus();w.print();setTimeout(cleanup,45000);}catch(e){cleanup();$('notice').textContent='Не удалось открыть печать PDF: '+e.message;}};
 frame.srcdoc=html;
 $('notice').textContent='В окне печати выберите «Сохранить как PDF».';
}
function reportSession(){
 const list=selected(allSessions(dataAll()));if(!list.length){$('notice').textContent='За выбранный период нет завершённых занятий для отчёта.';return;}
 const rows=list.map(s=>{const pct=accuracy(s);return `<tr><td>${esc(niceDate(s.date))}</td><td>${esc(topicName(s.topic,s._source))}<div class="small">${esc(sourceName(s._source))}</div></td><td>${esc(modes[s.mode]||s.mode||'—')}</td><td class="right">${s._correct} / ${s._total}</td><td class="right ${pct!==null&&pct>=90?'good':''}">${pct??'—'}%</td><td class="right">${Math.round(n(s.seconds))} с</td></tr>`;}).join('');
 const html=pdfDocument('Журнал тренировок','Краткие итоги занятий и динамика устного счёта',pdfMetrics(list)+`<table class="table"><thead><tr><th>Дата</th><th>Тема</th><th>Режим</th><th>Верно</th><th>Точность</th><th>Время</th></tr></thead><tbody>${rows}</tbody></table>`);
 pdfOpen(html,'Лига знаний — журнал тренировок');
}
function reportAnswers(){
 const list=selected(allSessions(dataAll()));if(!list.length){$('notice').textContent='Нет завершённых занятий для экспорта ответов.';return;}
 const sections=list.map((s,idx)=>{const hist=Array.isArray(s.history)?s.history:[],pct=accuracy(s);
  const head=`<div class="session-head"><div class="session-title">${idx+1}. ${esc(topicName(s.topic,s._source))}</div><div class="session-meta">${esc(niceDate(s.date))} · ${esc(sourceName(s._source))} · ${esc(modes[s.mode]||s.mode||'—')} · уровень ${esc(s.level||'—')} · верно ${s._correct} из ${s._total} (${pct??'—'}%) · ${Math.round(n(s.seconds))} с</div></div>`;
  if(!hist.length)return `<section class="session">${head}<p class="small">Для этого занятия подробные ответы не сохранились (старый формат истории).</p></section>`;
  const rows=hist.map((h,i)=>{const topic=h.topic||s.topic;
   return `<tr><td>${i+1}</td><td>${pdfMath(h.expression||'—',topic)}</td><td>${esc(h.user??'—')}</td><td>${pdfMath(h.answer??'—',topic)}</td><td class="${h.correct?'good':'bad'}">${h.correct?'Верно':'Ошибка'}</td><td>${Number.isFinite(h.seconds)?fixSeconds(h.seconds):'—'}</td></tr>${!h.correct&&h.solution?`<tr><td colspan="6" class="solution">Разбор: ${latexMarkup(h.solution,topic)}</td></tr>`:''}`;
  }).join('');
  return `<section class="session">${head}<table class="table"><thead><tr><th>№</th><th>Пример</th><th>Ответ</th><th>Правильно</th><th>Итог</th><th>Время</th></tr></thead><tbody>${rows}</tbody></table></section>`;
 }).join('');
 pdfOpen(pdfDocument('Ответы и разбор ошибок','Подробный отчёт по завершённым занятиям',pdfMetrics(list)+sections),'Лига знаний — ответы и ошибки');
}
function backup(){const data={...dataAll(),plan:getPlanData()};download(JSON.stringify({format:'liga-mental-math-backup',version:4,exportedAt:new Date().toISOString(),data},null,2),'liga-znaniy-ustny-schet-backup-'+new Date().toISOString().slice(0,10)+'.json','application/json;charset=utf-8');$('notice').textContent=window.AndroidBridge?'Выберите место для резервной копии и подтвердите сохранение.':'Резервная копия создана. Сохраните файл в надёжном месте.';}
function validateBranch(branch){if(!branch||typeof branch!=='object'||!Array.isArray(branch.sessions)||!Array.isArray(branch.mistakes))throw new Error('Некорректные данные тренажёра.');if(branch.sessions.length>2000||branch.mistakes.length>1000)throw new Error('Слишком много записей.');for(const s of branch.sessions){if(!s||typeof s!=='object'||typeof s.date!=='string'||!Number.isFinite(Number(s.correct))||!Number.isFinite(Number(s.total??s.solved)))throw new Error('Повреждённая запись тренировки.');if(s.history!==undefined&&(!Array.isArray(s.history)||s.history.length>1000))throw new Error('Повреждённый список ответов.');}return true;}
function restore(file){if(!file)return;if(file.size>8*1024*1024){$('notice').textContent='Файл слишком большой (максимум 8 МБ).';return;}file.text().then(raw=>{
 const obj=JSON.parse(raw);if(obj.format!=='liga-mental-math-backup'||![3,4].includes(obj.version)||!obj.data)throw new Error('Это не резервная копия приложения.');validateBranch(obj.data.general);validateBranch(obj.data.topics);
 if(obj.version===4&&obj.data.plan!==null&&obj.data.plan!==undefined){const pp=obj.data.plan;if(!pp||pp.version!==1||!Array.isArray(pp.plans)||pp.plans.length>12||!pp.settings||pp.plans.some(p=>!['week','month'].includes(p.type)||!/^\d{4}-\d{2}-\d{2}$/.test(p.start)||!p.completed||!p.drafts))throw new Error('Некорректные данные ежедневного плана.');}
 if(!confirm('Заменить текущие результаты и ошибки данными из резервной копии? Текущие данные будут перезаписаны.'))return;
 const before={g:localStorage.getItem(KEY_GENERAL),t:localStorage.getItem(KEY_TOPICS),p:localStorage.getItem(KEY_PLAN)};
 try{localStorage.setItem(KEY_GENERAL,JSON.stringify(obj.data.general));localStorage.setItem(KEY_TOPICS,JSON.stringify(obj.data.topics));if(obj.version===4){if(obj.data.plan)localStorage.setItem(KEY_PLAN,JSON.stringify(obj.data.plan));else localStorage.removeItem(KEY_PLAN);}}catch(e){if(before.g===null)localStorage.removeItem(KEY_GENERAL);else localStorage.setItem(KEY_GENERAL,before.g);if(before.t===null)localStorage.removeItem(KEY_TOPICS);else localStorage.setItem(KEY_TOPICS,before.t);if(before.p===null)localStorage.removeItem(KEY_PLAN);else localStorage.setItem(KEY_PLAN,before.p);throw e;}
 if(window.AndroidBridge&&obj.version===4)window.AndroidBridge.updatePlan(JSON.stringify(obj.data.plan||{version:1,activeId:null,plans:[],settings:{enabled:false,time:'19:00'}}));
 $('notice').textContent=obj.version===4?'Результаты, календарь и отметки выполнения восстановлены.':'Результаты тренажёров восстановлены. Календарь текущей версии оставлен без изменений.';render();
 }).catch(err=>{$('notice').textContent='Не удалось восстановить файл: '+err.message;}).finally(()=>{$('backupFile').value='';});}
function erase(){if(!confirm('Удалить всю статистику, планы, выполненные занятия, ответы и ошибки?'))return;if(!confirm('Подтвердите удаление. Восстановить данные можно будет только из резервной копии JSON.'))return;localStorage.removeItem(KEY_GENERAL);localStorage.removeItem(KEY_TOPICS);localStorage.removeItem(KEY_PLAN);if(window.AndroidBridge)window.AndroidBridge.updatePlan(JSON.stringify({version:1,activeId:null,plans:[],settings:{enabled:false,time:'19:00'}}));render();$('notice').textContent='Все локальные результаты и планы удалены.';}
$('sourceFilter').addEventListener('change',render);$('rangeFilter').addEventListener('change',render);$('closeDialog').addEventListener('click',()=>$('sessionDialog').close());$('sessionDialog').addEventListener('click',e=>{if(e.target===$('sessionDialog'))$('sessionDialog').close();});$('exportSessions').addEventListener('click',reportSession);$('exportAnswers').addEventListener('click',reportAnswers);$('backup').addEventListener('click',backup);$('restore').addEventListener('click',()=>$('backupFile').click());$('backupFile').addEventListener('change',()=>restore($('backupFile').files[0]));$('erase').addEventListener('click',erase);render();
})();
