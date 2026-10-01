
(() => {
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const cardsAsset = "../shared/assets-v7/cea2ac828eaf2fb5d782.webp";
  const mainHero = one('#chinese img[alt*="Футболист блока китайского"]');
  const mainAsset = mainHero ? mainHero.getAttribute('src') : '';
  all('[data-cn-asset]').forEach(image => {
    const source = image.dataset.cnAsset === 'cards' ? cardsAsset : mainAsset;
    if (source) image.src = source;
  });

  let lastTrigger = null;
  let activeFilter = 'all';
  const overlays = () => all('.cn-overlay');

  function syncModalState() {
    document.body.classList.toggle('cn-modal-open', overlays().some(item => item.classList.contains('open')));
  }

  function openOverlay(id, trigger) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    lastTrigger = trigger || document.activeElement;
    overlay.classList.add('open');
    syncModalState();
    const focusTarget = one('button,input,a', overlay);
    if (focusTarget) requestAnimationFrame(() => focusTarget.focus());
  }

  function closeOverlay(id, restoreFocus = true) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('open');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    all('.cn-speak-button.playing').forEach(button => button.classList.remove('playing'));
    syncModalState();
    if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') requestAnimationFrame(() => lastTrigger.focus());
  }

  one('#openChineseDictionary').addEventListener('click', event => openOverlay('chineseDictionaryOverlay', event.currentTarget));
  one('#openChineseReview').addEventListener('click', event => openOverlay('chineseReviewOverlay', event.currentTarget));
  all('[data-cn-close]').forEach(button => button.addEventListener('click', () => closeOverlay(button.dataset.cnClose)));

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('ru-RU').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function applyDictionaryFilter() {
    const query = normalize(one('#chineseWordSearch').value);
    let visible = 0;
    all('.cn-word-card', one('#chineseDictionaryGrid')).forEach(card => {
      const groups = card.dataset.cnGroups.split(/\s+/);
      const matchesFilter = activeFilter === 'all' || groups.includes(activeFilter);
      const matchesQuery = !query || normalize(card.dataset.cnSearch).includes(query);
      const show = matchesFilter && matchesQuery;
      card.hidden = !show;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    one('#chineseWordCount').textContent = 'Показано слов: ' + visible;
    one('#chineseEmptyWords').style.display = visible ? 'none' : 'block';
  }

  one('#chineseWordSearch').addEventListener('input', applyDictionaryFilter);
  all('.cn-filter-button').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.cnFilter;
    all('.cn-filter-button').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyDictionaryFilter();
  }));

  function speakChinese(text, button) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      button.setAttribute('title', 'Озвучивание не поддерживается этим браузером');
      return;
    }
    window.speechSynthesis.cancel();
    all('.cn-speak-button.playing').forEach(item => item.classList.remove('playing'));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = .72;
    const voice = window.speechSynthesis.getVoices().find(item => /^zh(-|_)/i.test(item.lang));
    if (voice) utterance.voice = voice;
    button.classList.add('playing');
    utterance.onend = utterance.onerror = () => button.classList.remove('playing');
    window.speechSynthesis.speak(utterance);
  }
  all('.cn-speak-button').forEach(button => button.addEventListener('click', () => speakChinese(button.dataset.cnSpeak, button)));

  function stopGame() {
    one('#chineseWordwallFrame').src = 'about:blank';
  }

  all('.cn-launch-game').forEach(button => button.addEventListener('click', event => {
    const source = button.dataset.embed;
    const external = button.dataset.external || source;
    closeOverlay('chineseReviewOverlay', false);
    one('#chineseGameTitle').textContent = '🏮 ' + button.dataset.title;
    one('#chineseGameTag').textContent = button.dataset.tag || 'Игра';
    one('#chineseGameExternalTop').href = external;
    one('#chineseGameExternalBottom').href = external;
    const frame = one('#chineseWordwallFrame');
    frame.title = 'Wordwall: ' + button.dataset.title;
    frame.src = source;
    const status = document.getElementById(button.dataset.status);
    if (status) status.hidden = false;
    openOverlay('chineseGameOverlay', event.currentTarget);
  }));

  one('#backToChineseReview').addEventListener('click', () => {
    stopGame();
    closeOverlay('chineseGameOverlay', false);
    openOverlay('chineseReviewOverlay', one('#openChineseReview'));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (one('#chineseGameOverlay').classList.contains('open')) one('#backToChineseReview').click();
    else if (one('#chineseDictionaryOverlay').classList.contains('open')) closeOverlay('chineseDictionaryOverlay');
    else if (one('#chineseReviewOverlay').classList.contains('open')) closeOverlay('chineseReviewOverlay');
  });
  window.addEventListener('pagehide', stopGame);
  all('.cn-filter-button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
  applyDictionaryFilter();

  // Synchronize earned goals with the topic list after returning from lessons.
  try {
    const rows = [...document.querySelectorAll('.chinese-row')];
    const rowByNumber = number => rows.find(row => row.querySelector('.num')?.textContent.trim() === number);
    const lesson1 = JSON.parse(localStorage.getItem('liga-znaniy-chinese-lesson1-v1') || '{}');
    const lesson1Goals = Array.isArray(lesson1.goals) ? [...new Set(lesson1.goals)].length : 0;
    const row1 = rowByNumber('01');
    if (row1) {
      const score = row1.querySelector('.goals');
      if (score) score.textContent = '⚽ ' + Math.min(8, lesson1Goals) + ' / 8';
    }
    const row2 = rowByNumber('02');
    if (row2 && lesson1Goals >= 8) {
      row2.classList.remove('locked'); row2.classList.add('ready');
      row2.setAttribute('aria-disabled','false');
    }
    const lesson2 = JSON.parse(localStorage.getItem('league-chinese-lesson2-prototype-v1') || '{}');
    const lesson2Goals = Array.isArray(lesson2.earned) ? [...new Set(lesson2.earned)].length : 0;
    if (row2) {
      const score = row2.querySelector('.goals');
      if (score) score.textContent = lesson1Goals >= 8 ? ('⚽ ' + Math.min(8, lesson2Goals) + ' / 8') : '🔒 8/8 в уроке 1';
    }
  } catch (_) {}
})();
