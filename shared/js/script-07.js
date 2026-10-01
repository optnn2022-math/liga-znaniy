(function(){
  var selectedSubject = null;
  function isRootShell(){
    var p=(location.pathname||'').replace(/\/+$/,'');
    return !/\/(math|history|russian|chinese|biology)(\/|$)/.test(p);
  }
  document.addEventListener('click', function(e){
    var b=e.target.closest && e.target.closest('.subject[data-subject]');
    if(b) selectedSubject=b.getAttribute('data-subject');
  }, true);
  document.addEventListener('click', function(e){
    var o=e.target.closest && e.target.closest('#openSubject');
    if(!o || !isRootShell()) return;
    /* Math and History are physically separated modules in v6.1.
       Russian, Chinese and Biology continue to use the root shell while
       their lesson files remain in their own subject folders. */
    if(selectedSubject==='math'){
      e.preventDefault(); e.stopImmediatePropagation(); location.href='math/index.html';
    }
    if(selectedSubject==='history'){
      e.preventDefault(); e.stopImmediatePropagation(); location.href='history/index.html';
    }
  }, true);
})();
