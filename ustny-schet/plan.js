(()=>{
'use strict';
const STORAGE='liga_math_daily_plan_v1',TOPICS_STORAGE='liga_math_sprint_v2';
const $=id=>document.getElementById(id);
const skills=window.MathTrainer.topics;
const skillById=Object.fromEntries(skills.map(t=>[t.id,t]));
const MIN_ANSWERS=8;
const library=[
 {title:'Состав числа до 10',topics:['composition'],level:1,minutes:5,desc:'Разложение числа на две части'},
 {title:'Считаем десятками',topics:['tens'],level:1,minutes:5,desc:'Шаги по 10 и числовые последовательности'},
 {title:'Дополняем до круглого',topics:['round'],level:1,minutes:6,desc:'Сколько осталось до десятка?'},
 {title:'Удобные слагаемые',topics:['decompose'],level:1,minutes:5,desc:'Разложи число на простые части'},
 {title:'Таблица умножения',topics:['multiply'],level:1,minutes:6,desc:'Первые табличные случаи'},
 {title:'Таблица деления',topics:['divide'],level:1,minutes:5,desc:'Связь деления с умножением'},
 {title:'Итог недели: основы',topics:['composition','tens','round','decompose','multiply','divide'],level:1,minutes:7,desc:'Повторяем освоенные приёмы'},
 {title:'Складываем удобно',topics:['convenient'],level:1,minutes:5,desc:'Округление с поправкой'},
 {title:'Вычитаем по частям',topics:['subtract_parts'],level:1,minutes:6,desc:'Разложение вычитаемого'},
 {title:'Действия с круглыми числами',topics:['round_ops'],level:1,minutes:6,desc:'Умножение и деление на круглые числа'},
 {title:'Распределительный закон',topics:['distributive'],level:1,minutes:7,desc:'Вычисляй, раскладывая на слагаемые'},
 {title:'Сложение до 100',topics:['hundreds'],level:2,minutes:6,desc:'Разрядные вычисления'},
 {title:'Цепочки действий',topics:['chain'],level:1,minutes:5,desc:'Держим промежуточный результат в уме'},
 {title:'Итог недели: приёмы',topics:['convenient','subtract_parts','round_ops','distributive','hundreds','chain'],level:1,minutes:7,desc:'Повторяем способы рационального счёта'},
 {title:'Состав числа и округление',topics:['composition','round','decompose'],level:2,minutes:5,desc:'Автоматизируем базовые навыки'},
 {title:'Умножение: больше случаев',topics:['multiply'],level:2,minutes:6,desc:'Закрепляем таблицу умножения'},
 {title:'Деление: больше случаев',topics:['divide'],level:2,minutes:6,desc:'Быстро находим частное'},
 {title:'Удобная сумма',topics:['convenient','decompose'],level:2,minutes:5,desc:'Находим выгодное разложение'},
 {title:'Вычитание и округление',topics:['subtract_parts','convenient'],level:2,minutes:6,desc:'Вычитаем по частям и с поправкой'},
 {title:'Большие числа',topics:['hundreds'],level:3,minutes:7,desc:'Считаем до 1000'},
 {title:'Итог недели: ускорение',topics:['multiply','divide','round_ops','hundreds','chain'],level:2,minutes:7,desc:'Смешанный тренинг на устойчивость'},
 {title:'Круглые числа и разряды',topics:['tens','round_ops'],level:3,minutes:5,desc:'Быстрые вычисления с нулями'},
 {title:'Распределительный закон',topics:['distributive'],level:3,minutes:7,desc:'Раскрытие скобок в уме'},
 {title:'Сложение и вычитание до 1000',topics:['hundreds'],level:3,minutes:6,desc:'Сотни, десятки, единицы'},
 {title:'Цепочки: внимание',topics:['chain'],level:2,minutes:5,desc:'Несколько действий подряд'},
 {title:'Таблица без подсказок',topics:['multiply','divide'],level:3,minutes:6,desc:'Уверенность и точность'},
 {title:'Удобные вычисления',topics:['convenient','subtract_parts','distributive'],level:3,minutes:7,desc:'Выбираем эффективный способ'},
 {title:'Итог недели: все навыки',topics:skills.filter(s=>s.group<4).map(s=>s.id),level:2,minutes:7,desc:'Большое смешанное повторение'},
 {title:'Марафон рационального счёта',topics:['decompose','round','convenient','round_ops','distributive'],level:3,minutes:7,desc:'Проверяем вычислительные стратегии'},
 {title:'Финальное испытание',topics:skills.filter(s=>s.group<4).map(s=>s.id),level:3,minutes:7,desc:'Все 12 навыков в одной тренировке'}
];
const advancedLibrary=[
 {title:'Признаки делимости на 2, 5, 10',topics:['divisibility'],level:1,minutes:5,desc:'Определяем без деления в столбик'},
 {title:'Делимость на 3 и 9',topics:['divisibility'],level:2,minutes:6,desc:'Используем сумму цифр'},
 {title:'Делимость: тренировка',topics:['divisibility'],level:3,minutes:6,desc:'Признаки на 4, 25 и 100'},
 {title:'Обыкновенные дроби: одинаковые знаменатели',topics:['fractions'],level:1,minutes:5,desc:'Сложение и вычитание долей'},
 {title:'Дроби: разные знаменатели',topics:['fractions'],level:2,minutes:6,desc:'Приводим к общему знаменателю'},
 {title:'Смешанные числа: выделяем целую часть',topics:['mixed'],level:1,minutes:6,desc:'Переводим неправильную дробь в смешанное число'},
 {title:'Итог первой недели',topics:['divisibility','fractions','mixed'],level:2,minutes:7,desc:'Закрепляем делимость и обыкновенные дроби'},
 {title:'Смешанные → неправильные',topics:['mixed'],level:2,minutes:5,desc:'Целую часть умножаем на знаменатель'},
 {title:'Дроби: сложение и вычитание',topics:['fractions'],level:3,minutes:6,desc:'Находим общий знаменатель'},
 {title:'Десятичные дроби: десятые',topics:['decimals'],level:1,minutes:5,desc:'Сложение и вычитание по разрядам'},
 {title:'Десятичные дроби: сотые',topics:['decimals'],level:2,minutes:6,desc:'Выравниваем разряды при вычислениях'},
 {title:'Смешанные числа: сложение',topics:['mixed'],level:3,minutes:7,desc:'Работа с целой и дробной частью'},
 {title:'Признаки делимости: все основные',topics:['divisibility'],level:4,minutes:6,desc:'2, 3, 4, 5, 6, 8, 9, 10, 15, 25 и 100'},
 {title:'Итог второй недели',topics:['fractions','mixed','decimals','divisibility'],level:2,minutes:7,desc:'Чередуем четыре темы'},
 {title:'Умножение обыкновенных дробей',topics:['fractions'],level:4,minutes:7,desc:'Используем числители и знаменатели'},
 {title:'Деление обыкновенных дробей',topics:['fractions'],level:4,minutes:6,desc:'Умножаем на обратную дробь'},
 {title:'Десятичные: умножение на натуральное',topics:['decimals'],level:3,minutes:6,desc:'Запоминаем место запятой'},
 {title:'Десятичные: деление',topics:['decimals'],level:3,minutes:6,desc:'Делаем делитель удобным'},
 {title:'Смешанные: вычитание',topics:['mixed'],level:3,minutes:6,desc:'Переходим к неправильным дробям'},
 {title:'Делимость: трудные случаи',topics:['divisibility'],level:4,minutes:5,desc:'Признаки 6, 8, 15, 25 и 100'},
 {title:'Итог третьей недели',topics:['fractions','mixed','decimals'],level:3,minutes:7,desc:'Работаем с дробями разных видов'},
 {title:'Десятичные: четыре действия',topics:['decimals'],level:4,minutes:6,desc:'Сложение, вычитание, умножение, деление'},
 {title:'Смешанные: разные знаменатели',topics:['mixed'],level:4,minutes:7,desc:'Приводим к общему знаменателю'},
 {title:'Обыкновенные дроби: четыре действия',topics:['fractions'],level:4,minutes:7,desc:'Выбираем правильный алгоритм'},
 {title:'Сравни способы записи числа',topics:['mixed','fractions','decimals'],level:2,minutes:5,desc:'Обыкновенная, смешанная и десятичная запись'},
 {title:'Признаки делимости — контроль',topics:['divisibility'],level:4,minutes:6,desc:'Узнаём кратность без вычисления частного'},
 {title:'Дроби на скорость',topics:['fractions','decimals'],level:3,minutes:6,desc:'Точность важнее скорости'},
 {title:'Большое повторение',topics:['divisibility','fractions','mixed','decimals'],level:3,minutes:7,desc:'Четыре навыка в одном занятии'},
 {title:'Математическая разминка',topics:['mixed','fractions','decimals'],level:4,minutes:6,desc:'Сложные случаи с дробями'},
 {title:'Финальное испытание блока 2',topics:['divisibility','fractions','mixed','decimals'],level:4,minutes:7,desc:'Итог всей месячной программы'}
];
const planDays=(type,block=1)=>{const list=block===2?advancedLibrary:library;return type==='week'?list.slice(0,7):list;};
const localDate=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function dateAt(start,offset){const [y,m,d]=start.split('-').map(Number);return localDate(new Date(y,m-1,d+offset));}
const formatDate=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('ru-RU',{day:'numeric',month:'short'});};
const defaults=()=>({version:1,activeId:null,plans:[],settings:{enabled:true,time:'19:00',lastNoticeKey:''}});
function load(){try{const obj=JSON.parse(localStorage.getItem(STORAGE));if(obj&&obj.version===1&&Array.isArray(obj.plans)&&obj.settings)return obj;}catch(_){}return defaults();}
let state=load(),type='week',block=1,plan=null,game=null,interval=null,lastTick=0,lastDraftSave=0,refreshTimer=null;
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));if(window.AndroidBridge)window.AndroidBridge.updatePlan(JSON.stringify(state));return true;}catch(e){$('alert').classList.remove('hidden');$('alert').textContent='Не удалось сохранить результаты. Проверьте настройки хранения данных в браузере.';return false;}}
const active=()=>state.plans.find(p=>p.id===state.activeId)||null;
const today=()=>localDate();
function elapsedNotice(p){const t=today();let late=[],due=false;const cells=planDays(p.type,p.block||1);for(let i=0;i<cells.length;i++){const dueDate=dateAt(p.start,i);if(p.completed[i+1])continue;if(dueDate<t)late.push(i+1);if(dueDate===t)due=true;}return {late,due};}
function notifyUser(message,tag){if(!state.settings.enabled)return;
 try {if(window.parent!==window&&window.parent.LigaNotify){window.parent.LigaNotify.show('Лига знаний · Устный счёт',message,tag);return;}
 if('Notification' in window&&Notification.permission==='granted')new Notification('Лига знаний · Устный счёт',{body:message,tag});}catch(_){}
}
function reminders(showInPage=true){const p=active();if(!p||game)return;const {late,due}=elapsedNotice(p);const deadline=state.settings.time||'19:00',clock=new Date().toTimeString().slice(0,5);let message='',key='';
 if(late.length){message=`Пропущено занятий: ${late.length}. Вы можете пройти их сегодня — будущие занятия по-прежнему открываются только по расписанию.`;key=`missed:${today()}:${late.length}`;}
 else if(due&&clock>=deadline){message='Сегодняшние 5–7 минут устного счёта ещё не пройдены. Самое время потренироваться!';key=`today:${today()}`;}
 if(showInPage){const el=$('alert');if(message&&state.settings.enabled){el.textContent='🔔 '+message;el.classList.remove('hidden');el.classList.remove('good');}else if(!el.classList.contains('good'))el.classList.add('hidden');}
 if(message&&key!==state.settings.lastNoticeKey&&state.settings.enabled){state.settings.lastNoticeKey=key;save();notifyUser(message,key);}
}
function persistDraft(){if(!game||!plan)return;plan.drafts[game.day]={day:game.day,activeSec:game.activeSec,history:game.history,current:game.current,prevKey:game.prevKey,answerLocked:$('submit').disabled,questionStart:Date.now()};save();}

