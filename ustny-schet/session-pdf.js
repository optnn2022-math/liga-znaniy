/* Единый экспорт результатов одного занятия в печатный PDF. Без CSV. */
window.LigaSessionPDF=(function(){
'use strict';
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=value=>Number.isFinite(Number(value))?Number(value):0;
const time=seconds=>{const x=Math.max(0,Math.round(n(seconds)));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0')};
const math=value=>esc(value).replace(/(-?\d+)\s+(\d+)\/(\d+)|(-?\d+)\/(\d+)/g,(_x,w,u,d,a,b)=>{
 const whole=w?esc(w)+'&nbsp;':'';
 return whole+'<span class="fraction"><span>'+esc(u||a)+'</span><span>'+esc(d||b)+'</span></span>';
});
const titleMode={learn:'Изучаю',practice:'Тренировка',sprint:'На скорость',mistakes:'Повторение ошибок',daily:'Ежедневное занятие'};
function documentFor(session){
 const history=Array.isArray(session.history)?session.history:[];
 const solved=history.length,correct=history.filter(h=>h.correct).length;
 const percent=solved?Math.round(100*correct/solved):0;
 const date=new Date(session.date||Date.now());
 const dateString=Number.isFinite(date.getTime())?date.toLocaleString('ru-RU'):'—';
 const kind=session.topicName||'Общий математический спринт';
 const name=esc(kind);
 const elapsed=time(session.seconds);
 const data=history.map((h,i)=>{
 const topic=h.topicName||'';
 return '<tr><td>'+ (i+1) +'</td><td class="expr">'+(topic?'<span class="topic">'+esc(topic)+'</span>':'')+math(h.expression||'')+'</td><td>'+math(h.user==null?'—':h.user)+'</td><td>'+math(h.answer==null?'—':h.answer)+'</td><td class="'+(h.correct?'ok':'error')+'">'+(h.correct?'Верно':'Ошибка')+'</td><td>'+ (Number.isFinite(Number(h.seconds))?n(h.seconds).toFixed(1)+' с':'—')+'</td></tr>' +
 (!h.correct&&h.solution?'<tr class="explain"><td colspan="6">Разбор: '+math(h.solution)+'</td></tr>':'');
 }).join('');
 const css=`@page{size:A4;margin:16mm 13mm 16mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#222844;margin:0;font-size:11pt;line-height:1.38}header{border-bottom:3px solid #6550de;padding:0 0 15px;margin-bottom:16px}h1{margin:0;color:#4838ad;font-size:23pt}h2{margin:12px 0 6px;font-size:14pt}.sub{color:#69718a;margin-top:5px}.cards{display:flex;gap:10px;margin:18px 0 22px}.card{flex:1;background:#f1efff;padding:11px;border-radius:10px;text-align:center}.card strong{font-size:18pt;color:#4532bc;display:block}.card small{color:#626982}table{width:100%;border-collapse:collapse;font-size:9.5pt}th{background:#e8e4ff;color:#32247a;text-align:left}td,th{padding:8px 6px;border-bottom:1px solid #e1e4ec;vertical-align:middle}tr{break-inside:avoid}.ok{color:#097448;font-weight:bold}.error{color:#ba2e36;font-weight:bold}.explain td{background:#fff5e8;color:#624720;font-size:9pt}.expr{font-weight:600}.topic{display:block;font-size:8pt;color:#68718c;font-weight:normal;margin-bottom:2px}.fraction{vertical-align:middle;display:inline-flex;flex-direction:column;line-height:1.08;text-align:center;font-size:.9em;margin:0 2px}.fraction>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 2px}.fraction>span:last-child{padding:2px 3px 0}footer{margin-top:18px;color:#8a8fa2;font-size:8.5pt}@media print{.cards{-webkit-print-color-adjust:exact;print-color-adjust:exact}table{page-break-inside:auto}thead{display:table-header-group}}`;
 return '<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Лига знаний — результаты тренировки</title><style>'+css+'</style></head><body><header><h1>Лига знаний</h1><div class="sub">Индивидуальный отчёт · '+esc(dateString)+'</div></header><h2>'+name+'</h2><div class="sub">Режим: '+esc(titleMode[session.mode]||session.mode||'Тренировка')+' · Уровень: '+esc(session.level||'—')+'</div><div class="cards"><div class="card"><strong>'+solved+'</strong><small>примеров</small></div><div class="card"><strong>'+correct+'</strong><small>верно</small></div><div class="card"><strong>'+percent+'%</strong><small>точность</small></div><div class="card"><strong>'+elapsed+'</strong><small>время</small></div></div><h2>Проверка ответов</h2><table><thead><tr><th>№</th><th>Пример</th><th>Ответ</th><th>Правильно</th><th>Результат</th><th>Время</th></tr></thead><tbody>'+(data||'<tr><td colspan="6">Пока нет решённых примеров.</td></tr>')+'</tbody></table><footer>Учебное приложение «Лига знаний» · Отчёт сформирован на устройстве ученика.</footer></body></html>';
}
function open(session){
 if(!session||!Array.isArray(session.history)||!session.history.length){alert('В этой тренировке пока нет ответов для отчёта.');return;}
 const html=documentFor(session),name='Лига знаний — результаты занятия';
 if(window.AndroidBridge&&typeof window.AndroidBridge.openPdfReport==='function'){window.AndroidBridge.openPdfReport(html,name);return;}
 const iframe=document.createElement('iframe');iframe.setAttribute('aria-hidden','true');iframe.style.cssText='position:fixed;left:-20000px;top:0;width:800px;height:1100px;border:0';document.body.appendChild(iframe);
 iframe.onload=()=>{try{iframe.contentWindow.focus();iframe.contentWindow.print();}catch(e){alert('Не удалось открыть печать: '+e.message)}setTimeout(()=>iframe.remove(),45000)};
 iframe.srcdoc=html;
}
return {open,documentFor};
})();
