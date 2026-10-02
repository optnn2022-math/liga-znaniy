#!/usr/bin/env bash
set -euo pipefail
FILE="math/index.html"
[ -f "$FILE" ] || { echo "ERROR: $FILE not found. Run from repository root."; exit 1; }
cp "$FILE" "$FILE.bak-fast-topics"
python3 - <<'PY'
from pathlib import Path
p=Path('math/index.html')
s=p.read_text(encoding='utf-8')
old="html.math-booting body{visibility:hidden}"
if old in s:
    s=s.replace(old,"html.math-booting body{visibility:visible}",1)
old2="window.addEventListener('load', function () {\n  try {\n    if (typeof renderTopics === 'function') renderTopics();\n    if (typeof show === 'function') show('topics');"
new2="function ligaMathFastTopicsBoot(){\n  try {\n    if (typeof renderTopics === 'function') renderTopics();\n    if (typeof show === 'function') show('topics');"
if old2 in s:
    s=s.replace(old2,new2,1)
    tail="  } catch(e) { document.documentElement.classList.remove('math-booting'); console.error('math-only rollback fix', e); }\n});\n</script>"
    repl="  } catch(e) { document.documentElement.classList.remove('math-booting'); console.error('math fast topics boot', e); }\n}\nif(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',ligaMathFastTopicsBoot,{once:true});}else{ligaMathFastTopicsBoot();}\n</script>"
    idx=s.find(tail, s.find('function ligaMathFastTopicsBoot'))
    if idx!=-1:
        s=s[:idx]+s[idx:].replace(tail,repl,1)
else:
    # If previous patch changed formatting, inject an early boot before global stars.
    marker='<script src="../shared/js/global-stars-v818.js"></script>'
    inject="""<script id=\"math-fast-topics-v1\">\n(function(){\n function boot(){try{if(typeof renderTopics==='function')renderTopics();if(typeof show==='function')show('topics');document.documentElement.classList.remove('math-booting');}catch(e){document.documentElement.classList.remove('math-booting');}}\n if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();\n})();\n</script>\n"""
    if marker in s and 'math-fast-topics-v1' not in s:
        s=s.replace(marker,inject+marker,1)
p.write_text(s,encoding='utf-8')
PY
# sanity checks
grep -q "DOMContentLoaded.*ligaMathFastTopicsBoot\|math-fast-topics-v1" "$FILE" || { echo "ERROR: fast boot was not installed"; mv "$FILE.bak-fast-topics" "$FILE"; exit 1; }
echo "OK: Math topics now initialize on DOMContentLoaded, without waiting for all images/media."
