
(function(){
  function openRequestedSubject(){
    var subject=new URLSearchParams(location.search).get('subject');
    if(!subject) return;
    var b=document.querySelector('.subject[data-subject="'+subject.replace(/"/g,'')+'"]');
    if(!b) return;
    try { b.click(); } catch(e) {}
    setTimeout(function(){
      var open=document.getElementById('openSubject');
      if(open) try { open.click(); } catch(e) {}
    },80);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',openRequestedSubject);
  else openRequestedSubject();
})();