function latexMarkup(raw,topic,asFormula=false){
 try{return window.LigaLatex[asFormula?'formula':'inline'](String(raw),topic);}
 catch(_){return String(raw).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
}
function showLatex(id,raw,topic,asFormula=false){document.getElementById(id).innerHTML=latexMarkup(raw,topic,asFormula);}

function updateAnswerUI(p){$('yesno').classList.toggle('hidden',p.kind!=='yesno');$('answer').placeholder=p.kind==='yesno'?'Да или нет':p.kind==='rational'?'1/2, 2 1/3 или 0,5':'Ваш ответ';$('answer').setAttribute('inputmode',p.kind==='rational'?'text':'numeric');}
function chooseQuestion(){let p,attempt=0;do{const sid=game.task.topics[Math.floor(Math.random()*game.task.topics.length)];p=window.MathTrainer.make(sid,game.task.level);attempt++;}while(p.key===game.prevKey&&attempt<20);game.current=p;game.prevKey=p.key;game.questionStart=Date.now();$('questionTopic').textContent=skillById[p.topic].title;showLatex('question',p.expression,p.topic,true);$('answer').value='';$('answer').disabled=false;$('submit').disabled=false;updateAnswerUI(p);$('hint').classList.add('hidden');$('feedback').textContent='';$('feedback').className='playstatus';$('next').classList.add('hidden');}
function setTimerUI(){if(!game)return;const remain=Math.max(0,Math.ceil(game.task.minutes*60-game.activeSec));$('timeLeft').textContent=`${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`;$('timeFill').style.width=`${100*Math.min(1,game.activeSec/(game.task.minutes*60))}%`;$('solved').textContent=game.history.length;$('correct').textContent=game.history.filter(h=>h.correct).length;$('minimum').textContent=game.history.length<MIN_ANSWERS?`Для зачёта: ещё ${MIN_ANSWERS-game.history.length} ответов`:'Минимум ответов набран ✓';}
function tick(){if(!game)return;const now=Date.now();const delta=Math.min(1,Math.max(0,(now-lastTick)/1000));lastTick=now;
 if(document.visibilityState!=='hidden')game.activeSec=Math.min(game.task.minutes*60,game.activeSec+delta);
 setTimerUI();
 if(game.activeSec>=game.task.minutes*60){if(game.history.length>=MIN_ANSWERS){complete();return;}
 $('feedback').textContent=`Время вышло. Решите ещё ${MIN_ANSWERS-game.history.length} примеров, чтобы завершить занятие.`;}
 if(now-lastDraftSave>5000){persistDraft();lastDraftSave=now;}
}
function startDay(day){plan=active();if(!plan)return;const task=planDays(plan.type,plan.block||1)[day-1],date=dateAt(plan.start,day-1);if(!task||date>today()||plan.completed[day])return;
 const draft=plan.drafts?.[day];game={day,task,activeSec:Math.max(0,Number(draft?.activeSec)||0),history:Array.isArray(draft?.history)?draft.history:[],current:draft?.current||null,prevKey:draft?.prevKey||'',questionStart:Date.now()};
 $('setup').classList.add('hidden');$('overview').classList.add('hidden');$('play').classList.remove('hidden');$('alert').classList.add('hidden');
 $('playSubtitle').textContent=`День ${day} · ${formatDate(date)} · ${task.minutes} мин`; $('playTitle').textContent=task.title;$('playDescription').textContent=task.desc;
 if(draft?.answerLocked)game.current=null;
 if(game.current){updateAnswerUI(game.current);$('questionTopic').textContent=skillById[game.current.topic]?.title||'Устный счёт';showLatex('question',game.current.expression,game.current.topic,true);$('answer').value='';$('feedback').textContent='Тренировка восстановлена, продолжайте с текущего примера.';$('next').classList.add('hidden');$('hint').classList.add('hidden');$('submit').disabled=false;$('answer').disabled=false;}
 else chooseQuestion();
 setTimerUI();clearInterval(interval);lastTick=Date.now();lastDraftSave=0;interval=setInterval(tick,250);window.scrollTo(0,0);
 if(window.matchMedia('(min-width: 680px)').matches)$('answer').focus({preventScroll:true});
}
function submit(e){e.preventDefault();if(!game||!game.current||$('submit').disabled)return;const raw=$('answer').value.trim(),p=game.current,checked=window.MathTrainer.check(p,raw);if(!checked.valid){$('feedback').textContent=checked.message;return;}
 const value=checked.user,right=checked.correct;
 game.history.push({topic:p.topic,expression:p.expression,answer:p.answer,user:value,correct:right,seconds:Math.round((Date.now()-game.questionStart)/10)/100,solution:p.solution});
 $('answer').disabled=true;$('submit').disabled=true;$('feedback').className='playstatus '+(right?'ok':'bad');showLatex('feedback',right?'✅ Верно! '+p.solution:`❌ Ответ: ${p.answer}. ${p.solution}`,p.topic);
 $('next').classList.remove('hidden');setTimerUI();persistDraft();
 if(game.activeSec>=game.task.minutes*60&&game.history.length>=MIN_ANSWERS){complete();return;}
 $('next').focus({preventScroll:true});
}
function storageTopics(){try{const v=JSON.parse(localStorage.getItem(TOPICS_STORAGE));return v&&Array.isArray(v.sessions)&&Array.isArray(v.mistakes)?v:{sessions:[],mistakes:[]};}catch(_){return {sessions:[],mistakes:[]};}}
function complete(){if(!game||!plan||plan.completed[game.day])return;
 const record={id:'daily-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),kind:'topics',date:new Date().toISOString(),topic:game.task.topics.length===1?game.task.topics[0]:'all',mode:'daily',level:game.task.level,seconds:game.task.minutes*60,total:game.history.length,correct:game.history.filter(h=>h.correct).length,wrong:game.history.filter(h=>!h.correct).length,avgSeconds:game.history.reduce((n,h)=>n+h.seconds,0)/Math.max(1,game.history.length),dailyPlanId:plan.id,dailyDay:game.day,history:game.history};
 const data=storageTopics();if(!data.sessions.some(s=>s.id===record.id))data.sessions.push(record);if(data.sessions.length>450)data.sessions=data.sessions.slice(-450);
 try{localStorage.setItem(TOPICS_STORAGE,JSON.stringify(data));}catch(_){$('feedback').textContent='Ошибка сохранения: освободите память браузера и попробуйте ещё раз.';return;}
 plan.completed[game.day]={date:new Date().toISOString(),recordId:record.id,total:record.total,correct:record.correct,seconds:record.seconds};
 delete plan.drafts[game.day];
 if(!save()){delete plan.completed[game.day];return;}
 const day=game.day,percent=Math.round(record.correct/record.total*100);stopGame(false);render();$('alert').textContent=`✅ День ${day} выполнен! ${record.correct} из ${record.total} верно (${percent}%). Результат сохранён в общей статистике.`;$('alert').classList.remove('hidden');$('alert').classList.add('good');window.scrollTo(0,0);
}
function stopGame(preserve=true){if(game&&preserve)persistDraft();clearInterval(interval);interval=null;game=null;plan=null;}
function leave(){stopGame();render();window.scrollTo(0,0);}
function streakOf(p){let longest=0,current=0;const t=today();for(let i=1;i<=planDays(p.type,p.block||1).length;i++){const date=dateAt(p.start,i-1);if(date>t)break;if(p.completed[i]){current++;longest=Math.max(longest,current);}else current=0;}return longest;}
function renderCalendar(p){const tasks=planDays(p.type,p.block||1),t=today(),root=$('calendar');root.replaceChildren();for(let i=0;i<tasks.length;i++){
 const day=i+1,task=tasks[i],date=dateAt(p.start,i),done=p.completed[day],locked=date>t,overdue=date<t&&!done,istoday=date===t;
 const box=document.createElement('article');box.className='day '+(done?'done':locked?'locked':overdue?'overdue':istoday?'today':'');
 const topline=document.createElement('div');topline.className='daytop';const num=document.createElement('span');num.className='daynum';num.textContent='День '+day;const status=document.createElement('span');status.className='status';status.textContent=done?'✅ Выполнено':locked?'🔒 Закрыто':overdue?'🟠 Пропущено':'🟣 Сегодня';topline.append(num,status);
 const dateLabel=document.createElement('div');dateLabel.className='daydate';dateLabel.textContent=formatDate(date)+' · '+task.minutes+' мин';
 const title=document.createElement('h3');title.textContent=task.title;const desc=document.createElement('p');desc.textContent=task.desc;
 const btn=document.createElement('button');btn.type='button';btn.className='daybutton';btn.disabled=!!(done||locked);btn.textContent=done?`${done.correct} из ${done.total} · ✓`:locked?'Откроется '+formatDate(date):p.drafts?.[day]?'▶ Продолжить':'Начать занятие →';
 if(!btn.disabled)btn.addEventListener('click',()=>startDay(day));box.append(topline,dateLabel,title,desc,btn);root.append(box);
 }}
function render(){plan=active();$('play').classList.add('hidden');$('setup').classList.toggle('hidden',!!plan);$('overview').classList.toggle('hidden',!plan);if(!plan){$('startDate').min=today();if(!$('startDate').value||$('startDate').value<today())$('startDate').value=today();return;}
 const days=planDays(plan.type,plan.block||1).length,done=Object.keys(plan.completed).length,t=today();let available=0,missed=0;
 for(let i=0;i<days;i++){const d=dateAt(plan.start,i);if(!plan.completed[i+1]&&d<=t)available++;if(!plan.completed[i+1]&&d<t)missed++;}
 $('planTitle').textContent=`Блок ${plan.block||1} · ${plan.type==='week'?'Недельный':'Месячный'} план · ${days} дней`;
 $('planPeriod').textContent=`С ${formatDate(plan.start)} по ${formatDate(dateAt(plan.start,days-1))} · новые дни открываются по календарю`;
 $('doneCount').textContent=done;$('todoCount').textContent=available;$('missedCount').textContent=missed;$('streak').textContent=streakOf(plan);
 $('progressFill').style.width=(100*done/days)+'%';$('progressFill').parentElement.setAttribute('aria-valuenow',String(done));$('progressFill').parentElement.setAttribute('aria-valuemax',String(days));
 $('progressText').textContent=done===days?'🏆 План полностью выполнен! Можно создать следующий.':`${done} из ${days} занятий выполнено · ${Math.round(done/days*100)}% плана`;
 $('remindEnabled').checked=!!state.settings.enabled;$('remindTime').value=state.settings.time||'19:00';
 $('permissionStatus').textContent=window.AndroidBridge?'Android: напоминания о занятиях могут приходить при закрытом приложении после разрешения уведомлений. Время доставки может отличаться из-за энергосбережения.':('Notification' in window&&window.isSecureContext)?`Разрешение браузера: ${Notification.permission==='granted'?'получено':Notification.permission==='denied'?'отклонено':'не запрошено'}. В закрытом файле фоновые уведомления недоступны.`:'На этом способе открытия системные уведомления могут быть недоступны. Напоминания внутри приложения работают при открытии.';
 renderCalendar(plan);reminders(true);
}
function create(){const start=$('startDate').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||start<today()){$('alert').classList.remove('hidden');$('alert').textContent='Дата начала должна быть сегодня или позднее.';return;}
 if(active()&&!confirm('Создать новый план? Текущий останется в истории, результаты тренировок сохранятся.'))return;
 const p={id:'plan-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),type,block,start,createdAt:new Date().toISOString(),completed:{},drafts:{}};
 state.plans.push(p);state.plans=state.plans.slice(-12);state.activeId=p.id;state.settings.lastNoticeKey='';save();$('alert').classList.add('hidden');render();
}
function permission(){try{if(window.AndroidBridge){window.AndroidBridge.requestNotifications();$('permissionStatus').textContent='В Android запрос разрешения появится на экране. Напоминания работают при закрытом приложении, однако система может сдвигать их время.';return;}
if(window.parent!==window&&window.parent.LigaNotify){window.parent.LigaNotify.request();$('permissionStatus').textContent='Проверьте запрос браузера на разрешение уведомлений. Если браузер блокирует уведомления, напоминания останутся внутри приложения.';return;}
 if(!('Notification' in window)||!window.isSecureContext){$('permissionStatus').textContent='Системные уведомления недоступны при этом способе запуска. Напоминания внутри приложения работают.';return;}
 Notification.requestPermission().then(p=>{$('permissionStatus').textContent=p==='granted'?'Системные уведомления разрешены во время работы приложения.':'Системные уведомления не разрешены — используется напоминание внутри приложения.';}).catch(()=>{$('permissionStatus').textContent='Браузер не разрешил запрос. Напоминания внутри приложения работают.';});}catch(_){$('permissionStatus').textContent='Браузер заблокировал уведомления. Напоминания внутри приложения работают.';}}
for(const el of document.querySelectorAll('[data-block]'))el.addEventListener('click',()=>{block=Number(el.dataset.block);document.querySelectorAll('[data-block]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.block)===block)));});
for(const el of document.querySelectorAll('[data-type]'))el.addEventListener('click',()=>{type=el.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));});
$('create').addEventListener('click',create);
$('changePlan').addEventListener('click',()=>{if(!confirm('Создать другой план? Текущие результаты сохранятся в статистике.'))return;state.activeId=null;save();$('alert').classList.add('hidden');render();});
$('answerForm').addEventListener('submit',submit);
$('yesno').addEventListener('click',e=>{const b=e.target.closest('[data-yn]');if(b&&game&&game.current&&!$('submit').disabled){$('answer').value=b.dataset.yn;submit(new Event('submit'));}});$('next').addEventListener('click',()=>{if(game){chooseQuestion();persistDraft();}});
$('pause').addEventListener('click',leave);
$('hintButton').addEventListener('click',()=>{if(game&&game.current){$('hint').textContent='💡 '+game.current.hint;$('hint').classList.toggle('hidden');}});
$('remindEnabled').addEventListener('change',e=>{state.settings.enabled=e.target.checked;state.settings.lastNoticeKey='';save();reminders(true);});
$('remindTime').addEventListener('change',e=>{if(/^\d\d:\d\d$/.test(e.target.value)){state.settings.time=e.target.value;save();reminders(true);}});
$('notificationPermission').addEventListener('click',permission);
window.addEventListener('pagehide',()=>{if(game)persistDraft();});
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.visibilityState==='visible'&&!game){render();}});
refreshTimer=setInterval(()=>{if(!game){if(active())render();}},60000);
if(window.AndroidBridge)window.AndroidBridge.updatePlan(JSON.stringify(state));
render();
})();

// V5.4: учебная подсказка всегда непосредственно под примером.
const _nearHint=document.getElementById('hintNearButton');const _footerHint=document.getElementById('hintButton');
if(_nearHint&&_footerHint){_nearHint.addEventListener('click',()=>_footerHint.click());}
