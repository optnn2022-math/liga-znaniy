
function stopPageMedia(root){
 root.querySelectorAll('video,audio').forEach(media=>media.pause());
 root.querySelectorAll('iframe').forEach(frame=>{
   try{if(frame.contentDocument)stopPageMedia(frame.contentDocument)}catch(e){}
   const src=frame.getAttribute('src');
   if(src && src!=='about:blank'){frame.dataset.pausedVideoSrc=src;frame.setAttribute('src','about:blank')}
 });
}
function resumePageMedia(root){
 root.querySelectorAll('iframe[data-paused-video-src]').forEach(frame=>{
   frame.setAttribute('src',frame.dataset.pausedVideoSrc);
   delete frame.dataset.pausedVideoSrc;
 });
}
const $=id=>document.getElementById(id);const screens=['landing','progressScreen','topics','mathControlWorks','mathControlTest','history','historyControlWorks','historyBlockQuiz','historyLesson','historyLesson2','historyLesson3','historyQuiz','historyQuiz2','historyQuiz3','lesson','quiz','review','reportScreen','russian','russianLesson1','chinese','chineseLesson1','chineseLesson2','biology','biologyLesson1','biologyLesson2','biologyLesson3','biologyLesson11'];const show=id=>{
 screens.forEach(n=>{const page=$(n);if(page && n!==id && !page.classList.contains('hidden'))stopPageMedia(page)});
 screens.forEach(n=>{const page=$(n);if(page)page.classList.toggle('hidden',n!==id)});
 const target=$(id);if(target)resumePageMedia(target);window.scrollTo(0,0)
};
const russianMethodology=Object.freeze({primarySource:'классические старые издания учебника Ладыженской',definitions:'точные, ясные определения и правила в логике старого издания',tasks:'типы и формулировки упражнений максимально близки к классической методике',modernEdition:'переиздание 2026 года используется для порядка тем и проверки актуальной терминологии'});
const russianMethodRule='Главный методический ориентир — '+russianMethodology.primarySource+': '+russianMethodology.definitions+'; '+russianMethodology.tasks+'. Современное '+russianMethodology.modernEdition+'.';
const chatStorageKey='liga-znaniy-subject-chats-v1';let chatSubject='math';let chatData;try{chatData=JSON.parse(localStorage.getItem(chatStorageKey)||'null')}catch{}if(!chatData||typeof chatData!=='object')chatData={math:[],history:[],biology:[],russian:[],chinese:[]};chatData.math||=[];chatData.history||=[];chatData.biology||=[];chatData.russian||=[];chatData.chinese||=[];
function chatSave(){try{localStorage.setItem(chatStorageKey,JSON.stringify(chatData))}catch{}}
function subjectContext(subject){if(subject==='history')return 'История · 5 класс · отдельный контекст предмета';if(subject==='russian')return 'Русский язык · 5 класс · учимся грамотно писать и ясно выражать мысли';if(subject==='chinese')return 'Китайский язык · первый год · обучение с нуля';if(subject==='biology')return 'Биология · 5 класс'+(document.getElementById('biologyLesson1')?.classList.contains('hidden')?(document.getElementById('biologyLesson2')?.classList.contains('hidden')?'':' · текущая тема: Признаки живых организмов'):' · текущая тема: Что изучает биология?');let current=lessons?.[topic]?.title;return 'Математика · 5 класс'+(current?' · текущая тема: '+current:'');}
function renderChat(){let names={math:'🔢 Репетитор по математике',history:'🏛️ Репетитор по истории',biology:'🌿 Репетитор по биологии',russian:'✏️ Репетитор по русскому языку',chinese:'🏮 Репетитор по китайскому языку'};$('chatTitle').textContent=names[chatSubject];$('chatContext').textContent=subjectContext(chatSubject);let box=$('chatMessages');box.innerHTML='';let arr=chatData[chatSubject]||[];if(!arr.length){let m=document.createElement('div');m.className='chat-msg system';m.textContent=chatSubject==='math'?'Егор, здесь будет отдельный разговор по математике. История этого чата не смешивается с историей.':chatSubject==='history'?'Егор, здесь будет отдельный разговор по истории. Математические вопросы сюда не попадут.':chatSubject==='biology'?'Егор, здесь можно сохранять вопросы по биологии. Разговор по этому предмету хранится отдельно.':chatSubject==='chinese'?'Егор, задавай здесь вопросы по китайскому языку. Будем разбирать произношение, тоны, пиньинь, слова и иероглифы. Другие предметы с этим чатом не смешиваются.':'Егор, задавай здесь вопросы по русскому языку. Вместе разберём правила, орфограммы, предложения и непонятные слова. Другие предметы с этим чатом не смешиваются.';box.append(m)}arr.slice(-30).forEach(x=>{let m=document.createElement('div');m.className='chat-msg user';m.textContent=x.text;box.append(m)});box.scrollTop=box.scrollHeight;}
function openChat(subject){chatSubject=subject;$('chatDrawer').classList.remove('hidden');renderChat();$('chatInput').focus()}
function sendChat(){let text=$('chatInput').value.trim();if(!text)return;chatData[chatSubject].push({text,date:new Date().toISOString(),context:subjectContext(chatSubject)});if(chatData[chatSubject].length>100)chatData[chatSubject]=chatData[chatSubject].slice(-100);chatSave();$('chatInput').value='';renderChat()}
document.querySelectorAll('[data-chat-subject]').forEach(b=>b.onclick=()=>openChat(b.dataset.chatSubject));$('chatClose').onclick=()=>$('chatDrawer').classList.add('hidden');$('chatSend').onclick=sendChat;$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});


const russianBlocks=[{"title":"Старт и повторение начальной школы","topics":["Богатство и выразительность русского языка","Лингвистика как наука о языке","Звуки и буквы. Правописание гласных и согласных в корнях слов","Буквы И, У, А после шипящих","Части речи","Глагол","Имя существительное","Имя прилагательное","Местоимение","Словосочетание. Предложение","Пунктуация"]},{"title":"Язык, речь, текст и стили","topics":["Язык и общение","Виды речи. Речь устная и письменная","Монолог","Прямая речь","Диалог. Полилог","Читаем по-разному","Слушание (аудирование)","Что мы знаем о тексте","Тема текста","Главная мысль (идея) текста","Абзац","Связь предложений в тексте","Повествование как функционально-смысловой тип речи","Рассказ как разновидность текста","Рассказ на основе услышанного","Описание как функционально-смысловой тип речи. Описание предмета","Рассуждение как функционально-смысловой тип речи","Доказательства в рассуждении","Функциональные разновидности языка. Разговорная речь. Язык художественной литературы","Функциональные стили"]},{"title":"Фонетика, графика и орфоэпия","topics":["Фонетика как раздел лингвистики","Гласные звуки","Согласные звуки","Изменение звуков в потоке речи","Согласные твёрдые и мягкие","Согласные звонкие и глухие","Графика","Алфавит","Обозначение мягкости согласных с помощью мягкого знака","Двойная роль букв Е, Ё, Ю, Я","Слог. Ударение. Орфоэпия","Фонетический анализ слова","Интонация, её функции"]},{"title":"Орфография и лексикология","topics":["Орфография. Орфограмма","Раздельное написание предлогов с другими словами","Разделительные Ъ и Ь","Слово и его лексическое значение","Однозначные и многозначные слова","Прямое и переносное значения слов","Омонимы","Синонимы","Антонимы","Паронимы","Словари","Основные способы толкования слов","Лексический анализ слова"]},{"title":"Морфемика и правописание морфем","topics":["Морфема — минимальная значимая единица языка","Изменение и образование слов","Окончание","Основа слова","Корень слова","Суффикс","Приставка","Чередование звуков","Беглые гласные","Варианты морфем","Морфемный анализ слова","Правописание корней с безударными проверяемыми и непроверяемыми гласными","Правописание корней с проверяемыми и непроверяемыми согласными","Правописание корней с непроизносимыми согласными","Буквы Ё — О после шипящих в корне","Правописание гласных и согласных в приставках","Буквы З и С на конце приставок","Буквы Ы — И после Ц","Буквы Ы — И после приставок"]},{"title":"Морфология и имя существительное — основы","topics":["Морфология как раздел лингвистики","Имя существительное как часть речи","Имена существительные одушевлённые и неодушевлённые","Имена существительные собственные и нарицательные","Род имён существительных","Имена существительные, которые имеют форму только множественного числа","Имена существительные, которые имеют форму только единственного числа","Типы склонения имён существительных","Падеж имён существительных","Правописание безударных окончаний имён существительных в единственном числе","Множественное число имён существительных","Правописание О — Е после шипящих и Ц в окончаниях существительных"]},{"title":"Имя существительное — сложные случаи и чередования","topics":["Разносклоняемые имена существительные","Буква Е в суффиксе -ЕН- существительных на -МЯ","Несклоняемые имена существительные","Род несклоняемых имён существительных","Имена существительные общего рода","Морфологический анализ имени существительного","НЕ с существительными","Буквы Ч и Щ в суффиксе -ЧИК- — -ЩИК-","Гласные в суффиксах имён существительных -ЕК- — -ИК- (-ЧИК-)","Гласные О — Е после шипящих в суффиксах существительных","Буквы А // О в корне -ЛАГ- — -ЛОЖ-","Буквы А // О в корне -ГАР- — -ГОР-","Буквы А // О в корне -ЗАР- — -ЗОР-","Буквы А // О в корне -РАСТ- — -РАЩ- — -РОС-","Буквы А // О в корнях -КЛАН- — -КЛОН-, -СКАК- — -СКОЧ-"]},{"title":"Имя прилагательное","topics":["Имя прилагательное как часть речи","Правописание безударных окончаний имён прилагательных. Гласные после шипящих в окончаниях","Описание животного","Прилагательные полные и краткие","НЕ с прилагательными","Буквы О — Е после шипящих и Ц в суффиксах имён прилагательных","Морфологический анализ имени прилагательного"]},{"title":"Глагол","topics":["Глагол как часть речи","НЕ с глаголами","Инфинитив и его грамматические свойства","Глаголы совершенного и несовершенного вида","Возвратные и невозвратные глаголы","Правописание -ТСЯ и -ТЬСЯ в глаголах","Правописание корней с чередованием Е // И","Изменение глаголов по временам","Прошедшее время глаголов","Настоящее время глаголов","Будущее время глаголов","Спряжение глаголов","Как определить спряжение глагола с безударным личным окончанием","Правописание мягкого знака в окончаниях глаголов 2-го лица единственного числа","Употребление времён глагола","Правописание гласных в суффиксах глаголов","Морфологический анализ глагола"]},{"title":"Синтаксис — словосочетание и основа предложения","topics":["Понятие о синтаксисе","Пунктуация как раздел лингвистики","Словосочетание как единица синтаксиса","Виды словосочетаний по морфологическим признакам","Синтаксический анализ словосочетания","Предложение и его признаки","Виды предложений по цели высказывания","Виды предложений по эмоциональной окраске. Восклицательные предложения","Главные члены предложения. Подлежащее и сказуемое","Тире между подлежащим и сказуемым"]},{"title":"Синтаксис — простые, осложнённые и сложные предложения","topics":["Нераспространённые и распространённые предложения","Второстепенные члены предложения. Дополнение","Определение","Обстоятельство","Виды обстоятельств по значению","Синтаксический анализ простого предложения","Простые осложнённые предложения. Предложения с однородными членами","Знаки препинания в предложениях с однородными членами","Предложения с обращениями","Письмо","Синтаксический анализ простого осложнённого предложения","Пунктуационный анализ простого предложения","Простые и сложные предложения","Синтаксический анализ сложного предложения"]},{"title":"Итоговое повторение","topics":["Разделы науки о языке","Орфограммы в приставках и в корнях слов","Орфограммы в окончаниях слов","Употребление букв Ъ и Ь","Монолог. Диалог. Полилог","Знаки препинания в простых и сложных предложениях и в предложениях с прямой речью"]}];
const russianProgressKey='liga-znaniy-russian-progress-v1';let russianProgress={topic1Goals:0,topic1Completed:false,lastActivity:null};try{russianProgress=Object.assign(russianProgress,JSON.parse(localStorage.getItem(russianProgressKey)||'{}'))}catch{}function saveRussianProgress(){try{localStorage.setItem(russianProgressKey,JSON.stringify(russianProgress))}catch{}}
function openRussianLesson1(){
 show('russianLesson1');
}
function syncRussianStandaloneProgress(){
 try{
  const lesson=JSON.parse(localStorage.getItem('liga_russian_lesson1_preview_v1')||'{}');
  const newGoals=Math.max(0,Math.min(8,Object.values(lesson.goals||{}).filter(Boolean).length));
  const oldGoals=Number(russianProgress.topic1Goals||0);
  if(newGoals>oldGoals){data.points=(Number(data.points)||0)+(newGoals-oldGoals)*10;russianProgress.topic1Goals=newGoals;save()}
  if(lesson.completed)russianProgress.topic1Completed=true;
  if(newGoals>0||lesson.completed){russianProgress.lastActivity={date:lesson.updated||new Date().toISOString(),text:'Русский язык → Урок 1 → ⚽ '+newGoals+'/8'};saveRussianProgress()}
 }catch{}
}
function renderRussian(){
 syncRussianStandaloneProgress();
 let list=$('russianList');list.innerHTML='';let topicNumber=0;
 russianBlocks.forEach((block,blockIndex)=>{
  let heading=document.createElement('h2');heading.className='list-head';heading.style.margin='18px 0 9px';heading.textContent='Блок '+(blockIndex+1)+'. '+block.title;list.append(heading);
  block.topics.forEach(name=>{const n=++topicNumber,available=n===1;let row=document.createElement('button');row.type='button';row.className='row '+(available?'russian-open-row':'locked russian-row');row.setAttribute('aria-disabled',String(!available));row.innerHTML='<span class="num"></span><span class="name"></span><span class="goals"></span>';row.querySelector('.num').textContent=String(n).padStart(3,'0');row.querySelector('.name').textContent=name;const goals=row.querySelector('.goals');if(available){const g=Number(russianProgress.topic1Goals||0);goals.textContent=g?'⚽ '+g+' / 8':'Открыть →';row.onclick=openRussianLesson1}else{goals.textContent='🔒';row.onclick=()=>{$('russianStatus').textContent='Тема №'+n+' «'+name+'» включена в маршрут и откроется после подготовки урока.'}}list.append(row)});
  let test=document.createElement('button');test.type='button';test.className='row locked russian-block-test';test.setAttribute('aria-disabled','true');test.innerHTML='<span class="num">📝</span><span class="name"><strong></strong><small></small></span><span class="goals">🔒</span>';test.querySelector('strong').textContent=blockIndex===russianBlocks.length-1?'Итоговый тест за курс':'Тест по блоку '+(blockIndex+1);test.querySelector('small').textContent=block.title+' · 15–20 вопросов уровня выше среднего';test.onclick=()=>{$('russianStatus').textContent=(blockIndex===russianBlocks.length-1?'Итоговый тест':'Тест по блоку '+(blockIndex+1))+' откроется после подготовки уроков этого блока.'};list.append(test);
 });
}


