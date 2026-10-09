(function(){
'use strict';
function safe(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function n(v){return Number(v)||0}
function totalStars(){
  var total=0;
  var m=safe('liga-znaniy-course-v2')||{}, g=m.goals||{};
  [5,5,7,5,5].forEach(function(max,i){total+=Math.min(max,n(g[i]))});
  total+=Math.min(4,Object.values(m.rayFirstGoals||{}).filter(Boolean).length);
  total+=Math.min(13,n(localStorage.getItem('liga_math_topic6_goals')!==null?localStorage.getItem('liga_math_topic6_goals'):localStorage.getItem('liga_math_prime_goals')));
  total+=Math.min(31,n(localStorage.getItem('primeLessonGoals')));
  var t8=safe('liga_math_topic8_earned_v1')||[],t9=safe('liga_math_topic9_earned_v1')||[];
  total+=Math.min(20,Array.isArray(t8)?new Set(t8.filter(x=>typeof x==='string')).size:0);
  total+=Math.min(17,Array.isArray(t9)?new Set(t9.filter(x=>typeof x==='string')).size:0);
  var ra=safe('liga_russian_lesson1_preview_v1')||{}, rb=safe('liga-znaniy-russian-progress-v1')||{};
  var rga=Object.values(ra.goals||{}).filter(Boolean).length, rgb=n(rb.topic1Goals); total+=Math.max(rga,rgb);
  var v2=safe('liga-znaniy-biology-progress-v2')||{},v1=safe('liga-znaniy-biology-progress-v1')||{},seen={};
  [1,2,3,11].forEach(function(i){var r=v2['topic'+i]||v2[i]||{},bg=Math.max(n(v1['topic'+i+'Goals']),n(r.goals));if(bg){total+=bg;seen['topic'+i]=1;seen[String(i)]=1}});
  Object.keys(v2).forEach(function(k){var r=v2[k];if(r&&typeof r==='object'&&!seen[k]){seen[k]=1;total+=n(r.goals)}});
  for(var i=1;i<=95;i++){var bg=n(localStorage.getItem('biology_topic_'+i+'_goals'));if(bg&&!seen[String(i)]&&!seen['topic'+i])total+=bg}
  var h=safe('liga-znaniy-history-progress-v1')||{}; total+=n(h.goals1)+n(h.goals2)+n(h.goals3)+n(h.block1GoalsV2);
  var ca=safe('liga-znaniy-chinese-lesson1-v1')||{},cb=safe('league-chinese-lesson2-prototype-v1')||{},cp=safe('liga-znaniy-chinese-progress-v1')||{};
  var cg1=Math.max(Array.isArray(ca.goals)?new Set(ca.goals).size:0,n(cp.topic1Goals));
  var cg2=Math.max(Array.isArray(cb.earned)?new Set(cb.earned).size:0,n(cp.topic2Goals)); total+=cg1+cg2;
  return total;
}
var busy=false;
function sync(){if(busy)return;busy=true;var v=totalStars();document.querySelectorAll('[data-points]').forEach(function(el){if(el.textContent!==String(v))el.textContent=v});busy=false}
window.LigaGlobalStars={get:totalStars,sync:sync};
document.addEventListener('DOMContentLoaded',sync);window.addEventListener('pageshow',sync);window.addEventListener('storage',sync);
var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if((t.nodeType===1&&t.matches&&t.matches('[data-points]'))||(t.parentElement&&t.parentElement.matches&&t.parentElement.matches('[data-points]'))){sync();break}}});
function watch(){if(document.body)mo.observe(document.body,{subtree:true,childList:true,characterData:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
setInterval(sync,1200);
})();
