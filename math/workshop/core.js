(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./tasks.js'));
  else root.WorkshopCore = factory(root.WorkshopData);
})(typeof window !== 'undefined' ? window : globalThis, function (data) {
  'use strict';
  const STORAGE_KEY = 'liga_math_workshop_v1';
  const byId = new Map(data.tasks.map(task => [task.id, task]));
  const rewardIds = new Set([...byId.keys(), ...data.testTaskIds.map(id => 'test:' + id)]);
  const topicIds = new Set(data.topics.map(topic => topic.id));
  const count = (value, max = 1000000) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));
  const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
  const fresh = () => ({ version: 1, earned: [], records: {}, recent: [], seconds: 0, lastActivity: null, resume: null, test: null, bestTest: null });

  function number(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string' || value.length > 80) return null;
    const text = value.trim().replace(/\s/g, '').replace(',', '.');
    if (!text) return null;
    if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) {
      const result = Number(text);
      return Number.isFinite(result) ? result : null;
    }
    const fraction = text.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if (!fraction || Number(fraction[2]) === 0) return null;
    const result = Number(fraction[1]) / Number(fraction[2]);
    return Number.isFinite(result) ? result : null;
  }
  function grade(task, value) {
    if (!task) return false;
    if (task.lab === 'divisors') {
      return Array.isArray(value) && value.length === task.correct.length && new Set(value).size === value.length && task.correct.every(n => value.includes(n));
    }
    if (task.lab === 'order') return !!value && value.first === task.correctFirst && grade({ answer: task.answer }, value.answer);
    if (task.lab === 'fraction') return !!value && value.parts === task.selectedParts && grade({ answer: task.answer }, value.answer);
    const parsed = number(value);
    return parsed !== null && Math.abs(parsed - task.answer) <= 1e-10 * Math.max(1, Math.abs(task.answer));
  }
  function normalize(raw) {
    const state = fresh();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return state;
    state.earned = [...new Set(Array.isArray(raw.earned) ? raw.earned.filter(id => rewardIds.has(id)) : [])];
    if (raw.records && typeof raw.records === 'object') for (const task of data.tasks) {
      const record = raw.records[task.id];
      if (!record || typeof record !== 'object') continue;
      const right = count(record.right), wrong = count(record.wrong);
      state.records[task.id] = { attempts: right + wrong, right, wrong, hints: count(record.hints), solved: !!record.solved,
        weak: !!record.weak, independent: count(record.independent), last: date(record.last) };
    }
    state.recent = (Array.isArray(raw.recent) ? raw.recent : []).filter(row => row && topicIds.has(row.topic) && typeof row.correct === 'boolean' && date(row.at)).slice(-80).map(row => ({ topic: row.topic, correct: row.correct, independent: row.independent === true, at: row.at }));
    state.seconds = count(raw.seconds, 100000000);
    state.lastActivity = date(raw.lastActivity);
    if (raw.resume && byId.has(raw.resume.id)) {
      const queue = (Array.isArray(raw.resume.queue) ? raw.resume.queue : []).filter(id => byId.has(id)).slice(0, 48);
      if (!queue.includes(raw.resume.id)) queue.unshift(raw.resume.id);
      const index = queue[count(raw.resume.index, queue.length - 1)] === raw.resume.id ? count(raw.resume.index, queue.length - 1) : queue.indexOf(raw.resume.id);
      state.resume = { id: raw.resume.id, hints: count(raw.resume.hints, 2), tries: count(raw.resume.tries, 100), done: raw.resume.done === true,
        category: data.categories.some(c => c.id === raw.resume.category) ? raw.resume.category : 'training',
        queue, index, review: raw.resume.review === true,
        value: typeof raw.resume.value === 'string' ? raw.resume.value.slice(0, 80) : '' };
    }
    if (raw.test && typeof raw.test === 'object') {
      state.test = { answers: {}, started: date(raw.test.started), completed: date(raw.test.completed) };
      for (const id of data.testTaskIds) {
        const row = raw.test.answers && raw.test.answers[id];
        if (row && typeof row.value === 'string' && number(row.value) !== null) state.test.answers[id] = { value: row.value.slice(0, 80), correct: grade(byId.get(id), row.value) };
      }
      if (Object.keys(state.test.answers).length !== data.testTaskIds.length) state.test.completed = null;
    }
    state.bestTest = raw.bestTest === null || raw.bestTest === undefined ? null : count(raw.bestTest, data.testTaskIds.length);
    return state;
  }
  function recordFor(state, id) {
    return state.records[id] || (state.records[id] = { attempts: 0, right: 0, wrong: 0, hints: 0, solved: false, weak: false, independent: 0, last: null });
  }
  function logAnswer(state, task, correct, independent, time) {
    const rec = recordFor(state, task.id);
    rec.attempts++;
    rec[correct ? 'right' : 'wrong']++;
    rec.last = time;
    if (correct) { rec.solved = true; if (independent) rec.independent++; }
    rec.weak = !correct || !independent;
    state.recent.push({ topic: task.topic, correct, independent, at: time });
    state.recent = state.recent.slice(-80);
    state.lastActivity = time;
  }
  function createStore(storage, onUnavailable) {
    let cached = fresh();
    let unavailable = false;
    function fail() { if (!unavailable && onUnavailable) onUnavailable(); unavailable = true; }
    function read() {
      if (!unavailable) try { cached = normalize(JSON.parse(storage.getItem(STORAGE_KEY) || 'null')); } catch (error) {
        if (error instanceof SyntaxError) cached = fresh(); else fail();
      }
      return normalize(cached);
    }
    function transaction(change) {
      const state = read(); const result = change(state); cached = normalize(state);
      if (!unavailable) try { storage.setItem(STORAGE_KEY, JSON.stringify(cached)); } catch (_) { fail(); }
      return result;
    }
    return {
      read,
      submit(id, value, assisted = false) {
        const task = byId.get(id); if (!task) throw new Error('Unknown task');
        const correct = grade(task, value);
        return transaction(state => {
          logAnswer(state, task, correct, correct && !assisted, new Date().toISOString());
          const awarded = correct && !state.earned.includes(id);
          if (awarded) state.earned.push(id);
          return { correct: !!correct, awarded };
        });
      },
      hint(id) { if (byId.has(id)) transaction(state => { recordFor(state,id).hints++; }); },
      resume(value) { transaction(state => { state.resume = value; }); },
      tick(seconds) { transaction(state => { state.seconds += count(seconds, 60); }); },
      startTest() {
        transaction(state => { if (!state.test || state.test.completed) state.test = { answers: {}, started: new Date().toISOString(), completed: null }; });
      },
      answerTest(id, value) {
        if (!data.testTaskIds.includes(id) || number(value) === null) return null;
        return transaction(state => {
          if (!state.test || state.test.completed || state.test.answers[id]) return null;
          const task = byId.get(id), correct = grade(task,value), time = new Date().toISOString();
          state.test.answers[id] = { value: String(value), correct };
          logAnswer(state,task,correct,correct,time);
          const key = 'test:' + id, awarded = correct && !state.earned.includes(key);
          if (awarded) state.earned.push(key);
          if (Object.keys(state.test.answers).length === data.testTaskIds.length) {
            state.test.completed = time;
            const score = Object.values(state.test.answers).filter(a => a.correct).length;
            state.bestTest = Math.max(state.bestTest || 0,score);
          }
          return { correct, awarded };
        });
      }
    };
  }
  function level(state, topic) {
    const recent = state.recent.filter(r => r.topic === topic).slice(-3);
    if (recent.length >= 2 && recent.filter(r => !r.correct).length >= 2) return 1;
    if (recent.length === 3 && recent.every(r => r.independent)) return 3;
    if (recent.filter(r => r.independent).length >= 2) return 2;
    return 1;
  }
  function weakTasks(state) { return data.tasks.filter(task => state.records[task.id] && state.records[task.id].weak); }
  function queue(state, topic, category) {
    const list = data.tasks.filter(task => (!topic || task.topic === topic) && task.category === category);
    return list.sort((a,b) => {
      const as = state.records[a.id], bs = state.records[b.id];
      const rank = t => Math.abs(t.level - level(state,t.topic));
      return rank(a) - rank(b) || Number(!!as?.solved) - Number(!!bs?.solved) || a.id.localeCompare(b.id);
    }).map(task => task.id);
  }
  function summary(state, topic) {
    const list = data.tasks.filter(task => !topic || task.topic === topic);
    const records = list.map(task => state.records[task.id]).filter(Boolean);
    return { attempts: records.reduce((n,r) => n + r.attempts,0), right: records.reduce((n,r) => n + r.right,0),
      wrong: records.reduce((n,r) => n + r.wrong,0), hints: records.reduce((n,r) => n + r.hints,0),
      solved: records.filter(r => r.solved).length, independent: records.filter(r => r.independent > 0).length,
      weak: records.filter(r => r.weak).length, total: list.length };
  }
  return { STORAGE_KEY, number, grade, normalize, createStore, level, weakTasks, queue, summary, byId };
});