const chineseProgressKey='liga-znaniy-chinese-progress-v1';
let chineseProgress={topic1Completed:false,topic1Goals:0,topic1Stars:0,topic2Completed:false,topic2Goals:0,topic2Stars:0,lastActivity:null,goalSchema:0};
try{chineseProgress=Object.assign(chineseProgress,JSON.parse(localStorage.getItem(chineseProgressKey)||'{}'))}catch{}
function saveChineseProgress(){try{localStorage.setItem(chineseProgressKey,JSON.stringify(chineseProgress))}catch{}}
if(Number(chineseProgress.goalSchema||0)<2){
 const oldGoals=Math.max(0,Math.min(3,Number(chineseProgress.topic1Goals||0)));
 chineseProgress.topic1Goals=[0,4,5,8][oldGoals];chineseProgress.goalSchema=2;
 if(chineseProgress.topic1Goals===8)chineseProgress.topic1Completed=true;
 saveChineseProgress();
}

const chineseBlocks=[
 {title:'Первый шаг в китайский',topics:['Первое приветствие: 你好 nǐ hǎo','Китайский язык: четыре ключа','Как устроен китайский слог','Четыре тона и нейтральный тон','Первый и второй тоны','Третий и четвёртый тоны','Учимся слышать и повторять тоны']},
 {title:'Пиньинь без путаницы',topics:['Простые финали a, o, e','Финали i, u, ü','Инициали b, p, m, f','Инициали d, t, n, l','Инициали g, k, h и j, q, x','Инициали zh, ch, sh, r и z, c, s','Правила чтения пиньиня и постановки знака тона']},
 {title:'Первые иероглифы',topics:['Как появились и устроены китайские иероглифы','Основные черты китайских иероглифов','Правила порядка написания черт','Ключи и смысловые части иероглифа','Первые иероглифы: 你, 好, 我, 是','Как узнавать и набирать иероглифы на клавиатуре']},
 {title:'Давайте познакомимся',topics:['Приветствия с 你好 и 您好','Обращение к учителю и одноклассникам','Как назвать своё имя: 我叫…','Местоимения 我, 你, 他, 她','Предложения со связкой 是','Общий вопрос с частицей 吗','Множественное число с 们','Благодарность, прощание и полный диалог знакомства']},
 {title:'Мои друзья',topics:['Кто это? Вопросительное слово 谁','Он и она: 他 и 她','Принадлежность с частицей 的','Слова о друзьях и знакомых','Как спросить о друге','Краткие ответы 是 и 不是','Мини-проект «Мой друг»']},
 {title:'Числа и день рождения',topics:['Числа от 0 до 10','Числа от 11 до 99','Когда употреблять 二, а когда 两','Глагол 有 и отрицание 没有','Счётные слова 个 и 张','Как спросить и назвать возраст','Дата рождения и календарная дата','Поздравления и эмоции: 生日快乐 и 很高兴']},
 {title:'Страна, город и адрес',topics:['Откуда ты? 哪儿 и 哪里','Страны и национальности','Конструкция 从…来','Где ты живёшь? Глагол 住','Город, улица и простой адрес','Расширенное представление себя']},
 {title:'Моя семья и профессии',topics:['Члены семьи','Вопросы о количестве: 几 и 多少','Счётное слово 口 для членов семьи','Сколько человек в твоей семье?','Основные профессии','Кем работают родители?','Итоговый проект «Я и моя семья»']}
];
function renderChinese(){
 let list=$('chineseList');list.innerHTML='';let topicNumber=0;
 const topic1Goals=Math.max(0,Math.min(8,Number(chineseProgress.topic1Goals||0)));
 const topic2Goals=Math.max(0,Math.min(8,Number(chineseProgress.topic2Goals||0)));
 const topic1Done=!!chineseProgress.topic1Completed||topic1Goals===8;
 const topic2Done=!!chineseProgress.topic2Completed||topic2Goals===8;
 chineseBlocks.forEach((block,blockIndex)=>{
  let heading=document.createElement('h2');heading.className='list-head';heading.style.margin='18px 0 9px';heading.textContent='Блок '+(blockIndex+1)+'. '+block.title;list.append(heading);
  block.topics.forEach(name=>{
   const n=++topicNumber;let row=document.createElement('button');row.type='button';row.className='row chinese-row';
   row.innerHTML='<span class="num"></span><span class="name"></span><span class="goals"></span>';
   row.querySelector('.num').textContent=String(n).padStart(2,'0');row.querySelector('.name').textContent=name;
   if(n===1){
    row.classList.add('ready');if(topic1Done)row.classList.add('completed');
    row.querySelector('.goals').textContent=topic1Goals>0?'⚽ '+topic1Goals+' / 8':'Открыть →';
    row.onclick=()=>{show('chineseLesson1');requestAnimationFrame(()=>{try{$('chineseLesson1Frame').contentWindow.postMessage({type:'request-chinese-progress'},'*')}catch{}})};
   }else if(n===2&&topic1Done){
    row.classList.add('ready');if(topic2Done)row.classList.add('completed');
    row.querySelector('.goals').textContent=topic2Goals>0?'⚽ '+topic2Goals+' / 8':'Открыть →';
    row.onclick=()=>{show('chineseLesson2');requestAnimationFrame(()=>{try{const frame=$('chineseLesson2Frame');frame.contentWindow.postMessage({type:'request-chinese-progress'},'*');frame.contentWindow.postMessage({type:'resume-chinese-lesson2'},'*')}catch{}})};
   }else{
    row.classList.add('locked');row.setAttribute('aria-disabled','true');row.querySelector('.goals').textContent='🔒';
    row.onclick=()=>{$('chineseStatus').textContent=n===2?'Урок №2 откроется после 8 / 8 голов в уроке №1.':'Тема №'+n+' «'+name+'» включена в маршрут и откроется после подготовки урока.'};
   }
   list.append(row);
  });
  let test=document.createElement('button');test.type='button';test.className='row locked chinese-block-test';test.setAttribute('aria-disabled','true');test.innerHTML='<span class="num">📝</span><span class="name"><strong></strong><small></small></span><span class="goals">🔒</span>';test.querySelector('strong').textContent='Тест по блоку '+(blockIndex+1);test.querySelector('small').textContent=block.title+' · 15–20 вопросов';test.onclick=()=>{$('chineseStatus').textContent='Тест по блоку '+(blockIndex+1)+' откроется после подготовки уроков этого блока.'};list.append(test);
 });
 let finalTest=document.createElement('button');finalTest.type='button';finalTest.className='row locked chinese-final-test';finalTest.setAttribute('aria-disabled','true');finalTest.innerHTML='<span class="num">🏆</span><span class="name"><strong>Итоговый тест за курс</strong><small>Все 56 тем · 20 вопросов и итоговая разговорная миссия</small></span><span class="goals">🔒</span>';finalTest.onclick=()=>{$('chineseStatus').textContent='Итоговый тест откроется после подготовки всех восьми блоков курса.'};list.append(finalTest);
 const goals=topic1Goals+topic2Goals;
 const goalTotal=$('chineseGoalTotal');if(goalTotal)goalTotal.textContent=goals+' / 16';
 const goalSummary=$('chineseGoalSummary');if(goalSummary)goalSummary.setAttribute('aria-label','Голы по китайскому: '+goals+' из 16');
 $('chineseStatus').textContent=topic2Done?'Уроки №1–2 завершены · ⚽ '+goals+' / 16. Следующие темы пока готовятся.':topic1Done?'Урок №1 завершён · ⚽ '+topic1Goals+' / 8. Урок №2 «Китайский язык: четыре ключа» открыт.':'Урок №1 доступен. Набери 8 / 8 голов — и откроется урок №2 «Китайский язык: четыре ключа».';
}

window.addEventListener('message',e=>{
 const d=e.data;if(!d||d.type!=='chinese-topic-progress')return;
 const topic=Number(d.topic);if(topic!==1&&topic!==2)return;
 const goalsKey='topic'+topic+'Goals',completedKey='topic'+topic+'Completed',starsKey='topic'+topic+'Stars';
 const newGoals=Math.max(0,Math.min(8,Number(d.goals||0)));
 const oldBest=Number(chineseProgress[goalsKey]||0);
 chineseProgress[goalsKey]=Math.max(oldBest,newGoals);
 chineseProgress[completedKey]=!!chineseProgress[completedKey]||!!d.completed||chineseProgress[goalsKey]===8;
 const targetStars=chineseProgress[goalsKey]*10;
 const oldStars=Number(chineseProgress[starsKey]||0);
 if(targetStars>oldStars){data.points=(Number(data.points)||0)+(targetStars-oldStars);chineseProgress[starsKey]=targetStars;save()}
 if(newGoals>0||d.completed)chineseProgress.lastActivity={date:new Date().toISOString(),text:'Китайский язык → Урок '+topic+' → ⚽ '+chineseProgress[goalsKey]+'/8'};
 saveChineseProgress();renderChinese();syncGlobalStars();
});

const historyTitles=window.LIGA_COURSES.history.topics.map(t=>t.title);
const historyGroups=window.LIGA_COURSES.history.groups;
const historyTests=new Set(window.LIGA_COURSES.history.tests);
function renderHistory(){let list=$('historyList');list.innerHTML='';historyTitles.forEach((name,index)=>{let n=index+1;if(historyGroups[n]){let heading=document.createElement('h2');heading.className='list-head';heading.style.margin='18px 0 9px';heading.textContent=historyGroups[n];list.append(heading)}let row=document.createElement('button');row.type='button';row.innerHTML='<span class="num"></span><span class="name"></span><span class="goals"></span>';row.querySelector('.num').textContent=String(n).padStart(2,'0');row.querySelector('.name').textContent=name;if(n===1||n===2||n===3){row.className='row ready';let goals=n===1?(historyState.goals1||0):n===2?(historyState.goals2||0):(historyState.goals3||0);row.querySelector('.goals').textContent='⚽ '+goals+' / 7';row.onclick=()=>show(n===1?'historyLesson':n===2?'historyLesson2':'historyLesson3')}else{row.className='row locked';row.setAttribute('aria-disabled','true');row.querySelector('.goals').textContent='🔒';row.onclick=()=>$('historyStatus').textContent='Егор, урок «'+name+'» пока готовится. Сейчас доступны темы №1–3.'}list.append(row);if(historyTests.has(n)){let test=document.createElement('button');test.className='row locked';test.type='button';test.setAttribute('aria-disabled','true');test.innerHTML='<span class="num">📝</span><span class="name"></span><span class="goals">🔒</span>';let title=n===34?'Итоговый тест':'Тест после темы '+n;test.querySelector('.name').textContent=title;
if(n===3){test.className='row ready';test.removeAttribute('aria-disabled');test.querySelector('.goals').textContent='⚽ '+(historyState.block1GoalsV2||0)+' / '+historyBlockQuizQuestions.length;test.onclick=()=>startHistoryBlockQuiz()}
else{test.onclick=()=>$('historyStatus').textContent='Егор, '+title.toLowerCase()+' откроется после подготовки вопросов по блоку.'}
list.append(test)}});let block=(historyState.goals1||0)+(historyState.goals2||0)+(historyState.goals3||0);$('historyStatus').textContent='Темы №1–3 доступны · Голы первого блока: ⚽ '+block+' / 21.'}

