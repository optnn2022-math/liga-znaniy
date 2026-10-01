/* Liga Znaniy modular progress compatibility layer.
   IMPORTANT: existing storage keys from MASTER v62 are intentionally preserved. */
(function(w){
  const KEYS=Object.freeze({
    course:'liga-znaniy-course-v2',
    history:'liga-znaniy-history-progress-v1',
    biology:'liga-znaniy-biology-progress-v1',
    russian:'liga-znaniy-russian-progress-v1',
    chinese:'liga-znaniy-chinese-progress-v1',
    chineseLesson1:'liga-znaniy-chinese-lesson1-v1',
    chineseLesson2:'league-chinese-lesson2-prototype-v1',
    chats:'liga-znaniy-subject-chats-v1'
  });
  function read(key,fallback){try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch(e){return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
  w.LigaProgress={keys:KEYS,read,write,readSubject:function(subject){return read(KEYS[subject],{})}};
})(window);
