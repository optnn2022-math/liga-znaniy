(function(){
'use strict';
const KEY='liga_informatics_lesson01_v1';
const allowed=/^(?:s[0-4]|p[0-4]|safe[0-4]|work[0-4]|q[0-9])$/;
function sync(){
 const label=document.getElementById('infoLesson01Progress');if(!label)return;
 let state={};try{state=JSON.parse(localStorage.getItem(KEY)||'null')||{};}catch(e){}
 const done=state.done&&typeof state.done==='object'?state.done:{};
 const ids=(Array.isArray(state.earned)?state.earned:[]).concat(Object.keys(done).filter(id=>done[id]===1));
 const goals=Math.min(30,new Set(ids.filter(id=>typeof id==='string'&&allowed.test(id))).size);
 label.textContent=(state.completed===true?'Урок 1 пройден':'Урок 1 доступен')+' · '+goals+' / 30 голов →';
}
window.addEventListener('pageshow',sync);window.addEventListener('storage',sync);
sync();
})();
