(function () {
  'use strict';
  const data = window.WorkshopData, core = window.WorkshopCore;
  if (!data || !core) {
    if (window.LigaWorkshopBoot) window.LigaWorkshopBoot.fail();
    return;
  }
  const view = document.getElementById('workshopView');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const $ = id => document.getElementById(id);
  const on = (id, event, handler) => { const el = $(id); if (el) el.addEventListener(event,handler); };
  const topicName = id => data.topics.find(t => t.id === id)?.title || 'Все темы';
  const categoryName = id => data.categories.find(c => c.id === id)?.title || 'Тренировка';
  let storage;
  try { storage = window.localStorage; } catch (_) { storage = { getItem() { throw new Error('Unavailable'); } }; }
  const store = core.createStore(storage, () => { $('storageNotice').hidden = false; });
  let selectedTopic = '', active = null, adapter = null, submissions = new Set(), toastTimer;
  let currentRoute = 'home', lastAction = Date.now(), lastTick = Date.now(), wasVisible = !document.hidden;

  function header() {
    $('workshopGoals').textContent = store.read().earned.length;
    if (window.LigaGlobalStars) window.LigaGlobalStars.sync();
  }
  function coach(message, image = 'thinking') {
    $('coachMessage').textContent = message;
    $('coachImage').src = '../lessons/06/images/hero-' + image + '.webp';
  }
  function toast() {
    const el = $('goalToast'); el.textContent = 'ГОЛ! +1 ⚽'; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'),1800);
  }
  function route(name) {
    if (location.hash === '#' + name) renderRoute(); else location.hash = name;
  }
  function crumb(label) { return '<nav class="breadcrumb"><a href="#home">← Мастерская</a><span class="badge">' + escape(label) + '</span></nav>'; }
  function progress(n,max) { return '<div class="progress-track"><span style="width:' + Math.round(n/max*100) + '%"></span></div>'; }
  function stats(state) {
    const s = core.summary(state);
    return '<div class="stats"><div class="stat"><strong>' + s.solved + ' / 48</strong><small>заданий решено</small></div><div class="stat"><strong>' + state.earned.length + ' / ' + data.maxGoals + '</strong><small>голов мастерской</small></div><div class="stat"><strong>' + s.independent + '</strong><small>решено без помощи</small></div><div class="stat"><strong>' + core.weakTasks(state).length + '</strong><small>заданий для повторения</small></div></div>';
  }
  function topicSelector() {
    return '<label>Тема<select id="topicSelect"><option value="">Все темы</option>' + data.topics.map(t => '<option value="' + t.id + '"' + (selectedTopic === t.id ? ' selected' : '') + '>' + escape(t.title) + '</option>').join('') + '</select></label>';
  }
  function listenTopic(callback) { on('topicSelect','change',e => { selectedTopic = e.target.value; callback(); }); }
  function begin(category, topic = selectedTopic, ids, review = false) {
    const queue = ids || core.queue(store.read(),topic,category);
    if (!queue.length) return;
    active = { id: queue[0], queue, index: 0, category, review, hints: 0, tries: 0, done: false, value: '' };
    submissions = new Set(); store.resume(active); route('practice');
  }
  function renderHome() {
    const state = store.read(), summary = core.summary(state), resume = state.resume;
    coach('Егор, выбери тему. Если будет трудно, вместе найдём первый шаг.','welcome');
    view.innerHTML = '<section class="panel welcome"><span class="eyebrow">ИССЛЕДУЕМ · РАССУЖДАЕМ · ПРОВЕРЯЕМ</span><h1>Математическая мастерская<br>5 класс</h1><p class="intro">Егор, здесь можно потренироваться, решить необычную задачу и проверить свою идею в лаборатории. За каждое впервые решённое задание — один гол.</p><div class="toolbar"><button class="btn primary" id="quickStart">⚽ Начать тренировку</button>' + (resume ? '<button class="btn" id="resumeTask">Продолжить задание →</button>' : '') + '<a class="btn ghost" href="#review">🎯 Повторить ошибки' + (summary.weak ? ' · ' + summary.weak : '') + '</a></div>' + stats(state) + '</section>' +
      '<div class="section-header"><h2>Выбери формат</h2><a href="#report">Отчёт для родителя ↗</a></div><div class="categories">' + data.categories.map(c => '<button class="category" data-category="' + c.id + '"><span aria-hidden="true">' + c.icon + '</span><b>' + escape(c.title) + '</b><small>' + escape(c.text) + '</small></button>').join('') + '</div>' +
      '<div class="section-header"><h2>Твоя тема сегодня</h2><small>8 разделов · 48 заданий</small></div><div class="topic-grid">' + data.topics.map(t => {
        const s = core.summary(state,t.id), level = core.level(state,t.id);
        return '<article class="topic-card"><span class="icon" aria-hidden="true">' + t.icon + '</span><h3>' + escape(t.title) + '</h3><p>' + escape(t.blurb) + '</p>' + progress(s.solved,s.total) + '<div class="topic-footer"><span>' + s.solved + ' / ' + s.total + ' решено</span><span>Тренировка: уровень ' + level + '</span></div><div class="topic-links"><button class="btn small" data-topic="' + t.id + '">Тренироваться →</button><button class="btn ghost small" data-lab-topic="' + t.id + '">🧪 Лаборатория</button></div></article>';
      }).join('') + '</div><section class="panel" style="margin-top:22px"><span class="eyebrow">ПРОВЕРКА ПОНИМАНИЯ</span><h2>Матч мастерской — 16 вопросов</h2><p class="muted">По два вопроса на раздел. Подсказки будут после теста, а засчитывается первый ответ на каждый вопрос.</p><div class="toolbar"><button class="btn primary" id="startTest">' + (state.test && !state.test.completed ? 'Продолжить тест →' : 'Пройти тест →') + '</button>' + (state.test?.completed ? '<a class="btn" href="#test-result">Последний результат</a>' : '') + '</div><p class="scope-note">Темы мастерской открыты для исследования. Если тему ещё не изучали, начни с её объяснения в основном курсе. Задания авторские; материалы сборников сюда пока не переносились. Прогресс хранится в этом браузере.</p></section>';
    on('quickStart','click',() => { selectedTopic = ''; begin('training'); });
    on('resumeTask','click',() => { active = store.read().resume; submissions = new Set(); route('practice'); });
    view.querySelectorAll('[data-category]').forEach(el => el.onclick = () => { selectedTopic = ''; if (el.dataset.category === 'lab') route('labs'); else route('pick-' + el.dataset.category); });
    view.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => { selectedTopic = el.dataset.topic; begin('training'); });
    view.querySelectorAll('[data-lab-topic]').forEach(el => el.onclick = () => { selectedTopic = el.dataset.labTopic; begin('lab'); });
    on('startTest','click',() => { store.startTest(); route('test'); });
  }
  function renderPicker(category) {
    currentRoute = 'pick-' + category;
    const state = store.read(), list = core.queue(state,selectedTopic,category);
    coach('Выбери раздел и двигайся своим темпом. Сначала идея, потом вычисления.');
    view.innerHTML = crumb(categoryName(category)) + '<section class="panel"><span class="eyebrow">СОБИРАЕМ МАРШРУТ</span><h1>' + escape(categoryName(category)) + '</h1><p class="muted">' + (category === 'training' ? 'Порядок заданий зависит от последних ответов: после самостоятельных решений сложность растёт, после ошибок сначала предлагается первый уровень.' : 'Здесь потребуется несколько шагов или нестандартная идея. Подсказки можно открывать постепенно.') + '</p><div class="selection-bar">' + topicSelector() + '<span class="badge">' + list.length + ' заданий</span></div><button class="btn primary" id="beginPicked">Начать →</button><p class="scope-note">Все задания останутся доступны. Повторное решение помогает закрепить тему, гол за него второй раз не начисляется.</p></section>';
    listenTopic(() => renderPicker(category)); on('beginPicked','click',() => begin(category));
  }
  function renderLabs() {
    coach('Меняй модель и наблюдай результат. А потом объясни, почему это работает.');
    view.innerHTML = crumb('Лаборатории') + '<section class="panel"><span class="eyebrow">МАТЕМАТИКА В ДЕЙСТВИИ</span><h1>Интерактивные лаборатории</h1><p class="muted">Работают с мышью, касаниями и клавиатурой. Для зачёта выполни условие и нажми «Проверить».</p><div class="selection-bar">' + topicSelector() + '</div><div class="topic-grid">' + data.tasks.filter(t => t.category === 'lab' && (!selectedTopic || t.topic === selectedTopic)).map(t => '<article class="topic-card"><span class="icon">' + data.topics.find(x => x.id === t.topic).icon + '</span><h3>' + escape(topicName(t.topic)) + '</h3><p>' + escape(t.prompt) + '</p><button class="btn" data-open-lab="' + t.id + '">Открыть лабораторию →</button></article>').join('') + '</div></section>';
    listenTopic(renderLabs); view.querySelectorAll('[data-open-lab]').forEach(el => el.onclick = () => begin('lab','',[el.dataset.openLab]));
  }
  function renderReview() {
    const state = store.read(), tasks = core.weakTasks(state).filter(t => !selectedTopic || t.topic === selectedTopic);
    coach('Ошибки показывают, какой шаг стоит потренировать. Попробуй снова — сначала самостоятельно.');
    view.innerHTML = crumb('Повторение') + '<section class="panel"><span class="eyebrow">ПОВТОРЯЕМ С ПОЛЬЗОЙ</span><h1>Разберём трудные места</h1><p class="muted">Здесь задания с ошибками и решениями после подсказок. Самостоятельный верный ответ убирает задание из этого списка.</p><div class="selection-bar">' + topicSelector() + '</div>' + (tasks.length ? '<p>В маршруте: <b>' + tasks.length + '</b> заданий.</p><button class="btn primary" id="beginReview">Повторить →</button><div class="topic-grid" style="margin-top:20px">' + tasks.map(t => '<article class="topic-card"><h3>' + escape(topicName(t.topic)) + '</h3><p>' + escape(t.prompt) + '</p><button class="btn small" data-review-id="' + t.id + '">Разобрать это задание</button></article>').join('') + '</div>' : '<div class="empty-state"><span class="icon">🌟</span><h2>Сейчас нет заданий для повторения</h2><p class="muted">После практики здесь появятся задания, в которых нужна помощь.</p><a class="btn primary" href="#home">К мастерской →</a></div>') + '</section>';
    listenTopic(renderReview); on('beginReview','click',() => begin('training','',tasks.map(t => t.id),true));
    view.querySelectorAll('[data-review-id]').forEach(el => el.onclick = () => begin('training','',[el.dataset.reviewId],true));
  }
  function renderPractice() {
    if (!active) active = store.read().resume;
    if (!active || !core.byId.has(active.id)) { route('home'); return; }
    const task = core.byId.get(active.id), done = active.done, rec = store.read().records[task.id];
    const previouslyEarned = store.read().earned.includes(task.id);
    coach(done ? 'Расскажи своими словами, какой шаг был главным. Это поможет решить похожую задачу.' : 'Прочитай условие и реши, что надо найти. Подсказку откроем, когда понадобится.',done ? 'win' : 'thinking');
    view.innerHTML = crumb(active.review ? 'Повторение ошибок' : categoryName(task.category)) + '<section class="panel"><span class="eyebrow">' + escape(topicName(task.topic)) + '</span><div class="section-header" style="margin-top:0"><h1 style="font-size:1.7rem;margin:0">Задание ' + (active.index + 1) + ' из ' + active.queue.length + '</h1><span class="badge gold">Уровень ' + task.level + '</span></div>' + progress(active.index + (done ? 1 : 0),active.queue.length) + '<p class="task-question" id="taskPrompt">' + escape(task.prompt) + '</p>' + (task.lab ? '<div class="lab-stage" id="labStage" aria-label="Интерактивная модель"></div>' : '') +
      '<form class="answer-form" id="answerForm">' + (!task.lab || ['order','area','fraction'].includes(task.lab) ? '<label class="answer-label">Твой ответ<input id="taskAnswer" class="answer-input" type="text" inputmode="text" maxlength="80" autocomplete="off" aria-describedby="answerHelp"' + (done ? ' disabled' : '') + ' value="' + escape(active.value || '') + '"></label>' : '') + '<button class="btn primary" id="checkTask" type="submit"' + (done ? ' disabled' : '') + '>⚽ Проверить</button></form><p id="answerHelp" class="help-text">' + (previouslyEarned ? 'Гол за это задание уже получен. Можно потренироваться ещё.' : task.category === 'lab' ? 'Проверь свою модель. Гол начисляется один раз за всю лабораторию.' : 'Введи число. Допускаются дробь 11/12, десятичная запятая и пробелы в больших числах.') + '</p><div id="taskFeedback" class="feedback" role="status" aria-live="polite" hidden></div><div id="hints">' + task.hints.slice(0,active.hints).map((hint,i) => '<div class="hint-box"><b>Подсказка ' + (i + 1) + '.</b> ' + escape(hint) + '</div>').join('') + '</div><div class="toolbar"><button class="btn ghost" id="hintTask"' + (done || active.hints >= task.hints.length ? ' disabled' : '') + '>💡 ' + (active.hints ? 'Следующая подсказка' : 'Дай подсказку') + '</button><button class="btn ghost" id="skipTask">' + (done ? 'Следующее задание →' : 'Пропустить →') + '</button><a class="btn ghost" href="#home">В мастерскую</a></div>' + (active.tries >= 2 && active.hints >= 2 && !done ? '<button class="btn small" id="showSolution" style="margin-top:14px">Показать разбор и вернуться к нему позже</button>' : '') + '<div id="solutionMount"></div></section>';
    if (task.lab) adapter = makeLab(task,done); else adapter = null;
    on('answerForm','submit',e => { e.preventDefault(); checkTask(); });
    on('taskAnswer','input',e => { active.value = e.target.value; store.resume(active); });
    on('hintTask','click',() => {
      if (active.done || active.hints >= task.hints.length) return;
      store.hint(task.id); active.hints++; store.resume(active);
      const hint = document.createElement('div'); hint.className = 'hint-box';
      hint.textContent = 'Подсказка ' + active.hints + '. ' + task.hints[active.hints-1]; $('hints').append(hint);
      $('hintTask').textContent = 'Следующая подсказка'; $('hintTask').disabled = active.hints >= task.hints.length;
      if (active.hints >= 2 && active.tries >= 2) renderPractice();
    });
    on('skipTask','click',nextTask);
    on('showSolution','click',() => { active.done = true; store.resume(active); renderPractice(); feedback('Посмотри разбор. Это задание останется в повторении; гол за просмотр не начисляется.','error'); });
    if (done) showSolution(task,rec?.solved === true);
  }
  function feedback(message, kind) {
    const el = $('taskFeedback'); el.hidden = false; el.className = 'feedback ' + kind; el.textContent = message;
  }
  function checkTask() {
    if (!active || active.done) return;
    const task = core.byId.get(active.id), raw = $('taskAnswer')?.value;
    const value = adapter ? adapter.value(raw) : raw;
    if (value === null || (!adapter && core.number(raw) === null)) { feedback('Сначала заполни ответ или выбери значения модели. Можно записать число или обычную дробь.','error'); $('taskAnswer')?.focus(); return; }
    const signature = JSON.stringify(value);
    if (submissions.has(signature)) { feedback('Этот ответ уже проверен. Измени его или открой подсказку.','error'); return; }
    submissions.add(signature);
    const result = store.submit(task.id,value,active.hints > 0 || active.tries > 0);
    active.tries++; active.value = raw || ''; active.done = result.correct; store.resume(active);
    if (result.correct) {
      renderPractice(); feedback(result.awarded ? 'Верно! +1 гол. Теперь объясни ход решения своими словами.' : 'Верно! Гол за это задание уже получен, а новый ответ записан в прогресс.','success');
      if (result.awarded) toast(); header();
    } else {
      if (active.tries >= 2 && active.hints >= 2) renderPractice();
      feedback('Ответ пока не подходит. Проверь условие и первый шаг. Можно открыть подсказку и попробовать ещё.','error');
      coach('Давай разберём один шаг. Что известно, что нужно найти и какое действие их связывает?');
    }
  }
  function showSolution(task, solved) {
    $('solutionMount').innerHTML = '<section class="solution"><h3>' + (solved ? 'Проверяем рассуждение' : 'Разбор задания') + '</h3><ol>' + task.solution.map(step => '<li>' + escape(step) + '</li>').join('') + '</ol><label class="reasoning">Объясни, почему выбранный способ работает<textarea id="reasoning" placeholder="Можно объяснить устно тренеру или записать здесь…"></textarea></label><p style="font-size:.83rem;margin:10px 0 0">Это заметка для размышления, она автоматически не оценивается и не сохраняется.</p></section>';
  }
  function nextTask() {
    if (!active) return;
    active.index++;
    if (active.index >= active.queue.length) {
      const wasReview = active.review; active = null; store.resume(null);
      route(wasReview ? 'review' : 'home'); return;
    }
    if (!active.review) {
      const used = new Set(active.queue.slice(0,active.index)), state = store.read();
      const ranked = core.queue(state,'',active.category).filter(id => active.queue.includes(id) && !used.has(id));
      active.queue = [...active.queue.slice(0,active.index),...ranked];
    }
    active.id = active.queue[active.index]; active.hints = 0; active.tries = 0; active.done = false; active.value = '';
    submissions = new Set(); store.resume(active); renderPractice(); view.focus(); window.scrollTo(0,0);
  }

  function makeLab(task,disabled) {
    const stage = $('labStage');
    let selected = new Set(), position = disabled && task.lab === 'ray' ? task.answer/task.step : null, first = disabled && task.lab === 'order' ? task.correctFirst : null;
    const disableButtons = () => stage.querySelectorAll('button,input').forEach(el => { el.disabled = disabled; });
    const svg = content => '<svg viewBox="0 0 620 155" role="img" aria-label="' + escape(task.prompt) + '">' + content + '</svg>';
    const text = (x,y,label,color='#193f68') => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + color + '">' + escape(label) + '</text>';
    if (task.lab === 'ray') {
      stage.innerHTML = '<div id="rayDrawing"></div><p class="help-text" style="color:#244d74">Выбери отметку для точки K. Шаг между соседними отметками — 4.</p><div class="ray-options">' + Array.from({length:task.ticks+1},(_,i) => '<button type="button" class="lab-button" data-ray="' + i + '" aria-pressed="false" aria-label="Отметить K на делении ' + i + '">' + i + '</button>').join('') + '</div>';
      function draw() {
        const unit = 540/task.ticks;
        $('rayDrawing').innerHTML = svg('<path d="M35 82H587m-13-7 13 7-13 7" fill="none" stroke="#214f7b" stroke-width="3"/>' + Array.from({length:task.ticks+1},(_,i) => '<path d="M'+(40+i*unit)+' 71v22" stroke="#214f7b" stroke-width="2"/>' + (i <= 1 ? text(40+i*unit,125,i*task.step) : '')).join('') + (position === null ? '' : '<circle cx="'+(40+position*unit)+'" cy="82" r="7" fill="#c78017"/>'+text(40+position*unit,55,'K','#aa5e06')));
      }
      draw(); stage.querySelectorAll('[data-ray]').forEach(el => {el.setAttribute('aria-pressed',Number(el.dataset.ray)===position?'true':'false');el.onclick = () => { position = Number(el.dataset.ray); stage.querySelectorAll('[data-ray]').forEach(b => b.setAttribute('aria-pressed',b === el ? 'true' : 'false')); draw(); };});
      disableButtons(); return { value: () => position === null ? null : position * task.step };
    }
    if (task.lab === 'divisors') {
      stage.innerHTML = '<h3>Проверяем два признака одновременно</h3><div class="lab-options">' + task.options.map(n => '<button type="button" class="lab-button" data-number="' + n + '" aria-pressed="false">' + n.toLocaleString('ru-RU') + '</button>').join('') + '</div>';
      if(disabled)selected=new Set(task.correct);
      stage.querySelectorAll('[data-number]').forEach(el => {el.setAttribute('aria-pressed',selected.has(Number(el.dataset.number))?'true':'false');el.onclick = () => { const n=Number(el.dataset.number); selected.has(n) ? selected.delete(n) : selected.add(n); el.setAttribute('aria-pressed',selected.has(n) ? 'true' : 'false'); };});
      disableButtons(); return { value: () => selected.size ? [...selected].sort((a,b)=>a-b) : null };
    }
    if (task.lab === 'groups') {
      stage.innerHTML = '<label class="lab-label" for="groupRange">Количество наборов: <output id="groupCount">1</output></label><input class="lab-range" id="groupRange" type="range" min="1" max="18" value="1"><div id="groupModel"></div><div class="lab-output" id="groupOutput" role="status"></div>';
      if(disabled)$('groupRange').value=task.answer;
      const update = () => {
        const n=Number($('groupRange').value), a=Math.floor(task.a/n), b=Math.floor(task.b/n), valid=task.a%n===0 && task.b%n===0;
        $('groupCount').textContent=n;
        $('groupModel').innerHTML = '<div class="lab-options" style="margin:10px 0">' + Array.from({length:n},(_,i)=>'<div style="border:1px solid #99bfde;border-radius:7px;padding:6px;text-align:center;font-size:.75rem">Набор '+(i+1)+'<br>🔵 '+a+' · 🔴 '+b+'</div>').join('') + '</div>';
        $('groupOutput').className='lab-output'+(valid?'':' warning'); $('groupOutput').textContent='В каждом наборе: '+a+' синих, '+b+' красных. Остаток: '+task.a%n+' синих, '+task.b%n+' красных. '+(valid?'Без остатка. Проверь, максимальное ли это количество.':'Наборы не используют все карточки.');
      }; on('groupRange','input',update); update(); disableButtons(); return { value: () => Number($('groupRange').value) };
    }
    if (task.lab === 'order') {
      stage.innerHTML = '<h3>Какое действие выполняется первым?</h3><div class="lab-options">' + task.options.map((option,i) => '<button class="lab-button" type="button" data-first="' + i + '" aria-pressed="false">' + escape(option) + '</button>').join('') + '</div>';
      stage.querySelectorAll('[data-first]').forEach(el => {el.setAttribute('aria-pressed',Number(el.dataset.first)===first?'true':'false');el.onclick = () => { first=Number(el.dataset.first); stage.querySelectorAll('[data-first]').forEach(b => b.setAttribute('aria-pressed',b===el?'true':'false')); };});
      disableButtons(); return { value: raw => first === null || core.number(raw) === null ? null : { first,answer:raw } };
    }
    if (task.lab === 'balance') {
      stage.innerHTML = '<label class="lab-label" for="balanceRange">Значение x: <output id="balanceX">1</output></label><input class="lab-range" id="balanceRange" type="range" min="1" max="30" value="1"><div id="balanceDrawing"></div><div id="balanceOutput" class="lab-output" role="status"></div>';
      if(disabled)$('balanceRange').value=task.answer;
      const update=()=>{
        const x=Number($('balanceRange').value), left=task.multiplier*x+task.extra, slope=Math.max(-20,Math.min(20,(left-task.total)/2));
        $('balanceX').textContent=x;
        $('balanceDrawing').innerHTML=svg('<path d="M310 48v96m-45 0h90" stroke="#42678a" stroke-width="6"/><path d="M120 '+(60+slope)+'L500 '+(60-slope)+'" stroke="#1f547c" stroke-width="5"/><circle cx="310" cy="60" r="9" fill="#dba533"/><path d="M120 '+(60+slope)+'v45m-65 0h130M500 '+(60-slope)+'v45m-65 0h130" stroke="#54789c" stroke-width="3" fill="none"/>'+text(120,100+slope,'3x + 12')+text(500,100-slope,'54'));
        $('balanceOutput').textContent='Слева: 3 · '+x+' + 12 = '+left+'. Справа: 54. '+(left===task.total?'Весы в равновесии.':left<task.total?'Левая чаша легче.':'Левая чаша тяжелее.');
      };on('balanceRange','input',update);update();disableButtons();return { value:()=>Number($('balanceRange').value) };
    }
    if (task.lab === 'motion') {
      stage.innerHTML = '<label class="lab-label" for="motionRange">Время: <output id="motionTime">0</output> ч</label><input class="lab-range" id="motionRange" type="range" min="0" max="5" step="0.5" value="0"><div id="motionDrawing"></div><div class="lab-output" id="motionOutput" role="status"></div>';
      if(disabled)$('motionRange').value=task.answer;
      const update=()=>{
        const t=Number($('motionRange').value), a=task.v1*t, b=task.distance-task.v2*t, gap=b-a;
        $('motionTime').textContent=String(t).replace('.',',');
        $('motionDrawing').innerHTML=svg('<path d="M40 88H580" stroke="#7f9db6" stroke-width="6"/>'+text(40,135,'0')+text(580,135,'30 км')+'<circle cx="'+(40+Math.min(task.distance,a)/task.distance*540)+'" cy="83" r="12" fill="#227cb2"/><circle cx="'+(40+Math.max(0,b)/task.distance*540)+'" cy="99" r="12" fill="#bf6725"/>'+text(150,40,'6 км/ч →')+text(465,40,'← 4 км/ч'));
        $('motionOutput').textContent=gap>0?'Между участниками '+gap+' км.':gap===0?'Участники встретились. Проверь время.':'Участники уже прошли точку встречи.';
      };on('motionRange','input',update);update();disableButtons();return { value:()=>Number($('motionRange').value) };
    }
    if (task.lab === 'area') {
      stage.innerHTML='<h3>12 столбцов × 8 рядов · угол 4 × 3 вырезан</h3><div class="area-grid">'+Array.from({length:task.cols*task.rows},(_,i)=>{
        const row=Math.floor(i/task.cols),col=i%task.cols,cut=row<task.cutRows && col>=task.cols-task.cutCols;
        return '<button type="button" class="cell'+(cut?' cut':'')+'"'+(cut?' disabled':' data-cell="'+i+'" aria-pressed="false"')+' aria-label="'+(cut?'Вырезанная':'Выделить')+' клетка, ряд '+(row+1)+', столбец '+(col+1)+'"></button>';
      }).join('')+'</div><div class="lab-output" id="areaOutput" role="status">Можно отмечать клетки, чтобы не считать дважды. Отмечено: 0.</div>';
      stage.querySelectorAll('[data-cell]').forEach(el=>el.onclick=()=>{const n=Number(el.dataset.cell);selected.has(n)?selected.delete(n):selected.add(n);el.setAttribute('aria-pressed',selected.has(n)?'true':'false');$('areaOutput').textContent='Отмечено клеток: '+selected.size+'. Площадь одной клетки — 1 см².';});
      stage.querySelectorAll('[data-cell]').forEach(el=>{el.disabled=disabled;if(disabled)el.setAttribute('aria-pressed','true');});if(disabled)$('areaOutput').textContent='Оставшаяся фигура: '+task.answer+' клетки по 1 см².';return { value:raw=>core.number(raw)===null?null:raw };
    }
    if (task.lab === 'fraction') {
      stage.innerHTML='<h3>48 наклеек разделены на 8 равных частей</h3><div class="fraction-model">'+Array.from({length:task.parts},(_,i)=>'<button type="button" data-part="'+i+'" aria-pressed="false" aria-label="Выделить часть '+(i+1)+' из 8">'+(i+1)+'</button>').join('')+'</div><div class="lab-output" id="fractionOutput" role="status">Выделено 0 из 8 равных частей.</div>';
      if(disabled){selected=new Set(Array.from({length:task.selectedParts},(_,i)=>i));$('fractionOutput').textContent='Выделено '+task.selectedParts+' из 8 равных частей.';}
      stage.querySelectorAll('[data-part]').forEach(el=>{el.setAttribute('aria-pressed',selected.has(Number(el.dataset.part))?'true':'false');el.onclick=()=>{const n=Number(el.dataset.part);selected.has(n)?selected.delete(n):selected.add(n);el.setAttribute('aria-pressed',selected.has(n)?'true':'false');$('fractionOutput').textContent='Выделено '+selected.size+' из 8 равных частей. Сколько наклеек в каждой части?';};});
      disableButtons();return { value:raw=>core.number(raw)===null || selected.size===0?null:{parts:selected.size,answer:raw} };
    }
    return { value:raw=>raw };
  }

  function renderTest() {
    const state = store.read();
    if (!state.test) { store.startTest(); renderTest(); return; }
    if (state.test.completed) { route('test-result'); return; }
    const id=data.testTaskIds.find(id=>!state.test.answers[id]);
    const index=data.testTaskIds.indexOf(id), task=core.byId.get(id);
    coach('Егор, сейчас отвечай самостоятельно. После матча разберём трудные задания.');
    view.innerHTML=crumb('Матч мастерской')+'<section class="panel"><span class="eyebrow">ВОПРОС '+(index+1)+' ИЗ 16 · '+escape(topicName(task.topic))+'</span><h1>Проверяем понимание</h1>'+progress(index,16)+'<p class="task-question">'+escape(task.prompt)+'</p><form id="testForm" class="answer-form"><label class="answer-label">Твой ответ<input id="testAnswer" type="text" inputmode="text" maxlength="80" autocomplete="off" class="answer-input" aria-describedby="testHelp"></label><button class="btn primary" type="submit">'+(index===15?'Завершить тест →':'Записать и дальше →')+'</button></form><p class="help-text" id="testHelp">Ответ на этот вопрос нельзя изменить после отправки. Результат и разбор — после всех вопросов.</p><div class="feedback error" id="testWarning" role="status" hidden></div><div class="toolbar"><a class="btn ghost" href="#home">Продолжить позже</a></div></section>';
    on('testForm','submit',e=>{
      e.preventDefault();const value=$('testAnswer').value;
      if(core.number(value)===null){$('testWarning').hidden=false;$('testWarning').textContent='Введи число или дробь, например 11/12.';return;}
      store.answerTest(id,value);renderTest();view.focus();window.scrollTo(0,0);
    });
  }
  function renderTestResult() {
    const state=store.read();if(!state.test?.completed){route('test');return;}
    const score=Object.values(state.test.answers).filter(r=>r.correct).length;
    coach('Матч завершён! Посмотрим, какие шаги уже получаются, а какие стоит повторить.','win');
    view.innerHTML=crumb('Итог теста')+'<section class="panel"><span class="eyebrow">МАТЧ МАСТЕРСКОЙ ЗАВЕРШЁН</span><h1>'+score+' из 16 · '+Math.round(score/16*100)+'%</h1><p class="muted">Лучший результат: '+state.bestTest+' из 16. Голы начислены только за впервые правильно решённые вопросы теста.</p>'+stats(state)+'<div class="toolbar"><a href="#review" class="btn primary">Повторить трудные задания →</a><a href="#home" class="btn">В мастерскую</a></div><h2 style="margin-top:28px">Разбор ответов</h2>'+data.testTaskIds.map((id,i)=>{const task=core.byId.get(id),row=state.test.answers[id];return '<details class="solution"><summary>'+(row.correct?'✓ ':'↻ ')+(i+1)+'. '+escape(topicName(task.topic))+'</summary><p style="margin-top:15px">'+escape(task.prompt)+'</p><p>Твой ответ: <b>'+escape(row.value)+'</b>. '+(row.correct?'Верно.':'Нужно повторить.')+'</p><ol>'+task.solution.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol></details>';}).join('')+'</section>';
  }
  function renderReport() {
    const state=store.read(), totals=core.summary(state), weak=core.weakTasks(state);
    coach('В отчёте видно, где Егор справляется самостоятельно и в каких заданиях нужна опора.','teacher');
    const date=state.lastActivity?new Date(state.lastActivity).toLocaleString('ru-RU'):'Пока нет ответов';
    view.innerHTML=crumb('Отчёт для родителя')+'<section class="panel"><span class="eyebrow">МАТЕМАТИЧЕСКАЯ МАСТЕРСКАЯ · ЕГОР</span><h1>Как идёт обучение</h1><p class="muted">Последняя практика: '+escape(date)+'. Время активной работы с заданиями: '+Math.floor(state.seconds/60)+' мин '+state.seconds%60+' с.</p>'+stats(state)+(state.test?.completed?'<p style="margin-top:20px">Последний тест: <b>'+Object.values(state.test.answers).filter(r=>r.correct).length+' из 16</b> · лучший результат: <b>'+state.bestTest+' из 16</b>. <a href="#test-result">Открыть разбор →</a></p>':'')+'<p style="margin-top:22px">Проверено ответов: <b>'+totals.attempts+'</b> · верных: <b>'+totals.right+'</b> · неверных: <b>'+totals.wrong+'</b> · открыто подсказок: <b>'+totals.hints+'</b>.</p><p class="muted">Самостоятельным считается верный первый ответ без подсказок в этой попытке. Это показатель работы с заданиями, а не школьная отметка.</p><div class="report-scroll"><table class="report-table"><thead><tr><th scope="col">Раздел</th><th scope="col">Решено</th><th scope="col">Без помощи</th><th scope="col">Ошибки</th><th scope="col">Подсказки</th><th scope="col">Следующий шаг</th></tr></thead><tbody>'+data.topics.map(t=>{
      const s=core.summary(state,t.id),level=core.level(state,t.id);const action=s.weak?'Повторить '+s.weak+' задания':s.attempts?'Тренировка уровня '+level:'Начать с первого уровня';
      return '<tr><td>'+escape(t.title)+'<small>Темы курса '+t.lessons[0]+'–'+t.lessons[t.lessons.length-1]+'</small></td><td>'+s.solved+' / '+s.total+'</td><td>'+s.independent+'</td><td>'+s.wrong+'</td><td>'+s.hints+'</td><td>'+escape(action)+'</td></tr>';
    }).join('')+'</tbody></table></div><div class="report-notes"><section><h2>Стоит повторить</h2>'+(weak.length?'<ul>'+[...new Set(weak.map(t=>t.topic))].map(id=>'<li>'+escape(topicName(id))+' — начать с одного задания без подсказки.</li>').join('')+'</ul>':'<p class="muted">Сейчас нет заданий с неразобранными ошибками.</p>')+'</section><section><h2>Что получается</h2>'+(totals.independent?'<ul>'+data.topics.filter(t=>core.summary(state,t.id).independent>0).map(t=>'<li>'+escape(t.title)+': '+core.summary(state,t.id).independent+' самостоятельно решённых заданий.</li>').join('')+'</ul>':'<p class="muted">Сначала нужно несколько самостоятельных ответов.</p>')+'</section></div><div class="toolbar"><a class="btn primary" href="#review">К повторению →</a><button class="btn" id="printReport">Распечатать отчёт</button><button class="btn ghost" id="downloadReport">Скачать данные отчёта</button></div><p class="scope-note">Отчёт относится только к мастерской. Сохранение работает на этом устройстве в этом браузере. Это не отдельный защищённый кабинет родителя. Время учитывается на открытом экране задания или теста и прекращается после 90 секунд без действий. Уроки основного курса используют свои прежние результаты.</p></section>';
    on('printReport','click',()=>window.print());
    on('downloadReport','click',()=>{
      const report={module:'Математическая мастерская — 5 класс',learner:'Егор',exportedAt:new Date().toISOString(),summary:core.summary(store.read()),progress:store.read()};
      const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='liga-math-workshop-progress.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  function tick() {
    const now=Date.now();
    if(wasVisible && (currentRoute==='practice' || currentRoute==='test') && now-lastAction<90000) store.tick(Math.floor(Math.min(60000,now-lastTick)/1000));
    lastTick=now;
  }
  function renderRoute() {
    tick();
    const name=location.hash.slice(1)||'home'; currentRoute=name;
    document.querySelector('.scoreboard').hidden=name==='test';
    if(name==='practice')renderPractice();
    else if(name==='labs')renderLabs();
    else if(name==='review')renderReview();
    else if(name==='report')renderReport();
    else if(name==='test')renderTest();
    else if(name==='test-result')renderTestResult();
    else if(['pick-training','pick-advanced','pick-olympiad'].includes(name))renderPicker(name.slice(5));
    else {currentRoute='home';renderHome();}
    if(currentRoute!=='test')header();view.focus();window.scrollTo(0,0);lastAction=Date.now();
  }
  ['pointerdown','keydown','input'].forEach(event=>document.addEventListener(event,()=>{lastAction=Date.now();},{passive:true}));
  document.addEventListener('visibilitychange',()=>{tick();wasVisible=!document.hidden;lastTick=Date.now();});
  window.addEventListener('pagehide',tick);
  window.addEventListener('hashchange',renderRoute);
  window.addEventListener('storage',e=>{if(e.key===core.STORAGE_KEY && currentRoute!=='test')header();});
  setInterval(tick,15000);
  renderRoute();
  if (window.LigaWorkshopBoot) window.LigaWorkshopBoot.ready();
})();