const historyStateKey='liga-znaniy-history-progress-v1';let historyState;try{historyState=JSON.parse(localStorage.getItem(historyStateKey)||'null')}catch{}if(!historyState)historyState={completed1:false,mini:{},goals1:0};historyState.mini||={};historyState.goals1=Math.min(7,historyState.goals1||0);historyState.quiz1||={best:historyState.goals1||0,done:{}};historyState.quiz1.done||={};historyState.goals2=Math.min(7,historyState.goals2||0);historyState.quiz2||={best:historyState.goals2||0,done:{}};historyState.quiz2.done||={};historyState.goals3=Math.min(7,historyState.goals3||0);historyState.quiz3||={best:historyState.goals3||0,done:{}};historyState.quiz3.done||={};historyState.block1GoalsV2=Math.min(16,historyState.block1GoalsV2||0);
function saveHistory(){try{localStorage.setItem(historyStateKey,JSON.stringify(historyState))}catch{}}
const historyQuiz1=[
 {q:'Как называется наука, которая изучает прошлое человечества?',o:['История','Биология','Астрономия','География'],a:0,e:'История изучает прошлое человечества.'},
 {q:'Что помогает историкам узнавать о жизни людей в прошлом?',o:['Прогноз погоды','Расписание уроков','Исторические источники','Только современные фильмы'],a:2,e:'Исторические источники сохраняют сведения о прошлом.'},
 {q:'Что относится к вещественным историческим источникам?',o:['Современная электронная почта','Древняя монета','Прогноз на завтра','Школьное расписание'],a:1,e:'Древняя монета — предмет, сохранившийся из прошлого.'},
 {q:'Что относится к письменным историческим источникам?',o:['Каменный топор','Глиняный сосуд без надписей','Остатки древнего здания','Древняя летопись'],a:3,e:'Летопись содержит письменные сведения о событиях прошлого.'},
 {q:'Чем занимается археолог?',o:['Предсказывает будущее','Изучает прошлое по вещественным находкам','Составляет прогноз погоды','Изучает только современные города'],a:1,e:'Археологи исследуют материальные следы жизни людей прошлого.'},
 {q:'Кого традиционно называют «отцом истории»?',o:['Пифагора','Архимеда','Геродота','Гиппократа'],a:2,e:'Геродота традиционно называют «отцом истории».'},
 {q:'Зачем люди изучают историю?',o:['Чтобы понимать прошлое и лучше объяснять настоящее','Только чтобы запоминать даты','Чтобы точно предсказывать будущее','Только чтобы изучать войны'],a:0,e:'История помогает понимать развитие общества и связь прошлого с настоящим.'}
];
let historyQuizStep=0, historyQuizSolved=false, historyQuizRun=0, historyQuizAttempts=0, historyQuizFinished=false;
function renderHistoryQuiz(){let item=historyQuiz1[historyQuizStep];historyQuizSolved=false;historyQuizAttempts=0;$('historyQuizStep').textContent='Вопрос '+(historyQuizStep+1)+' / '+historyQuiz1.length;$('historyQuizQuestion').textContent=item.q;$('historyQuizAnswers').innerHTML='';$('historyQuizFeedback').className='feedback hidden';$('historyQuizNext').classList.add('hidden');item.o.forEach((option,i)=>{let b=document.createElement('button');b.className='answer';b.textContent=option;b.onclick=()=>pickHistoryQuiz(i);$('historyQuizAnswers').append(b)});$('historyQuizScore').textContent='⚽ '+historyQuizRun+' / 7'}
function pickHistoryQuiz(index){if(historyQuizSolved)return;let item=historyQuiz1[historyQuizStep],buttons=[...$('historyQuizAnswers').children];historyQuizAttempts++;let firstChoice=historyQuizAttempts===1;if(index===item.a){historyQuizSolved=true;buttons[index].classList.add('correct');buttons.forEach(b=>b.disabled=true);if(firstChoice){historyQuizRun++;goalFlash();$('historyQuizFeedback').textContent='⚽ ГОЛ! '+item.e;$('historyQuizFeedback').className='feedback';}else{$('historyQuizFeedback').textContent='Верно! '+item.e+' Но гол не засчитывается: в счёт идёт только первый выбранный ответ.';$('historyQuizFeedback').className='feedback';}$('historyQuizNext').classList.remove('hidden');$('historyQuizNext').textContent=historyQuizStep===6?'Завершить тест':'Следующий ход →';$('historyQuizScore').textContent='⚽ '+historyQuizRun+' / 7';}else{buttons[index].classList.add('wrong');buttons[index].disabled=true;$('historyQuizFeedback').textContent=firstChoice?'Пока не гол. Этот вопрос уже не принесёт гол, но найди верный ответ и разберись в теме.':'Пока не совпало. Попробуй ещё раз — правильный ответ всё равно важно найти.';$('historyQuizFeedback').className='feedback warn';}}
function finishHistoryQuiz(){awardGlobalStars('history-topic1-test',historyQuizRun*10+5);historyState.goals1=Math.max(historyState.goals1||0,historyQuizRun);historyState.quiz1.best=historyState.goals1;historyState.mini.historyQuiz7=true;historyState.completed1=true;recordHistoryActivity('История → Тема 1 → мини-тест → ⚽ '+historyQuizRun+'/7');saveHistory();renderHistory();historyQuizFinished=true;$('historyQuizStep').textContent='Тест завершён';$('historyQuizQuestion').textContent='Матч завершён!';$('historyQuizAnswers').innerHTML='';$('historyQuizFeedback').textContent='Егор, результат: ⚽ '+historyQuizRun+' / 7. Результат сохранён возле темы №1. Лучший результат: ⚽ '+historyState.goals1+' / 7.';$('historyQuizFeedback').className='feedback';$('historyQuizNext').classList.remove('hidden');$('historyQuizNext').textContent='Вернуться к темам';$('historyQuizScore').textContent='⚽ '+historyQuizRun+' / 7';$('historyQuizBest').textContent='Тема №1 пройдена.';}
function completeHistoryMiniTest(topic){
let run=topic===1?historyQuizRun:topic===2?historyQuiz2Run:historyQuiz3Run;
awardGlobalStars('history-topic'+topic+'-test',run*10+5);
historyState['goals'+topic]=Math.max(historyState['goals'+topic]||0,run);
historyState['quiz'+topic].best=historyState['goals'+topic];
historyState.mini['historyQuiz'+topic]=true;
historyState['completed'+topic]=true;
recordHistoryActivity('История → Тема '+topic+' → мини-тест → ⚽ '+run+'/7');
saveHistory();
renderHistory();
let pre=topic===1?'historyQuiz':('historyQuiz'+topic);
$(pre+'Step').textContent='Тест завершён';
$(pre+'Question').textContent='Матч завершён!';
$(pre+'Answers').innerHTML='';
$(pre+'Feedback').textContent='Егор, результат сохранён: ⚽ '+run+' / 7. Лучший результат: ⚽ '+historyState['goals'+topic]+' / 7.';
$(pre+'Feedback').className='feedback';
$(pre+'Next').classList.remove('hidden');
$(pre+'Next').textContent='К темам';
if(topic===1) historyQuizFinished=true;
if(topic===2) historyQuiz2Finished=true;
if(topic===3) historyQuiz3Finished=true;
}

const historyBlockQuizQuestions=[
{q:'При раскопках нашли глиняный сосуд и надпись на камне. Как правильно классифицировать эти источники?',o:['Сосуд — вещественный, надпись — письменный','Оба только письменные','Сосуд — письменный, надпись — устный','Оба только устные'],a:0,e:'Сосуд изучают как вещь; текст надписи — письменное свидетельство.'},
{q:'Два письменных свидетельства называют разные даты одного события. Как историку проверить их?',o:['Взять более позднее свидетельство без проверки','Сравнить свидетельства между собой и с другими источниками','Выбрать более длинный текст','Отказаться от изучения события'],a:1,e:'Сопоставление независимых свидетельств помогает обнаружить ошибки и уточнить дату.'},
{q:'О поселении не сохранилось письменных документов. Какие находки прежде всего помогут изучить повседневную жизнь?',o:['Только современные фотографии местности','Орудия, посуда и остатки жилищ','Только даты правления царей','Только легенда, записанная много веков спустя'],a:1,e:'Предметы и остатки построек показывают занятия и быт людей.'},
{q:'Археолог нашёл каменное орудие. Какой вывод наиболее обоснован одним этим фактом?',o:['Его владельцы умели обрабатывать камень','Его владельцы знали письменность','Они жили ровно 100 лет','Они называли свою страну Египтом'],a:0,e:'По орудию можно судить об обработке камня; остальные выводы требуют иных свидетельств.'},
{q:'Как соотносятся 1700 и 1701 годы по векам?',o:['1700 — XVII век; 1701 — XVIII век','Оба — XVIII век','1700 — XVIII век; 1701 — XVII век','Оба — XVII век'],a:0,e:'XVII век завершился в 1700 году, XVIII начался в 1701 году.'},
{q:'Какой год наступил через пять лет после 73 года до н. э.?',o:['78 год до н. э.','68 год до н. э.','73 год н. э.','69 год до н. э.'],a:1,e:'В счёте лет до нашей эры при движении вперёд числа годов уменьшаются: 73 → 72 → 71 → 70 → 69 → 68.'},
{q:'Какое событие произошло раньше: 350 год до н. э. или 320 год до н. э.?',o:['350 год до н. э.','320 год до н. э.','Они относятся к одному году','Без месяца сравнить невозможно'],a:0,e:'В счёте до нашей эры большее число лет указывает на более раннее время.'},
{q:'При смене правителя в Древнем Египте годы правления считали заново. Почему запись «пятый год правления» без имени царя неточна?',o:['Пятый год был только у одного царя','Одинаковый номер года мог быть у разных царей','В Египте не считали годы','Такой год всегда означает 5 год нашей эры'],a:1,e:'Если счёт начинался заново при каждом царе, нужен и номер года, и имя правителя.'},
{q:'Какой дополнительный источник поможет проверить рассказ о древней битве, записанный много позже событий?',o:['Независимые находки на предполагаемом месте битвы','Только повторение того же рассказа','Современное художественное кино','Случайно выбранная легенда о другом месте'],a:0,e:'Независимые находки можно сопоставить с письменным рассказом.'},
{q:'Где находки костей древнейших людей, возраст которых более двух миллионов лет, помогают изучать начало человеческой истории?',o:['В Восточной Африке','В Антарктиде','В Северной Европе','В Южной Америке'],a:0,e:'Именно находки в Восточной Африке рассматриваются в изученных материалах.'},
{q:'В каком наборе перечислены занятия древнейших людей до появления земледелия?',o:['Охота и собирательство','Промышленность и железнодорожная торговля','Печатание книг и морская торговля','Фабричное производство и банковское дело'],a:0,e:'Для древнейших людей основными были собирательство и охота.'},
{q:'Почему острый край расколотой гальки был полезнее округлой поверхности для раннего орудия?',o:['Им можно было резать и обрабатывать добычу','Он превращал камень в металл','Он позволял записывать буквы','Он заменял огонь'],a:0,e:'Раскалывание камня создавало острые края для работы.'},
{q:'Какое наблюдение лучше подтверждает, что древнейшие люди изготавливали орудия?',o:['Находка камней со следами целенаправленной обработки','Находка только целых округлых камней в русле реки','Изменение русла реки','Следы выпадения дождя'],a:0,e:'Следы намеренной обработки свидетельствуют об изготовлении орудия.'},
{q:'Почему совместная жизнь повышала шансы древнейших людей выжить?',o:['Было легче сообща добывать пищу и защищаться','Каждый мог не искать пищу вообще','Исчезала необходимость в орудиях труда','Любое природное явление становилось безопасным'],a:0,e:'Совместная добыча пищи и защита давали группе преимущества.'},
{q:'Почему долгое время для людей было особенно важно не дать погаснуть уже горевшему костру?',o:['Они ещё не умели самостоятельно добывать огонь','Огонь был нужен только для украшения','Они могли использовать огонь только днём','Костёр запрещалось разводить повторно'],a:0,e:'Когда люди не умели добывать огонь, уже имевшийся костёр приходилось поддерживать.'},
{q:'Какой вывод о жизни древнейших людей подтверждается одновременно орудиями и следами костра?',o:['Они использовали материалы и огонь, чтобы приспосабливаться к условиям жизни','Они знали современные станки','Все они жили в построенных городах','Они не нуждались в пище'],a:0,e:'Орудия и использование огня показывают способы приспособления, но не доказывают существование современных технологий.'}
];
let historyBlockQuizStep=0,historyBlockQuizSolved=false,historyBlockQuizRun=0,historyBlockQuizAttempts=0,historyBlockQuizFinished=false;

