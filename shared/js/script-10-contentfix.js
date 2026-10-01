(()=>{
'use strict';
function openRequestedSubject(){
  const subject=new URLSearchParams(location.search).get('subject');
  try{
    if(subject==='russian' && typeof renderRussian==='function'){renderRussian(); if(typeof show==='function')show('russian'); if(typeof syncGlobalStars==='function')syncGlobalStars();}
    else if(subject==='chinese' && typeof renderChinese==='function'){renderChinese(); if(typeof show==='function')show('chinese'); if(typeof syncGlobalStars==='function')syncGlobalStars();}
    else if(subject==='biology'){if(typeof renderBiologyProgress==='function')renderBiologyProgress(); if(typeof show==='function')show('biology'); if(typeof syncGlobalStars==='function')syncGlobalStars();}
  }catch(e){console.error('content-fix',subject,e);}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(openRequestedSubject,50));
else setTimeout(openRequestedSubject,50);
window.addEventListener('load',()=>setTimeout(openRequestedSubject,150));
})();