function startHistoryBlockQuiz(){
historyBlockQuizStep=0;historyBlockQuizRun=0;historyBlockQuizFinished=false;
renderHistoryBlockQuiz();show('historyBlockQuiz');
}
function renderHistoryBlockQuiz(){
let item=historyBlockQuizQuestions[historyBlockQuizStep];
historyBlockQuizSolved=false;historyBlockQuizAttempts=0;
$('historyBlockQuizStep').textContent='Вопрос '+(historyBlockQuizStep+1)+' из '+historyBlockQuizQuestions.length;
$('historyBlockQuizQuestion').textContent=item.q;
$('historyBlockQuizFeedback').className='feedback hidden';
$('historyBlockQuizFeedback').textContent='';
$('historyBlockQuizNext').classList.add('hidden');
$('historyBlockQuizNext').textContent=historyBlockQuizStep===historyBlockQuizQuestions.length-1?'Завершить тест':'Следующий вопрос →';
$('historyBlockQuizScore').textContent='⚽ '+historyBlockQuizRun+' / '+historyBlockQuizQuestions.length;
$('historyBlockQuizBest').textContent='Лучший результат: ⚽ '+(historyState.block1GoalsV2||0)+' / '+historyBlockQuizQuestions.length;
let box=$('historyBlockQuizAnswers');box.innerHTML='';
item.o.forEach((label,i)=>{
 let b=document.createElement('button');b.type='button';b.className='answer';b.textContent=label;
 b.onclick=()=>{
  if(historyBlockQuizSolved||b.disabled)return;
  historyBlockQuizAttempts++;
  if(i===item.a){
   historyBlockQuizSolved=true;b.classList.add('correct');
   box.querySelectorAll('.answer').forEach(x=>x.disabled=true);
   if(historyBlockQuizAttempts===1){historyBlockQuizRun++;goalFlash();$('historyBlockQuizFeedback').textContent='⚽ ГОЛ! '+item.e}
   else $('historyBlockQuizFeedback').textContent='Верно. '+item.e;
   $('historyBlockQuizFeedback').className='feedback';
   $('historyBlockQuizScore').textContent='⚽ '+historyBlockQuizRun+' / '+historyBlockQuizQuestions.length;
   $('historyBlockQuizNext').classList.remove('hidden');
  }else{
   b.classList.add('wrong');b.disabled=true;
   $('historyBlockQuizFeedback').textContent='Пока не совпало. Попробуй другой вариант.';
   $('historyBlockQuizFeedback').className='feedback';
  }
 };box.append(b);
});
}
function finishHistoryBlockQuiz(){
awardGlobalStars('history-block1-test-v2',historyBlockQuizRun*10+5);
historyState.block1GoalsV2=Math.max(historyState.block1GoalsV2||0,historyBlockQuizRun);
historyState.mini.historyBlockQuizV2=true;recordHistoryActivity('История → тест по темам 1–3 → ⚽ '+historyBlockQuizRun+'/'+historyBlockQuizQuestions.length);saveHistory();renderHistory();
historyBlockQuizFinished=true;
$('historyBlockQuizStep').textContent='Тест завершён';
$('historyBlockQuizQuestion').textContent='Матч завершён!';
$('historyBlockQuizAnswers').innerHTML='';
$('historyBlockQuizFeedback').textContent='Егор, результат: ⚽ '+historyBlockQuizRun+' / '+historyBlockQuizQuestions.length+'. Лучший результат: ⚽ '+historyState.block1GoalsV2+' / '+historyBlockQuizQuestions.length+'.';
$('historyBlockQuizFeedback').className='feedback';
$('historyBlockQuizNext').classList.remove('hidden');$('historyBlockQuizNext').textContent='К темам';
$('historyBlockQuizScore').textContent='⚽ '+historyBlockQuizRun+' / '+historyBlockQuizQuestions.length;
$('historyBlockQuizBest').textContent='Тест по темам 1–3 завершён.';
}
$('historyBlockQuizBack').onclick=()=>{renderHistory();show('history')};
$('historyBlockQuizNext').onclick=()=>{
if(historyBlockQuizFinished){renderHistory();show('history');return}
if(!historyBlockQuizSolved)return;
if(historyBlockQuizStep<historyBlockQuizQuestions.length-1){historyBlockQuizStep++;renderHistoryBlockQuiz()}else finishHistoryBlockQuiz()
};
function setupHistoryLesson(){document.querySelectorAll('[data-hq]').forEach(box=>{box.querySelectorAll('.history-choice').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;let ok=btn.dataset.correct==='1';if(ok){box.querySelectorAll('.history-choice').forEach(b=>b.disabled=true);btn.classList.add('correct');let f=box.querySelector('[data-hfeedback]');f.textContent='Верно, Егор! Продолжаем путешествие.';f.classList.remove('hidden');historyState.mini[box.dataset.hq]=true;saveHistory()}else{btn.classList.add('wrong');btn.disabled=true;let f=box.querySelector('[data-hfeedback]');f.textContent='Пока не совпало. Попробуй другой вариант.';f.classList.remove('hidden')}})});$('historyStartQuiz').onclick=()=>{historyQuizRun=0;historyQuizStep=0;historyQuizFinished=false;renderHistoryQuiz();$('historyQuizBest').textContent='Лучший результат: ⚽ '+(historyState.goals1||0)+' / 7';show('historyQuiz')};$('historyQuizBack').onclick=()=>show('historyLesson');$('historyQuizNext').onclick=()=>{if(historyQuizFinished){renderHistory();show('history');return}if(!historyQuizSolved)return;if(historyQuizStep<6){historyQuizStep++;renderHistoryQuiz()}else completeHistoryMiniTest(1)};}


const historyQuiz2=[
 {q:'Что такое исторический источник?',o:['Только старинная книга','Любой памятник прошлого, помогающий изучать историю человеческого общества','Только предмет из музея','Только рассказ современного человека'],a:1,e:'Исторический источник — памятник прошлого, по которому можно изучать историю человеческого общества.'},
 {q:'Что относится к письменным историческим источникам?',o:['Глиняный сосуд без надписи','Каменный топор','Древняя рукопись','Остатки жилища'],a:2,e:'Рукопись сохраняет сведения в письменной форме.'},
 {q:'Какой предмет относится к вещественным источникам?',o:['Древняя монета','Легенда','Летопись','Письмо'],a:0,e:'Монета — материальный предмет, сохранившийся от людей прошлого.'},
 {q:'Что относится к устным историческим источникам?',o:['Крепостная стена','Глиняная табличка с текстом','Старинная монета','Предание, передаваемое из поколения в поколение'],a:3,e:'Предания и сказания могут передаваться устно от поколения к поколению.'},
 {q:'Почему археология особенно важна для изучения дописьменного времени?',o:['Письменных свидетельств этого времени нет или крайне мало','Археологи изучают только письменные книги','В дописьменное время не было предметов быта','Археология изучает только современность'],a:0,e:'Когда письменности ещё не было, материальные находки становятся важнейшими свидетельствами жизни людей.'},
 {q:'Что может сделать историк, изучая несколько разных источников об одном событии?',o:['Использовать только самый красивый источник','Сравнить сведения и проверить, в чём они совпадают или различаются','Сразу отбросить все письменные источники','Не учитывать происхождение источников'],a:1,e:'Сопоставление разных источников помогает точнее восстановить картину прошлого.'},
 {q:'Какой набор состоит только из исторических источников?',o:['Летопись, древняя монета, старинное предание','Учебное расписание на завтра, прогноз погоды, калькулятор','Современная реклама, пустой лист, новая игрушка','Только вымышленные рассказы современных авторов'],a:0,e:'Летопись, древняя монета и старинное предание относятся к разным видам исторических источников.'}
];
let historyQuiz2Step=0,historyQuiz2Solved=false,historyQuiz2Run=0,historyQuiz2Attempts=0,historyQuiz2Finished=false;
function renderHistoryQuiz2(){let item=historyQuiz2[historyQuiz2Step];historyQuiz2Solved=false;historyQuiz2Attempts=0;$('historyQuiz2Step').textContent='Вопрос '+(historyQuiz2Step+1)+' / '+historyQuiz2.length;$('historyQuiz2Question').textContent=item.q;$('historyQuiz2Answers').innerHTML='';$('historyQuiz2Feedback').className='feedback hidden';$('historyQuiz2Next').classList.add('hidden');item.o.forEach((option,i)=>{let b=document.createElement('button');b.className='answer';b.textContent=option;b.onclick=()=>pickHistoryQuiz2(i);$('historyQuiz2Answers').append(b)});$('historyQuiz2Score').textContent='⚽ '+historyQuiz2Run+' / 7'}
function pickHistoryQuiz2(index){if(historyQuiz2Solved)return;let item=historyQuiz2[historyQuiz2Step],buttons=[...$('historyQuiz2Answers').children];historyQuiz2Attempts++;let firstChoice=historyQuiz2Attempts===1;if(index===item.a){historyQuiz2Solved=true;buttons[index].classList.add('correct');buttons.forEach(b=>b.disabled=true);if(firstChoice){historyQuiz2Run++;goalFlash();$('historyQuiz2Feedback').textContent='⚽ ГОЛ! '+item.e;}else{$('historyQuiz2Feedback').textContent='Верно! '+item.e+' Но гол не засчитывается: в счёт идёт только первый выбранный ответ.'}$('historyQuiz2Feedback').className='feedback';$('historyQuiz2Next').classList.remove('hidden');$('historyQuiz2Next').textContent=historyQuiz2Step===6?'Завершить тест':'Следующий ход →';$('historyQuiz2Score').textContent='⚽ '+historyQuiz2Run+' / 7'}else{buttons[index].classList.add('wrong');buttons[index].disabled=true;$('historyQuiz2Feedback').textContent=firstChoice?'Пока не гол. Этот вопрос уже не принесёт гол, но найди верный ответ и разберись почему.':'Попробуй ещё раз — найди верный ответ.';$('historyQuiz2Feedback').className='feedback'}}
function finishHistoryQuiz2(){awardGlobalStars('history-topic2-test',historyQuiz2Run*10+5);historyState.goals2=Math.max(historyState.goals2||0,historyQuiz2Run);historyState.quiz2.best=historyState.goals2;historyState.mini.historyQuiz2=true;historyState.completed2=true;saveHistory();renderHistory();historyQuiz2Finished=true;$('historyQuiz2Step').textContent='Тест завершён';$('historyQuiz2Question').textContent='Матч завершён!';$('historyQuiz2Answers').innerHTML='';$('historyQuiz2Feedback').textContent='Егор, результат: ⚽ '+historyQuiz2Run+' / 7. Результат сохранён возле темы №2. Лучший результат: ⚽ '+historyState.goals2+' / 7.';$('historyQuiz2Feedback').className='feedback';$('historyQuiz2Next').classList.remove('hidden');$('historyQuiz2Next').textContent='Вернуться к темам';$('historyQuiz2Score').textContent='⚽ '+historyQuiz2Run+' / 7';$('historyQuiz2Best').textContent='Тема №2 пройдена.'}
function setupHistoryLesson2(){document.querySelectorAll('[data-hq2]').forEach(box=>{box.querySelectorAll('.history-choice').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;let ok=btn.dataset.correct==='1';if(ok){box.querySelectorAll('.history-choice').forEach(b=>b.disabled=true);btn.classList.add('correct');let f=box.querySelector('[data-hfeedback2]');f.textContent='Верно, Егор! Продолжаем исследование.';f.classList.remove('hidden');historyState.mini[box.dataset.hq2]=true;saveHistory()}else{btn.classList.add('wrong');btn.disabled=true;let f=box.querySelector('[data-hfeedback2]');f.textContent='Пока не совпало. Попробуй другой вариант.';f.classList.remove('hidden')}})});$('historyLesson2Back').onclick=()=>{renderHistory();show('history')};$('historyStartQuiz2').onclick=()=>{historyQuiz2Run=0;historyQuiz2Step=0;historyQuiz2Finished=false;renderHistoryQuiz2();$('historyQuiz2Best').textContent='Лучший результат: ⚽ '+(historyState.goals2||0)+' / 7';show('historyQuiz2')};$('historyQuiz2Back').onclick=()=>show('historyLesson2');$('historyQuiz2Next').onclick=()=>{if(historyQuiz2Finished){renderHistory();show('history');return}if(!historyQuiz2Solved)return;if(historyQuiz2Step<6){historyQuiz2Step++;renderHistoryQuiz2()}else completeHistoryMiniTest(2)};}


const historyQuiz3=[
 {q:'Где, по мнению учёных, появились древнейшие люди?',o:['В Африке','В Австралии','В Америке','В Антарктиде'],a:0,e:'Учёные связывают появление древнейших людей с Африкой.'},
 {q:'Что отличало древнейших людей от животных?',o:['Умение летать','Изготовление орудий труда','Жизнь только в воде','Наличие письменности'],a:1,e:'Древнейшие люди умели изготавливать простейшие орудия труда.'},
 {q:'Какой материал чаще всего использовали для первых орудий?',o:['Стекло','Железо','Камень','Пластик'],a:2,e:'Одним из главных материалов для первых орудий был камень.'},
 {q:'Какими были основные занятия древнейших людей?',o:['Земледелие и торговля','Ремесло и мореплавание','Строительство городов','Собирательство и охота'],a:3,e:'Основу жизни составляли собирательство и охота.'},
 {q:'Почему древнейшие люди старались жить группами?',o:['Вместе было легче защищаться и добывать пищу','Чтобы проводить выборы','Чтобы строить дворцы','Чтобы вести письменные записи'],a:0,e:'Совместная жизнь помогала добывать пищу и защищаться от опасностей.'},
 {q:'Какое значение имел огонь для древнейших людей?',o:['Только освещал пещеру','Давал тепло, защищал и помогал готовить пищу','Использовался только для украшения','Был нужен для письма'],a:1,e:'Огонь давал тепло, защиту и позволял готовить пищу.'},
 {q:'Какое достижение стало одним из важнейших в жизни древнейших людей?',o:['Изобретение телефона','Строительство железных дорог','Овладение огнём','Печатание книг'],a:2,e:'Овладение огнём стало важнейшим шагом в жизни древнейших людей.'}
];
let historyQuiz3Step=0,historyQuiz3Solved=false,historyQuiz3Run=0,historyQuiz3Attempts=0,historyQuiz3Finished=false;
function renderHistoryQuiz3(){let item=historyQuiz3[historyQuiz3Step];historyQuiz3Solved=false;historyQuiz3Attempts=0;$('historyQuiz3Step').textContent='Вопрос '+(historyQuiz3Step+1)+' / '+historyQuiz3.length;$('historyQuiz3Question').textContent=item.q;$('historyQuiz3Answers').innerHTML='';$('historyQuiz3Feedback').className='feedback hidden';$('historyQuiz3Next').classList.add('hidden');item.o.forEach((option,i)=>{let b=document.createElement('button');b.className='answer';b.textContent=option;b.onclick=()=>pickHistoryQuiz3(i);$('historyQuiz3Answers').append(b)});$('historyQuiz3Score').textContent='⚽ '+historyQuiz3Run+' / 7'}
function pickHistoryQuiz3(index){if(historyQuiz3Solved)return;let item=historyQuiz3[historyQuiz3Step],buttons=[...$('historyQuiz3Answers').children];historyQuiz3Attempts++;let firstChoice=historyQuiz3Attempts===1;if(index===item.a){historyQuiz3Solved=true;buttons[index].classList.add('correct');buttons.forEach(b=>b.disabled=true);if(firstChoice){historyQuiz3Run++;goalFlash();$('historyQuiz3Feedback').textContent='⚽ ГОЛ! '+item.e}else{$('historyQuiz3Feedback').textContent='Верно! '+item.e+' Но гол не засчитывается: в счёт идёт только первый выбранный ответ.'}$('historyQuiz3Feedback').className='feedback';$('historyQuiz3Next').classList.remove('hidden');$('historyQuiz3Next').textContent=historyQuiz3Step===6?'Завершить тест':'Следующий ход →';$('historyQuiz3Score').textContent='⚽ '+historyQuiz3Run+' / 7'}else{buttons[index].classList.add('wrong');buttons[index].disabled=true;$('historyQuiz3Feedback').textContent=firstChoice?'Пока не гол. Этот вопрос уже не принесёт гол, но найди верный ответ и разберись почему.':'Попробуй ещё раз — найди верный ответ.';$('historyQuiz3Feedback').className='feedback warn'}}
function finishHistoryQuiz3(){awardGlobalStars('history-topic3-test',historyQuiz3Run*10+5);historyState.goals3=Math.max(historyState.goals3||0,historyQuiz3Run);historyState.quiz3.best=historyState.goals3;historyState.mini.historyQuiz3=true;historyState.completed3=true;saveHistory();renderHistory();historyQuiz3Finished=true;$('historyQuiz3Step').textContent='Тест завершён';$('historyQuiz3Question').textContent='Матч завершён!';$('historyQuiz3Answers').innerHTML='';$('historyQuiz3Feedback').textContent='Егор, результат: ⚽ '+historyQuiz3Run+' / 7. Лучший результат темы №3: ⚽ '+historyState.goals3+' / 7. Голы первого блока: ⚽ '+((historyState.goals1||0)+(historyState.goals2||0)+(historyState.goals3||0))+' / 21.';$('historyQuiz3Feedback').className='feedback';$('historyQuiz3Next').classList.remove('hidden');$('historyQuiz3Next').textContent='Вернуться к темам';$('historyQuiz3Score').textContent='⚽ '+historyQuiz3Run+' / 7';$('historyQuiz3Best').textContent='Тема №3 пройдена.'}
function setupHistoryLesson3(){document.querySelectorAll('[data-hq3]').forEach(box=>{box.querySelectorAll('.history-choice').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;let ok=btn.dataset.correct==='1';if(ok){box.querySelectorAll('.history-choice').forEach(b=>b.disabled=true);btn.classList.add('correct');let f=box.querySelector('[data-hfeedback3]');f.textContent='Верно, Егор! Продолжаем путешествие.';f.classList.remove('hidden');historyState.mini[box.dataset.hq3]=true;saveHistory()}else{btn.classList.add('wrong');btn.disabled=true;let f=box.querySelector('[data-hfeedback3]');f.textContent='Пока не совпало. Попробуй другой вариант.';f.classList.remove('hidden')}})});$('historyLesson3Back').onclick=()=>{renderHistory();show('history')};$('historyStartQuiz3').onclick=()=>{historyQuiz3Run=0;historyQuiz3Step=0;historyQuiz3Finished=false;renderHistoryQuiz3();$('historyQuiz3Best').textContent='Лучший результат: ⚽ '+(historyState.goals3||0)+' / 7';show('historyQuiz3')};$('historyQuiz3Back').onclick=()=>show('historyLesson3');$('historyQuiz3Next').onclick=()=>{if(historyQuiz3Finished){renderHistory();show('history');return}if(!historyQuiz3Solved)return;if(historyQuiz3Step<6){historyQuiz3Step++;renderHistoryQuiz3()}else completeHistoryMiniTest(3)};}

const q=(id,prompt,options,answer,hint,explain,kind='practice')=>({id,prompt,options,answer,hint,explain,kind});
const lessons=[
{title:'Натуральные числа',video:'https://rutube.ru/video/d58105ad6015e4c50fa5a8364d35a0bb/',embed:'d58105ad6015e4c50fa5a8364d35a0bb',questions:[
q('n-v1','Какие числа называют натуральными?',['Числа для счёта предметов','Все числа с запятой','Только чётные числа','Только числа больше 100'],0,'Вспомни, как считают мячи: один, два, три…','Натуральные числа используют при счёте предметов.','video'),
q('n-v2','Какое число идёт сразу после 999?',['990','1000','1001','9990'],1,'К 999 прибавь единицу.','999 + 1 = 1000.','video'),
q('n-1','Сколько натуральных чисел между 7 и 12?',['3','4','5','6'],1,'Выпиши числа строго между 7 и 12.','Это 8, 9, 10 и 11: всего четыре.'),
q('n-2','Какое из чисел не относится к натуральным числам для счёта?',['17','0','205','1'],1,'Можно ли посчитать ноль предметов как первый предмет?','В принятом здесь определении ряд натуральных чисел начинается с 1.'),
q('n-3','Какое утверждение о натуральном ряде верно?',['Он начинается с нуля','У каждого натурального числа есть следующее','У каждого натурального числа есть предыдущее','Он заканчивается на самом большом числе'],1,'К любому натуральному числу можно прибавить единицу.','У каждого натурального числа есть следующее; у числа 1 нет предыдущего натурального числа.'),
q('n-4','Какое число предшествует 1000?',['990','999','1001','998'],1,'Вычти из 1000 единицу.','1000 − 1 = 999.'),
q('n-5','Сколько натуральных чисел строго между 9995 и 10003?',['6','7','8','9'],1,'Перечисли числа после 9995 и до 10003, не включая границы.','Это 9996, 9997, 9998, 9999, 10000, 10001, 10002: всего семь.')
]},
{title:'Сравнение чисел',video:'https://rutube.ru/video/c8dbbf2581b2c6f89ffe1b8dcb73d59f/',embed:'c8dbbf2581b2c6f89ffe1b8dcb73d59f',questions:[
q('c-v1','Как сравнить натуральные числа с разным количеством цифр?',['Больше число с большим количеством цифр','Больше число с меньшим количеством цифр','Всегда сравнивать последнюю цифру','Они равны'],0,'Сравни, например, 99 и 100.','100 больше 99: у него больше цифр.','video'),
q('c-v2','С какого разряда сравнивают числа одинаковой длины?',['С единиц','Со старшего разряда','С десятков в любом числе','Случайно'],1,'Смотри слева направо.','Начинают со старшего разряда.','video'),
q('c-1','Сравни 507 и 570.',['507 < 570','507 > 570','507 = 570','Сравнить нельзя'],0,'Сотни равны, сравни десятки.','0 десятков меньше 7 десятков.'),
q('c-2','Какое число наибольшее?',['999','1000','998','909'],1,'Четырёхзначное число больше любого трёхзначного.','1000 — единственное четырёхзначное число.'),
q('c-3','Выбери верное неравенство.',['2405 > 2450','2405 = 2450','2405 < 2450','2450 < 2405'],2,'Тысячи и сотни равны; сравни десятки.','В числе 2405 десятков 0, в 2450 — 5.'),
q('c-4','Расположи числа 14, 41, 104 по возрастанию.',['104, 41, 14','14, 41, 104','41, 14, 104','14, 104, 41'],1,'Сначала меньшее двузначное число, затем большее, затем трёхзначное.','14 < 41 < 104.'),
q('c-5','Какое число удовлетворяет двойному неравенству 12 407 < □ < 12 470?',['12 407','12 417','12 470','12 704'],1,'Проверь обе границы: число должно быть строго больше левой и строго меньше правой.','12 407 < 12 417 < 12 470.')
]},
{title:'Признаки делимости',video:'https://rutube.ru/video/0429e5992dbd8b1996dea0581081368d/',embed:'0429e5992dbd8b1996dea0581081368d',questions:[
q('d-v1','Число делится и на 2, и на 5. Какой должна быть его последняя цифра?',['0','2','5','Любая чётная'],0,'Вспомни окончания чисел, которые делятся на 2 и на 5.','Общая последняя цифра — 0; такое число делится также на 10.','video'),
q('d-v2','Сумма цифр числа равна 18. Какие выводы о делимости можно сделать?',['Оно делится на 3 и на 9','Только на 3','Только на 9','Нельзя сделать вывод'],0,'Какие признаки делимости используют сумму цифр?','18 делится и на 3, и на 9, поэтому исходное число тоже делится на оба числа.','video'),
q('d2-1','Какое пятизначное число делится на 4?',['23 516','23 514','23 518','23 522'],0,'Проверь делимость на 4 по двум последним цифрам.','У числа 23 516 последние две цифры образуют 16; 16 делится на 4.'),
q('d2-2','Какое число делится на 9?',['81 278','81 269','81 279','81 277'],2,'Сложи цифры каждого числа; сумма должна делиться на 9.','У числа 81 279 сумма цифр равна 27, а 27 делится на 9 (и на 3).'),
q('d2-3','Какое число делится на 5, но не делится на 10?',['24 730','24 735','24 734','24 738'],1,'Для делимости на 5 подходят окончания 0 и 5; на 10 подходит только 0.','24 735 оканчивается на 5, поэтому делится на 5, но не на 10.'),
q('d2-4','Какое число делится на 2, но не делится на 4?',['12 312','12 316','12 319','12 314'],3,'Для 2 проверь последнюю цифру, для 4 — две последние.','12 314 оканчивается на чётную цифру 4, но 14 не делится на 4.'),
q('d2-5','Какое число делится одновременно на 3, 4 и 10?',['45 110','45 130','45 125','45 120'],3,'Проверь сумму цифр, две последние цифры и последнюю цифру.','Для 45 120 сумма цифр равна 12, последние две цифры — 20, последняя — 0: число делится на 3, 4 и 10.'),
q('d2-6','Какое число делится на 4 и 9, но не делится на 10?',['81 216','81 218','81 226','81 220'],0,'Проверь две последние цифры, сумму цифр и последнюю цифру.','Для 81 216 последние две цифры образуют 16, сумма цифр 18, а последняя цифра не равна 0.'),
q('d2-7','Какое число делится одновременно на 2, 3, 4, 5, 9 и 10?',['45 350','45 340','45 360','45 390'],2,'Проверяй последнюю цифру, две последние цифры и сумму цифр.','45 360 оканчивается на 0, последние две цифры образуют 60, сумма цифр равна 18. Все шесть признаков выполнены.')
]},
{title:'Многозначные числа и разряды',video:'https://rutube.ru/video/5da54f70887a949076edfaf18b7a97ef/',embed:'5da54f70887a949076edfaf18b7a97ef',questions:[
q('p-v1','Как разбивают многозначное число на классы при чтении?',['Справа налево по три цифры','Слева направо по две цифры','Каждую цифру записывают отдельно','Разбивают только после миллионов'],0,'Раздели 304052718 справа на группы по три цифры.','Получаются классы: 304 | 052 | 718.','video'),
q('p-v2','Что означает цифра 0 в записи 304 052 718 на месте сотен тысяч?',['В этом числе нет сотен тысяч','Число нельзя прочитать','В нём нет тысяч вообще','Все цифры справа также равны нулю'],0,'Ноль занимает своё место в классе тысяч.','В классе тысяч записано 052: сотен тысяч нет, десятков тысяч 5, тысяч 2.','video'),
q('p-1','Какая цифра в разряде десятков тысяч числа 507 042?',['0','7','4','5'],0,'Раздели число на классы: 507 | 042.','В классе тысяч 507: сотен тысяч 5, десятков тысяч 0, тысяч 7.'),
q('p-2','В записи числа 304 052 718 что означает цифра 5?',['5 сотен тысяч','5 десятков тысяч','5 тысяч','5 сотен'],1,'Цифра 5 находится посередине класса тысяч.','Она обозначает 50 000, то есть 5 десятков тысяч.'),
q('p-3','Как цифрами записать «семь миллионов пять тысяч сорок два»?',['7 500 042','7 050 042','7 005 042','7 005 420'],2,'Запиши классы по три цифры: миллионы | тысячи | единицы.','Получаем 7 | 005 | 042, то есть 7 005 042.'),
q('p-4','Какая сумма разрядных слагаемых равна 5 060 407?',['5 000 000 + 60 000 + 400 + 7','5 000 000 + 6 000 + 400 + 7','5 000 000 + 600 000 + 40 + 7','5 000 000 + 60 000 + 40 + 7'],0,'Нулевые разряды не дают ненулевых слагаемых.','5 060 407 = 5 000 000 + 60 000 + 400 + 7.'),
q('p-5','Какое число получится, если в числе 304 052 718 заменить 5 десятков тысяч на 6 десятков тысяч?',['304 062 718','304 052 728','304 152 718','304 053 718'],0,'Меняется только цифра десятков тысяч в классе 052.','Класс тысяч станет 062; число увеличится на 10 000 и станет 304 062 718.')
]},
{title:'Натуральные числа на числовом луче',video:'https://rutube.ru/video/4d7692c02a86ea8d154e9fe8bec26af0/',embed:'4d7692c02a86ea8d154e9fe8bec26af0',questions:[
q('ray-v1','Что нужно отметить на числовом луче, чтобы можно было показывать числа?',['Начало отсчёта и единичный отрезок','Только точку 5','Начало отсчёта и второй конец луча','Только направление'],0,'Найди на рисунке нуль и расстояние между 0 и 1.','Нужны начало отсчёта, направление и единичный отрезок. Направление луча здесь задано вправо.','video'),
q('ray-v2','Что означает запись A(4) на числовом луче?',['Точка A находится через четыре единичных отрезка от нуля','Точка A имеет длину 4 см при любом масштабе','На луче всего четыре точки','A — четвёртое натуральное число'],0,'Координата показывает положение точки относительно начала отсчёта.','Координата точки A равна 4: от нуля до A четыре единичных отрезка.','video'),
q('ray-1','Единичный отрезок занимает 3 клетки. Какова координата точки в 12 клетках справа от нуля?',['3','4','9','12'],1,'Определи, сколько отрезков по 3 клетки укладывается в 12 клетках.','12 : 3 = 4 единичных отрезка, значит координата равна 4.'),
q('ray-2','Единичный отрезок занимает 2 клетки. Сколько клеток от нуля до точки M(7)?',['7','9','14','16'],2,'Каждая единица на луче — это 2 клетки.','От нуля до M(7) семь единичных отрезков: 7 · 2 = 14 клеток.'),
q('ray-3','Точки A(3) и B(8) отмечены на одном числовом луче. Сколько единичных отрезков между ними?',['3','5','8','11'],1,'Посчитай переходы от 3 к 8.','Между A(3) и B(8) пять единичных отрезков: 8 − 3 = 5.'),
q('ray-4','Точка P находится на два единичных отрезка левее точки Q(9). Какова координата P?',['7','8','10','11'],0,'На луче движение влево уменьшает координату.','9 − 2 = 7, поэтому P(7).'),
q('ray-5','Почему в начале числового луча стоит 0, хотя натуральный ряд начинается с 1?',['0 нужен как начало отсчёта','0 — самое маленькое натуральное число','На числовом луче нельзя отмечать 1','Все числа на луче равны 0'],0,'От какой точки удобно откладывать единичные отрезки?','Нуль обозначает начало отсчёта; первые натуральные числа располагаются правее него.')
]}
];
const group=[
q('g3-1','Сколько натуральных чисел строго между 9 876 и 10 014?',['136','137','138','139'],1,'','10 014 − 9 876 − 1 = 137.'),
q('g3-2','Сколько переходов к следующему числу нужно сделать от 49 997 до 50 006?',['8','9','10','11'],1,'','50 006 − 49 997 = 9 переходов.'),
q('g3-3','Какие числа идут в натуральном ряду подряд, без пропуска и повтора?',['99 998, 99 999, 100 000, 100 001','99 998, 99 999, 100 001, 100 002','99 998, 99 999, 100 000, 100 000','99 998, 100 000, 100 001, 100 002'],0,'','При каждом переходе число увеличивается ровно на 1.'),
q('g3-4','Что обозначает цифра 7 в числе 508 072 041?',['700 000','70 000','7 000','700'],1,'','508 | 072 | 041: семёрка стоит в разряде десятков тысяч.'),
q('g3-5','Запиши цифрами: шесть миллионов сорок тысяч триста пять.',['6 400 305','6 040 305','6 004 305','6 040 035'],1,'','Классы: 6 миллионов | 040 тысяч | 305 единиц.'),
q('g3-6','Какая сумма разрядных слагаемых равна 9 005 070?',['9 000 000 + 50 000 + 70','9 000 000 + 5 000 + 70','9 000 000 + 5 000 + 700','9 000 000 + 500 + 70'],1,'','9 005 070 = 9 000 000 + 5 000 + 70.'),
q('g3-7','Сколько полных тысяч содержится в числе 4 027 816?',['27','4 027','4 028','27 816'],1,'','4 027 816 = 4 027 · 1 000 + 816, значит полных тысяч 4 027.'),
q('g3-8','На числовом луче единичный отрезок равен 4 клеткам. Какова координата точки в 28 клетках вправо от нуля?',['6','7','24','32'],1,'','28 : 4 = 7 единичных отрезков.'),
q('g3-9','Сколько единичных отрезков между точками A(3) и B(11)?',['7','8','11','14'],1,'','11 − 3 = 8 единичных отрезков.'),
q('g3-10','Точка C(8) находится на четыре единичных отрезка правее точки D. Какова координата D?',['4','8','12','32'],0,'','Если C(8) правее D на четыре единицы, то D(8 − 4) = D(4).'),
q('g3-11','На рисунке расстояние от 0 до 1 равно 2 см. Каково расстояние от 0 до точки K(9)?',['9 см','11 см','18 см','20 см'],2,'','Девять единичных отрезков по 2 см дают 18 см.'),
q('g3-12','Расположи по возрастанию: 65 009, 64 990, 65 090, 64 999.',['64 990, 64 999, 65 009, 65 090','64 999, 64 990, 65 009, 65 090','64 990, 65 009, 64 999, 65 090','65 090, 65 009, 64 999, 64 990'],0,'','64 990 < 64 999 < 65 009 < 65 090.'),
q('g3-13','Какое число удовлетворяет неравенству 304 509 < □ < 304 590?',['304 509','304 590','304 549','304 599'],2,'','304 509 < 304 549 < 304 590; граничные числа не подходят.'),
q('g3-14','Какое из чисел наибольшее?',['505 909','505 990','505 099','505 900'],1,'','505 990 больше остальных: после одинаковых 505 сравниваем последние три цифры.'),
q('g3-15','Какое пятизначное число делится на 4 и 9, но не делится на 10?',['81 216','81 218','81 226','81 220'],0,'','81 216: последние две цифры 16 делятся на 4, сумма цифр 18 делится на 9, последняя цифра не 0.'),
q('g3-16','Какое число делится на 3 и 5, но не делится на 9?',['12 345','12 375','12 445','12 340'],0,'','12 345 оканчивается на 5; сумма цифр 15 делится на 3, но не на 9.'),
q('g3-17','Какая цифра вместо □ сделает число 45□20 делящимся на 4 и на 9?',['1','4','7','9'],2,'','Последние две цифры 20 делятся на 4; сумма цифр 11 + □ делится на 9 только при □ = 7.'),
q('g3-18','Какое число делится одновременно на 2, 3, 4, 5, 9 и 10?',['45 350','45 340','45 360','45 390'],2,'','45 360 оканчивается на 0, последние две цифры 60 делятся на 4, а сумма цифр 18 делится на 9 и на 3.')
];
const storageKey='liga-znaniy-course-v2';const address=()=> 'Егор, ';let data;try{data=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{}if(!data||typeof data!=='object')data={points:0,awarded:{},goals:{},history:[],opened:{},groupBest:0};data.awarded||={};data.goals||={};data.history||=[];data.opened||={};data.points||=0;data.groupBest||=0;data.groupBestV2||=0;data.groupBestV3||=0;
function save(){try{localStorage.setItem(storageKey,JSON.stringify(data))}catch{}updatePoints()}function updatePoints(){document.querySelectorAll('[data-points]').forEach(el=>el.textContent=data.points)}
// Keep points from the earlier prototype visible once, without awarding old questions again.
if(!data.imported){const old=Number(localStorage.getItem('liga-znaniy-points-v1')||0);if(old>0)data.points+=old;data.imported=true;save()}
let mode='topic',topic=0,questions=[],step=0,attempts=[],currentAttempts=[],hintUsed=false,solved=false,run=[];
function syncGlobalStars(){updatePoints()}
function awardGlobalStars(key,amount){
  data.awarded||={};
  const awardKey='global:'+key;
  if(!data.awarded[awardKey]){
    data.awarded[awardKey]=true;
    data.points=(Number(data.points)||0)+(Number(amount)||0);
    save();
  }else{
    updatePoints();
  }
}
function goalFlash(){let el=$('goalEffect');el.classList.remove('hidden');void el.offsetWidth;setTimeout(()=>el.classList.add('hidden'),900)}
const mathCatalog=[{"title":"Натуральные числа и нуль","heading":"Натуральные числа и делимость"},{"title":"Многозначные числа и разряды","heading":""},{"title":"Натуральные числа на числовом луче","heading":""},{"title":"Сравнение натуральных чисел","heading":""},{"title":"Признаки делимости","heading":""},{"title":"Делители и кратные","heading":""},{"title":"Простые и составные числа","heading":""},{"title":"Разложение числа на простые множители с помощью признаков делимости","heading":""},{"title":"Наибольший общий делитель и наименьшее общее кратное","heading":""},{"title":"Текстовые задачи: как выбрать НОД или НОК","heading":""},{"title":"Четыре действия с натуральными числами","heading":"Действия с натуральными числами"},{"title":"Порядок действий и скобки: почему порядок важен","heading":""},{"title":"Деление с остатком","heading":""},{"title":"Степень числа с натуральным показателем","heading":""},{"title":"Переместительный закон сложения и умножения","heading":""},{"title":"Сочетательный закон сложения и умножения","heading":""},{"title":"Распределительный закон","heading":""},{"title":"Вычитание суммы из числа и числа из суммы","heading":""},{"title":"Свойства нуля и единицы. Деление на нуль","heading":""},{"title":"Удобные вычисления с помощью законов и свойств","heading":""},{"title":"Числовые и буквенные выражения","heading":""},{"title":"Уравнение, его корень и проверка решения","heading":"Уравнения"},{"title":"Простые уравнения: неизвестный компонент действия","heading":""},{"title":"Уравнения в несколько действий: от последнего действия к первому","heading":""},{"title":"Уравнения в несколько действий: свойства действий и вынесение x за скобки","heading":""},{"title":"Выбор способа решения. Проверка и поиск ошибок","heading":""},{"title":"От условия задачи к уравнению","heading":"Текстовые задачи с помощью уравнений"},{"title":"Простейшие текстовые задачи с уравнением","heading":""},{"title":"Задачи на сумму и разность двух величин","heading":""},{"title":"Задачи «на несколько» и «в несколько раз»","heading":""},{"title":"Задачи с изменением величин","heading":""},{"title":"Задачи на цену, количество и стоимость","heading":""},{"title":"Задачи с двумя условиями и распределением по группам","heading":""},{"title":"Составные задачи: выбор неизвестного и способа решения","heading":""},{"title":"Скорость, время, расстояние: повторение","heading":"Задачи на движение"},{"title":"Встречное движение и движение в противоположных направлениях","heading":""},{"title":"Движение в одном направлении","heading":""},{"title":"Движение по реке: по течению и против течения","heading":""},{"title":"Составные задачи на движение по реке","heading":""},{"title":"Решение задач на движение с помощью уравнений","heading":""},{"title":"Точка, прямая, луч и отрезок","heading":"Наглядная геометрия"},{"title":"Длина ломаной и периметр многоугольника","heading":""},{"title":"Углы и их измерение","heading":""},{"title":"Многоугольники","heading":""},{"title":"Площадь прямоугольника и задачи на клетчатой бумаге","heading":""},{"title":"Объём прямоугольного параллелепипеда и куба","heading":""},{"title":"Доля и обыкновенная дробь","heading":"Обыкновенные дроби: понятие и сравнение"},{"title":"Дробь на числовом луче","heading":""},{"title":"Правильные, неправильные дроби и смешанные числа","heading":""},{"title":"Дробь как результат деления","heading":""},{"title":"Основное свойство дроби","heading":""},{"title":"Сокращение дробей и общий знаменатель","heading":""},{"title":"Сравнение обыкновенных дробей","heading":""},{"title":"Сложение и вычитание обыкновенных дробей","heading":"Обыкновенные дроби: действия и задачи"},{"title":"Умножение обыкновенных дробей","heading":""},{"title":"Деление обыкновенных дробей","heading":""},{"title":"Уравнения с обыкновенными дробями","heading":""},{"title":"Как выбрать действие в задаче с обыкновенными дробями","heading":""},{"title":"Составные задачи с обыкновенными дробями","heading":""},{"title":"Десятичная запись и связь с обыкновенной дробью","heading":"Десятичные дроби"},{"title":"Сравнение десятичных дробей","heading":""},{"title":"Сложение и вычитание десятичных дробей","heading":""},{"title":"Умножение десятичных дробей","heading":""},{"title":"Деление десятичных дробей","heading":""},{"title":"Округление и проверка результата","heading":""},{"title":"Уравнения с десятичными дробями","heading":""},{"title":"Три записи одной части: обыкновенная дробь, десятичная дробь, процент","heading":"Обыкновенные дроби, десятичные дроби и проценты"},{"title":"Нахождение обыкновенной дроби от числа","heading":""},{"title":"Нахождение десятичной дроби от числа","heading":""},{"title":"Нахождение процентов от числа","heading":""},{"title":"Нахождение числа по его обыкновенной дроби","heading":""},{"title":"Нахождение числа по его десятичной дроби","heading":""},{"title":"Нахождение числа по его процентам","heading":""},{"title":"Какую часть и сколько процентов одно число составляет от другого","heading":""},{"title":"Дробь от дроби и процент от процента","heading":""},{"title":"Взаимно обратные и составные задачи на дроби и проценты","heading":""},{"title":"Единицы измерения и перевод величин","heading":"Величины и представление данных"},{"title":"Чтение и составление таблиц и диаграмм","heading":""}];
const mathTests={"5":"Тест по темам 1–5","10":"Тест по темам 6–10","21":"Тест по темам 11–21","26":"Тест по темам 22–26","34":"Тест по темам 27–34","40":"Тест по темам 35–40","46":"Тест по темам 41–46","53":"Тест по темам 47–53","59":"Тест по темам 54–59","66":"Тест по темам 60–66","70":"Тест по темам 67–70 · находим часть","74":"Тест по темам 71–74 · находим целое","76":"Тест по темам 67–76 · дроби и проценты","78":"Итоговый тест по курсу математики 5 класса"};
const mathLiveLessons={1:0,2:3,3:4,4:1,5:2}; // Keep the original lesson indices for saved progress.
function rayGoalCount(){return Object.values(data.rayFirstGoals||{}).filter(Boolean).length}
function mathTopicGoalCount(i){return Number(data.goals[i]||0)+(i===4?rayGoalCount():0)}
function mathTopicGoalTotal(i){return lessons[i].questions.filter(x=>x.kind==='practice').length+(i===4?4:0)}
function updateRayGoalStatus(){let el=document.getElementById('rayGoalStatus');if(el)el.textContent='⚽ '+rayGoalCount()+' / 4 за упражнения на луче'}
function recordRayFirstGoal(id,correct){data.rayAttempts||={};data.rayFirstGoals||={};if(data.rayAttempts[id])return false;data.rayAttempts[id]=true;if(correct){data.rayFirstGoals[id]=true;goalFlash()}save();renderTopics();updateRayGoalStatus();return correct}
function renderTopics(){
  const list=$('topicList');list.replaceChildren();
  mathCatalog.forEach((entry,index)=>{
    const number=index+1;
    if(entry.heading){const heading=document.createElement('div');heading.className='list-head math-block-heading';heading.textContent=entry.heading;list.append(heading)}
    const liveIndex=mathLiveLessons[number];
    const row=document.createElement(liveIndex===undefined?'div':'button');
    row.className='row '+(liveIndex===undefined?'locked math-locked':'ready');
    if(liveIndex!==undefined)row.type='button';
    const num=document.createElement('span');num.className='num';num.textContent=String(number).padStart(2,'0');
    const title=document.createElement('span');title.className='name';title.textContent=entry.title;
    const status=document.createElement('span');status.className='goals';
    status.textContent=liveIndex===undefined?'🔒':('⚽ '+mathTopicGoalCount(liveIndex)+' / '+mathTopicGoalTotal(liveIndex));
    row.append(num,title,status);
    if(liveIndex!==undefined)row.onclick=()=>openLesson(liveIndex);
    list.append(row);
    if(number===5){
      const current=document.createElement('button');current.type='button';current.className='row test';
      current.innerHTML='<span class="num">📝</span><span class="name">Итоговый тест · темы 1–5</span><span class="goals"></span>';
      current.querySelector('.goals').textContent=(data.groupBestV3||0)+' / '+group.length;
      current.onclick=()=>startQuiz('group');list.append(current);
    }
    if(mathTests[number]&&number!==5){
      const test=document.createElement('div');test.className='row locked math-locked';
      const icon=document.createElement('span');icon.className='num';icon.textContent='📝';
      const name=document.createElement('span');name.className='name';name.textContent=mathTests[number];
      const badge=document.createElement('span');badge.className='goals';badge.textContent='🔒';
      test.append(icon,name,badge);list.append(test);
    }
  });updatePoints();
}
function openLesson(i){topic=i;let l=lessons[i];$('lessonIndex').textContent='Тема '+({0:1,1:4,2:5,3:2,4:3}[i])+' из 78';$('lessonTitle').textContent=l.title;$('videoCoach').textContent=address()+'во время просмотра найди ответы на вопросы выше. Затем нажми «Перейти к вопросам», и мы обсудим их вместе.';$('watchQuestions').innerHTML='';l.questions.slice(0,2).forEach(item=>{let li=document.createElement('li');li.textContent=item.prompt;$('watchQuestions').append(li)});$('mathPlaceValueGraphic').classList.toggle('hidden',i!==3);$('mathDivisibilityGraphic').classList.toggle('hidden',i!==2);$('mathNumberRayGraphic').classList.toggle('hidden',i!==4);$('mathRayInteractive').classList.remove('hidden');$('mathRayPhotoTasks').classList.toggle('hidden',i!==4);if(i===4)updateRayGoalStatus();$('mathTopic1ExtraVideo').classList.toggle('hidden',i!==0);$('mathTopic1ExtraFrame').src=i===0?'https://rutube.ru/play/embed/0b86b7fabd255c384465fbda1b26a879/':'about:blank';$('externalVideo').href=l.video;$('videoBox').innerHTML='';let frame=document.createElement('iframe');frame.src='https://rutube.ru/play/embed/'+l.embed;frame.title='Видеоурок: '+l.title;frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';$('videoBox').append(frame);data.opened[i]=true;save();show('lesson')}
function startQuiz(which){mode=which;questions=which==='group'?group:lessons[topic].questions;step=0;run=[];$('quizBrand').textContent=which==='group'?'Итоговый тест · темы 1–5':lessons[topic].title;$('quizTitle').textContent=which==='group'?'Итоговый матч':lessons[topic].title;renderQuestion();show('quiz')}
function renderQuestion(){let item=questions[step];currentAttempts=[];hintUsed=false;solved=false;const videoCount=questions.filter(x=>x.kind==='video').length,practiceCount=questions.length-videoCount;$('quizStep').textContent=mode==='group'?'Общий тест · '+(step+1)+' / '+questions.length:'Тема '+({0:1,1:4,2:5,3:2,4:3}[topic])+' · '+(item.kind==='video'?'Вопрос по видео · '+(step+1)+' / '+videoCount:'Мини-тест · '+(step-videoCount+1)+' / '+practiceCount);$('question').textContent=item.prompt;$('answers').innerHTML='';item.options.forEach((option,i)=>{let btn=document.createElement('button');btn.className='answer';btn.textContent=option;btn.onclick=()=>pick(i);$('answers').append(btn)});$('feedback').classList.add('hidden');$('next').classList.add('hidden');$('hint').classList.toggle('hidden',mode==='group');$('coachLine').textContent=mode==='group'?address()+'на проверочном матче подсказок нет. Подумай спокойно.':address()+'попробуй сначала сам. Я здесь, если понадобится подсказка.'}
function feedback(text,warn){let el=$('feedback');el.textContent=text;el.className='feedback'+(warn?' warn':'')}
function pick(index){if(solved)return;let item=questions[step];let buttons=[...$('answers').children];currentAttempts.push({answer:item.options[index],correct:index===item.answer});if(index===item.answer){buttons[index].classList.add('correct');complete(true);feedback(address()+'верно! '+item.explain,false);if(item.kind==='practice'&&mode==='topic')goalFlash()}else{buttons[index].classList.add('wrong');buttons[index].disabled=true;let remain=buttons.filter(b=>!b.disabled).length;if(remain===1){complete(false);feedback(address()+'разберём вместе: '+item.explain,true)}else feedback(address()+'пока не совпало. Проверь рассуждение и попробуй ещё.',true)}}
function complete(correct){solved=true;let item=questions[step];let first=correct&&currentAttempts.length===1&&!hintUsed;let earned=0;if(correct&&!data.awarded[item.id]){earned=10+(first?5:0);data.awarded[item.id]=true;data.points+=earned}run.push({id:item.id,topic:mode==='group'?'Общий тест':lessons[topic].title,kind:item.kind,prompt:item.prompt,attempts:[...currentAttempts],correct,firstCorrect:currentAttempts.length===1&&currentAttempts[0].correct,first,hint:hintUsed,expected:item.options[item.answer],earned});[...$('answers').children].forEach(b=>b.disabled=true);$('hint').classList.add('hidden');$('next').classList.remove('hidden');$('next').textContent=step===questions.length-1?'Посмотреть результат →':'Следующий ход →';$('coachLine').textContent=address()+(correct?(earned?'отличный ход! +'+earned+' очков.':'верно! Это задание уже приносило очки.'):'ошибку разобрали. Следующее задание — новый шанс.');save()}
$('stay').onclick=()=>{$('coachLine').textContent=address()+(mode==='group'?'я рядом. Прочитай условие ещё раз и исключи варианты, которые точно не подходят.':'я рядом. Давай сделаем один маленький шаг: выдели главное в условии, а если трудно — попроси подсказку.')};$('hint').onclick=()=>{if(solved||mode==='group')return;hintUsed=true;feedback(questions[step].hint,false);$('coachLine').textContent=address()+'теперь попробуй выбрать ответ.'};$('next').onclick=()=>{step++;if(step<questions.length)renderQuestion();else finishRun()};
function finishRun(){let practice=run.filter(x=>x.kind==='practice');let goals=practice.filter(x=>x.firstCorrect).length;let score=run.filter(x=>x.firstCorrect).length;if(mode==='topic')data.goals[topic]=Math.max(data.goals[topic]||0,goals);else data.groupBestV3=Math.max(data.groupBestV3||0,score);data.history.push({date:new Date().toISOString(),mode,topic:mode==='topic'?lessons[topic].title:'Общий тест',results:run});if(data.history.length>30)data.history=data.history.slice(-30);save();$('reviewTitle').textContent=mode==='group'?'Итоговый тест завершён!':'Тема завершена!';$('reviewStats').textContent=mode==='group'?`Верных ответов: ${score} из ${questions.length}. Лучший результат: ${data.groupBestV3} из ${group.length}.`:`Верных ответов в мини-тесте: ${score} из ${questions.length}. Голов за тему: ${mathTopicGoalCount(topic)} из ${mathTopicGoalTotal(topic)}${topic===4?' (включая упражнения на луче)':''}.`;$('reviewAdvice').textContent=address()+(score===questions.length?'отличный результат! Можешь выбрать следующую тему.':'ошибки и подсказки сохранены в отчёте. Тему можно пройти ещё раз.');renderTopics();show('review')}
function report(){let name='Егор';let lines=['ЛИГА ЗНАНИЙ · МАТЕМАТИКА, 5 КЛАСС','Игрок: '+name,'Дата отчёта: '+new Date().toLocaleDateString('ru-RU'),'Всего очков на этом устройстве: '+data.points,'','ПРОГРЕСС ПО ТЕМАМ'];lessons.forEach((l,i)=>lines.push(({0:1,1:4,2:5,3:2,4:3}[i])+'. '+l.title+' — '+mathTopicGoalCount(i)+' из '+mathTopicGoalTotal(i)+' голов; видео '+(data.opened[i]?'открывали':'не открывали')));lines.push('Итоговый тест по темам 1–5 — лучший результат '+data.groupBestV3+' из '+group.length+'.','Факт просмотра видео до конца не проверяется.','','ПОСЛЕДНИЕ ПРОХОЖДЕНИЯ');if(!data.history.length)lines.push('Прохождений пока нет.');for(const session of data.history.slice(-8)){lines.push('','— '+new Date(session.date).toLocaleString('ru-RU')+' · '+session.topic);session.results.forEach((r,n)=>lines.push(`${n+1}. ${r.prompt}\nОтветы: ${r.attempts.map((a,k)=>`${k+1}) ${a.answer} — ${a.correct?'верно':'неверно'}`).join('; ')}\nВерный ответ: ${r.expected}. Итог для счёта: ${r.firstCorrect?'верно с первого выбора':'не засчитано'}; ${r.correct?'правильный ответ найден':'разобрано после ошибок'}; подсказка: ${r.hint?'да':'нет'}; очки: +${r.earned}.`))}return lines.join('\n')}
function openReport(){$('reportText').textContent=report();show('reportScreen')}

function renderParentProgress(){
  const mathGoals=[0,1,2,3,4].map(i=>mathTopicGoalCount(i));
  const histGoals=[1,2,3].map(i=>Number(historyState['goals'+i]||0));
  const bioGoals=[1,2,3].map(i=>Number(biologyProgress['topic'+i+'Goals']||0));
  const chineseTopic1Goals=Number(chineseProgress.topic1Goals||0);
  const chineseTopic2Goals=Number(chineseProgress.topic2Goals||0);
  const chineseGoals=chineseTopic1Goals+chineseTopic2Goals;
  const russianGoals=Number(russianProgress.topic1Goals||0);
  const mathDone=mathGoals.filter((g,i)=>g>0||data.opened[i]).length;
  const histDone=[1,2,3].filter(i=>!!historyState['completed'+i]).length;
  const blockDone=!!historyState.mini.historyBlockQuizV2;
  const mathGroupDone=Number(data.groupBestV3||0)>0 || (data.history||[]).some(x=>x.mode==='group'&&x.results?.some(r=>String(r.id).startsWith('g3-')));
  const bioDone=[1,2,3].filter(i=>!!biologyProgress['topic'+i+'Completed']).length;
  const chineseDone=(chineseProgress.topic1Completed?1:0)+(chineseProgress.topic2Completed?1:0);
  const russianDone=russianProgress.topic1Completed?1:0;
  const completedTests=mathGoals.filter(g=>g>0).length+(mathGroupDone?1:0)+histDone+(blockDone?1:0)+bioDone+chineseDone;
  const goals=mathGoals.reduce((a,b)=>a+b,0)+histGoals.reduce((a,b)=>a+b,0)+Number(data.groupBestV3||0)+Number(historyState.block1GoalsV2||0)+bioGoals.reduce((a,b)=>a+b,0)+chineseGoals+russianGoals;
  const completedLessons=mathDone+histDone+bioDone+chineseDone+russianDone;
  // Progress: 5 Math topics + final test + 3 History topics + History test + 3 Biology topics + 2 Chinese topics + 1 Russian topic.
  const unitsDone=mathDone+histDone+bioDone+chineseDone+russianDone+(mathGroupDone?1:0)+(blockDone?1:0), unitsTotal=16;
  const pct=Math.round(unitsDone/unitsTotal*100);
  $('parentProgressPercent').textContent=pct+'%';$('parentProgressBar').style.width=pct+'%';
  $('parentStars').textContent=Number(data.points||0);$('parentGoals').textContent=goals;
  $('parentLessons').textContent=completedLessons;$('parentTests').textContent=completedTests;
  $('parentMathSummary').textContent=mathDone+' тем · ⚽ '+mathGoals.reduce((a,b)=>a+b,0)+' / '+lessons.reduce((sum,l,i)=>sum+mathTopicGoalTotal(i),0);
  $('parentHistorySummary').textContent=histDone+' тем · ⚽ '+histGoals.reduce((a,b)=>a+b,0)+' / 21';
  $('parentRussianSummary').textContent=russianDone+' тем · ⚽ '+russianGoals+' / 8 · маршрут 157';
  $('parentBiologySummary').textContent=bioDone+' тем · ⚽ '+bioGoals.reduce((a,b)=>a+b,0)+' / 15';
  $('parentChineseSummary').textContent=chineseDone+' тем · ⚽ '+chineseGoals+' / 16';

  $('parentMathDetail').innerHTML=lessons.map((l,i)=>{
    const opened=!!data.opened[i], g=mathGoals[i];
    return '<div class="progress-detail-line"><strong>Тема '+({0:1,1:4,2:5,3:2,4:3}[i])+' — '+l.title+'</strong>'+
      (opened?'✅ урок открывался':'▫️ урок ещё не открывался')+'<br>⚽ результат заданий: '+g+' / '+mathTopicGoalTotal(i)+'</div>';
  }).join('')+'<div class="progress-detail-line"><strong>Итоговый тест · темы 1–5</strong>⚽ лучший результат: '+Number(data.groupBestV3||0)+' / '+group.length+'</div>';

  const hTitles=['Что изучает история?','Исторические источники','Древнейшие люди'];
  const controlKeys=[['definition','sources','archaeology'],['source-definition','source-types','archaeology-value'],['origin','tools','fire']];
  $('parentHistoryDetail').innerHTML=hTitles.map((t,idx)=>{
    const n=idx+1, controls=controlKeys[idx].filter(k=>historyState.mini[k]).length, done=!!historyState['completed'+n];
    return '<div class="progress-detail-line"><strong>Тема '+n+' — '+t+'</strong>'+
      (controls===3?'✅ контрольные вопросы выполнены':'▫️ контрольные вопросы: '+controls+' / 3')+
      '<br>'+(done?'✅ мини-тест завершён':'▫️ мини-тест ещё не завершён')+
      '<br>⚽ мини-тест: '+histGoals[idx]+' / 7</div>';
  }).join('')+'<div class="progress-detail-line"><strong>Тест по темам 1–3</strong>'+
    (blockDone?'✅ завершён':'▫️ ещё не завершён')+'<br>⚽ лучший результат: '+Number(historyState.block1GoalsV2||0)+' / '+historyBlockQuizQuestions.length+'</div>';

  $('parentRussianDetail').innerHTML='<div class="progress-detail-line"><strong>Маршрут русского языка</strong>157 тем в 12 смысловых блоках. Уроки и результаты появятся после открытия первой темы.</div>';
  $('parentChineseDetail').innerHTML='<div class="progress-detail-line"><strong>Тема 1 — Первое приветствие: 你好 nǐ hǎo</strong>'+(chineseProgress.topic1Completed?'✅ урок завершён':'▫️ урок доступен')+'<br>⚽ голы за верные ответы: '+chineseTopic1Goals+' / 8</div><div class="progress-detail-line"><strong>Тема 2 — Китайский язык: четыре ключа</strong>'+(chineseProgress.topic2Completed?'✅ урок завершён':(chineseProgress.topic1Completed?'▫️ урок доступен':'🔒 откроется после урока №1'))+'<br>⚽ голы за верные ответы: '+chineseTopic2Goals+' / 8</div><div class="progress-detail-line"><strong>Маршрут курса</strong>56 тем в 8 смысловых блоках. Остальные уроки будут открываться постепенно.</div>';
  $('parentBiologyDetail').innerHTML=[1,2].map(i=>{
    const titles=['Что изучает биология? Живая и неживая природа','Признаки живых организмов'];
    const done=!!biologyProgress['topic'+i+'Completed'];
    const goals=Number(biologyProgress['topic'+i+'Goals']||0);
    return '<div class="progress-detail-line"><strong>Тема '+i+' — '+titles[i-1]+'</strong>'+
      (done?'✅ тема завершена':'▫️ тема ещё не завершена')+'<br>⚽ результат: '+goals+' / '+(i===2?8:7)+'</div>';
  }).join('');

  let last=null;
  if((data.history||[]).length){
    const x=data.history[data.history.length-1];
    last={date:new Date(x.date),text:'Математика → '+x.topic};
    const sc=(x.results||[]).filter(r=>r.firstCorrect).length;
    last.text+=' → '+sc+'/'+(x.results||[]).length;
  }
  if(historyState.lastActivity&&(!last||new Date(historyState.lastActivity.date)>last.date)){
    last={date:new Date(historyState.lastActivity.date),text:historyState.lastActivity.text};
  }
  if(biologyProgress.lastActivity&&(!last||new Date(biologyProgress.lastActivity.date)>last.date)){
    last={date:new Date(biologyProgress.lastActivity.date),text:biologyProgress.lastActivity.text};
  }
  if(chineseProgress.lastActivity&&(!last||new Date(chineseProgress.lastActivity.date)>last.date)){
    last={date:new Date(chineseProgress.lastActivity.date),text:chineseProgress.lastActivity.text};
  }
  $('parentLastActivity').innerHTML=last?'<strong>'+last.date.toLocaleString('ru-RU')+'</strong><br>'+last.text:'Пока нет сохранённых прохождений.';

  const weak=[];
  mathGoals.forEach((g,i)=>{if((data.opened[i]||g>0)&&g<Math.ceil(mathTopicGoalTotal(i)*.75))weak.push('Математика · '+lessons[i].title+' — ⚽ '+g+' / '+mathTopicGoalTotal(i))});
  histGoals.forEach((g,i)=>{if(historyState['completed'+(i+1)]&&g<6)weak.push('История · '+hTitles[i]+' — ⚽ '+g+' / 7')});
  if(mathGroupDone&&Number(data.groupBestV3||0)<Math.ceil(group.length*.75))weak.push('Математика · итоговый тест по темам 1–5 — '+Number(data.groupBestV3||0)+' / '+group.length);
  if(blockDone&&Number(historyState.block1GoalsV2||0)<Math.ceil(historyBlockQuizQuestions.length*.75))weak.push('История · тест по темам 1–3 — ⚽ '+Number(historyState.block1GoalsV2||0)+' / '+historyBlockQuizQuestions.length);
  ['Что изучает биология? Живая и неживая природа','Признаки живых организмов','Как биологи изучают природу'].forEach((t,i)=>{
    const n=i+1,g=bioGoals[i],max=n===3?26:(n===2?8:7);if(biologyProgress['topic'+n+'Completed']&&g<6)weak.push('Биология · '+t+' — ⚽ '+g+' / '+max);
  });
  if(chineseTopic1Goals>0&&!chineseProgress.topic1Completed)weak.push('Китайский язык · Первое приветствие: 你好 nǐ hǎo — ⚽ '+chineseTopic1Goals+' / 8');
  if(chineseTopic2Goals>0&&!chineseProgress.topic2Completed)weak.push('Китайский язык · Четыре ключа — ⚽ '+chineseTopic2Goals+' / 8');
  $('parentAttention').innerHTML=weak.length?weak.map(x=>'<div class="attention-item">'+x+'</div>').join(''):'Нет завершённых результатов ниже выбранного порога повторения.';
}
function recordHistoryActivity(text){
  historyState.lastActivity={date:new Date().toISOString(),text:text};
  saveHistory();
}


window.addEventListener('message',e=>{const d=e.data;if(!d)return;if(d.type==='liga-znaniy:return-to-russian'){renderRussian();show('russian');syncGlobalStars();return}if(d.type!=='russian-lesson-progress')return;const newGoals=Math.max(0,Math.min(8,Number(d.goals||0)));const oldGoals=Number(russianProgress.topic1Goals||0);if(newGoals>oldGoals){data.points=(Number(data.points)||0)+(newGoals-oldGoals)*10;russianProgress.topic1Goals=newGoals;save();}if(d.completed)russianProgress.topic1Completed=true;if(newGoals>0||d.completed){russianProgress.lastActivity={date:new Date().toISOString(),text:'Русский язык → Урок 1 → ⚽ '+newGoals+'/8'};saveRussianProgress()}syncGlobalStars()});

const biologyProgressKey='liga-znaniy-biology-progress-v1';
let biologyProgress={topic1Completed:false,topic1Goals:0,topic1Stars:0,topic2Completed:false,topic2Goals:0,topic2Stars:0,topic3Completed:false,topic3Goals:0,topic3Stars:0,topic11Completed:false,topic11Goals:0,topic11Stars:0,lastActivity:null};
try{biologyProgress=Object.assign(biologyProgress,JSON.parse(localStorage.getItem(biologyProgressKey)||'{}'))}catch{}
function saveBiologyProgress(){try{localStorage.setItem(biologyProgressKey,JSON.stringify(biologyProgress))}catch{}}
function renderBiologyProgress(){
 [1,2,3,11].forEach(n=>{
   const row=$('biologyTopic'+n); if(!row)return;
   const g=row.querySelector('.goals');
   const max=n===11?14:(n===3?26:(n===2?8:7));
   const goals=Number(biologyProgress['topic'+n+'Goals']||0);
   if(goals>0 || biologyProgress['topic'+n+'Completed']){
     row.classList.toggle('completed',!!biologyProgress['topic'+n+'Completed']);
     g.textContent='⚽ '+goals+' / '+max;
   }else{
     row.classList.remove('completed');
     g.textContent='Открыть →';
   }
 });
}
window.addEventListener('message',e=>{
 const d=e.data;
 const topic=Number(d&&d.topic);
 if(!d||d.type!=='biology-topic-complete'||![1,2].includes(topic))return;
 const c='topic'+topic+'Completed', gk='topic'+topic+'Goals', sk='topic'+topic+'Stars';
 biologyProgress[c]=true;
 const topicMax=topic===2?8:7;const newGoals=Math.max(0,Math.min(topicMax,Number(d.goals||0)));
 const oldBest=Number(biologyProgress[gk]||0);
 biologyProgress[gk]=Math.max(oldBest,newGoals);
 const targetBioStars=biologyProgress[gk]*10;
 const oldBioStars=Number(biologyProgress[sk]||0);
 if(targetBioStars>oldBioStars){
   data.points=(Number(data.points)||0)+(targetBioStars-oldBioStars);
   biologyProgress[sk]=targetBioStars;
   save();
 }
 biologyProgress.lastActivity={date:new Date().toISOString(),text:'Биология → Тема '+topic+' → ⚽ '+biologyProgress[gk]+'/'+topicMax};
 saveBiologyProgress();
 renderBiologyProgress();
 show('biology');
 syncGlobalStars();
});

window.addEventListener('message',e=>{
 const d=e.data;if(!d)return;
 if(d.type==='liga-znaniy:return-to-biology'){renderBiologyProgress();show('biology');syncGlobalStars();return;}
 if(d.type!=='biology-topic-progress'||![3,11].includes(Number(d.topic)))return;
 const topic=Number(d.topic), topicMax=topic===3?26:14;
 const gk='topic'+topic+'Goals', ck='topic'+topic+'Completed', sk='topic'+topic+'Stars';
 const newGoals=Math.max(0,Math.min(topicMax,Number(d.goals||0)));
 const oldBest=Number(biologyProgress[gk]||0);
 biologyProgress[gk]=Math.max(oldBest,newGoals);
 biologyProgress[ck]=!!biologyProgress[ck]||!!d.completed||biologyProgress[gk]===topicMax;
 const targetStars=biologyProgress[gk]*10;
 const oldStars=Number(biologyProgress[sk]||0);
 if(targetStars>oldStars){data.points=(Number(data.points)||0)+(targetStars-oldStars);biologyProgress[sk]=targetStars;save();}
 if(newGoals>0||d.completed)biologyProgress.lastActivity={date:new Date().toISOString(),text:'Биология → Тема '+topic+' → ⚽ '+biologyProgress[gk]+'/'+topicMax};
 saveBiologyProgress();renderBiologyProgress();syncGlobalStars();
});

const landingSubjects={
 math:{name:'Математика · 78 тем',text:'78 тем в маршруте. Темы 1–5 и итоговый тест первого блока уже доступны',ready:true,button:'Открыть блок →'},
 history:{name:'История · путешествие по Древнему миру',text:'Темы №1 и №2 уже готовы: видео, опорные вопросы и мини-тесты. Всего в маршруте 34 темы.',ready:true,button:'Открыть историю →'},
 russian:{name:'Русский язык · 5 класс',text:'План курса: 157 тем в 12 смысловых блоках. Будем учиться грамотно писать, понимать правила и уверенно выражать свои мысли.',ready:true,button:'Открыть русский язык →'},
 literature:{name:'Литература',text:'Егор, этот учебный матч пока готовится. Скоро здесь появятся первые темы.',ready:false},
 biology:{name:'Биология · 5 класс',text:'95 тем в 14 смысловых блоках — полный маршрут курса уже добавлен.',ready:true,button:'Открыть биологию →'},
 geography:{name:'География',text:'Егор, этот учебный матч пока готовится. Скоро здесь появятся первые темы.',ready:false},
 english:{name:'Английский язык',text:'Егор, этот учебный матч пока готовится. Скоро здесь появятся первые темы.',ready:false},
 chinese:{name:'Китайский язык · 56 тем',text:'Подготовлены два первых урока. Урок №2 с видео, играми и восемью голами откроется после полного прохождения урока №1.',ready:true,button:'Открыть китайский →'}
};
let selectedLandingSubject='math';
function selectLandingSubject(key,btn){
 selectedLandingSubject=key;let info=landingSubjects[key];
 document.querySelectorAll('#landing .subject').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');
 $('subjectCommentTitle').textContent='Егор, ты выбрал предмет!';
 $('subjectCommentLead').textContent=info.ready?'Посмотри, что тебя ждёт, и только потом открывай блок.':'Тренер уже записал твой выбор.';
 $('subjectCommentName').textContent=info.name;$('subjectCommentText').textContent=info.text;
 $('openSubject').textContent=info.ready?info.button:'Пока готовится';
 $('openSubject').disabled=!info.ready;
}
// v8.3: module-safe bootstrap. This shared engine is loaded only by math/history modules.
(function(){
  const has=id=>!!document.getElementById(id);
  const bind=(id,fn)=>{const el=document.getElementById(id); if(el) el.onclick=fn;};
  if(has('topics')){
    try{ renderTopics(); show('topics'); }catch(e){ console.error('math bootstrap',e); document.getElementById('topics')?.classList.remove('hidden'); }
    bind('backSubjects',()=>location.href='../index.html');
    bind('openMathControlWorks',()=>show('mathControlWorks'));
    bind('mathControlWorksBack',()=>{renderTopics();show('topics')});
    bind('backTopics',()=>{const v=$('videoBox');if(v)v.innerHTML='';renderTopics();show('topics')});
    bind('startLesson',()=>{const v=$('videoBox');if(v)v.innerHTML='';startQuiz('topic')});
    bind('quitQuiz',()=>{renderTopics();show('topics')});
    bind('reviewTopics',()=>{renderTopics();show('topics')});
    bind('reviewReturn',()=>{renderTopics();show('topics')});
    bind('reviewReport',openReport); bind('topicsReport',openReport);
    bind('reportBack',()=>{renderTopics();show('topics')});
    bind('savePdf',()=>window.print());
    try{updatePoints()}catch(e){}
    return;
  }
  if(has('history')){
    try{ renderHistory(); show('history'); }catch(e){ console.error('history bootstrap',e); document.getElementById('history')?.classList.remove('hidden'); }
    bind('historyBack',()=>location.href='../index.html');
    bind('openHistoryControlWorks',()=>show('historyControlWorks'));
    bind('historyControlWorksBack',()=>{renderHistory();show('history')});
    bind('historyLessonBack',()=>{renderHistory();show('history')});
    try{setupHistoryLesson();setupHistoryLesson2();setupHistoryLesson3();updatePoints()}catch(e){console.error('history setup',e)}
  }
})();
