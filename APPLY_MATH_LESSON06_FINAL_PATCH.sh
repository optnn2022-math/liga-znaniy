#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
[ -f math/index.html ] || { echo "ERROR: run from liga-znaniy repository root"; exit 1; }
[ -f math/lessons/06/js/lesson.js ] || { echo "ERROR: math/lessons/06/js/lesson.js not found"; exit 1; }
[ -f math/lessons/06/css/lesson.css ] || { echo "ERROR: math/lessons/06/css/lesson.css not found"; exit 1; }
cp math/index.html math/index.html.bak-l06-final
cp math/lessons/06/js/lesson.js math/lessons/06/js/lesson.js.bak-l06-final
cp math/lessons/06/css/lesson.css math/lessons/06/css/lesson.css.bak-l06-final
[ ! -f shared/js/global-stars-v818.js ] || cp shared/js/global-stars-v818.js shared/js/global-stars-v818.js.bak-l06-final
python3 - <<'PY'
from pathlib import Path
import re

# 1) Lesson 6 background + quiz background
p=Path('math/lessons/06/css/lesson.css')
s=p.read_text(encoding='utf-8')
s=s.replace("img_001_67a145f6bf3e5227.png","img_001_67a145f6bf3e5227.webp")
s=re.sub(r"\.quiz-screen\{position:fixed;inset:0;z-index:50;overflow:auto;background:#082852f7;padding:20px\}",
         ".quiz-screen{position:fixed;inset:0;z-index:50;overflow:auto;background:linear-gradient(180deg,#052455b8,#082852d9),url('../../../assets/embedded/img_001_67a145f6bf3e5227.webp') center/cover fixed;padding:20px}",s)
p.write_text(s,encoding='utf-8')

# 2) Lesson 6 scoring: 6 practice goals max + 7 quiz goals max = 13.
p=Path('math/lessons/06/js/lesson.js')
s=p.read_text(encoding='utf-8')
old="const vals=[2,3,4,5,6,7,10,15],good=new Set([2,3,5,6,10,15]),chips=document.getElementById('chips');vals.forEach(v=>{let b=document.createElement('button');b.className='chip';b.textContent=v;b.onclick=()=>{if(b.disabled)return;b.disabled=true;if(good.has(v)){b.classList.add('good');addGoal()}else{b.style.background='#713c55';b.style.borderColor='#ff9870'};if([...good].every(x=>[...chips.children].some(z=>+z.textContent===x&&z.disabled))){let f=document.getElementById('fb');f.classList.remove('hidden');f.innerHTML='<b>Верные делители 30:</b> 2, 3, 5, 6, 10, 15.'}};chips.appendChild(b)});"
new="const vals=[2,3,4,5,6,7,10,15],good=new Set([2,3,5,6,10,15]),chips=document.getElementById('chips');let divisors30Done=false;vals.forEach(v=>{let b=document.createElement('button');b.className='chip';b.textContent=v;b.onclick=()=>{if(b.disabled)return;b.disabled=true;if(good.has(v)){b.classList.add('good')}else{b.style.background='#713c55';b.style.borderColor='#ff9870'};if([...good].every(x=>[...chips.children].some(z=>+z.textContent===x&&z.disabled))){let f=document.getElementById('fb');f.classList.remove('hidden');f.innerHTML='<b>Верные делители 30:</b> 2, 3, 5, 6, 10, 15.';if(!divisors30Done){addGoal();divisors30Done=true}}};chips.appendChild(b)});"
if old not in s:
    raise SystemExit('ERROR: expected lesson 6 divisor task block not found; patch stopped safely')
s=s.replace(old,new,1)
# Best result persistence. Repeating lesson cannot reduce saved result or add duplicate persistent goals.
old_finish="function finishTest(){let correct=quizData.reduce((n,x,i)=>n+(quizAnswers[i]===x.c),0);for(let i=0;i<correct;i++)addGoal();let pct=Math.round(correct/7*100);localStorage.setItem('liga_math_topic6_goals',score);localStorage.setItem('liga_math_topic6_complete','1');document.getElementById('quizQuestionView').classList.add('hidden');document.getElementById('quizResultView').classList.remove('hidden');document.getElementById('quizResult').innerHTML='<b>Мини-тест: '+correct+' из 7 ('+pct+'%).</b><br>За тест: '+correct+' ⚽<br><b>Всего за урок: '+score+' ⚽</b>'}function finishLesson(){localStorage.setItem('liga_math_topic6_goals',String(score));localStorage.setItem('liga_math_topic6_complete','1');location.href=mathTopicsUrl();}syncScore();"
new_finish="function saveBestTopic6(){const old=Math.max(0,Number(localStorage.getItem('liga_math_topic6_goals')||0));const best=Math.max(old,Math.min(13,score));localStorage.setItem('liga_math_topic6_goals',String(best));localStorage.setItem('liga_math_topic6_complete','1');return best}function finishTest(){let correct=quizData.reduce((n,x,i)=>n+(quizAnswers[i]===x.c),0);for(let i=0;i<correct;i++)addGoal();let pct=Math.round(correct/7*100),best=saveBestTopic6();document.getElementById('quizQuestionView').classList.add('hidden');document.getElementById('quizResultView').classList.remove('hidden');document.getElementById('quizResult').innerHTML='<b>Мини-тест: '+correct+' из 7 ('+pct+'%).</b><br>За тест: '+correct+' ⚽<br><b>Всего за эту попытку: '+score+' ⚽ из 13</b><br>Лучший результат: '+best+' ⚽ из 13'}function finishLesson(){saveBestTopic6();location.replace(mathTopicsUrl())}syncScore();"
if old_finish not in s:
    raise SystemExit('ERROR: expected lesson 6 finish block not found; patch stopped safely')
s=s.replace(old_finish,new_finish,1)
p.write_text(s,encoding='utf-8')

# 3) Math topics are visible immediately. This removes the one-frame landing flash on return.
p=Path('math/index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('<section id="landing" class="screen">','<section id="landing" class="screen hidden">',1)
s=s.replace('<section id="topics" class="screen hidden">','<section id="topics" class="screen">',1)
# Preserve fast boot even if an older patch still waits for window.load.
s=s.replace("window.addEventListener('load', function () {\n  try {\n    if (typeof renderTopics === 'function') renderTopics();\n    if (typeof show === 'function') show('topics');",
"function ligaMathFastTopicsBoot(){\n  try {\n    if (typeof renderTopics === 'function') renderTopics();\n    if (typeof show === 'function') show('topics');",1)
marker="  } catch(e) { document.documentElement.classList.remove('math-booting'); console.error('math-only rollback fix', e); }\n});\n</script>"
if 'function ligaMathFastTopicsBoot()' in s and marker in s:
    s=s.replace(marker,"  } catch(e) { document.documentElement.classList.remove('math-booting'); console.error('math fast topics boot', e); }\n}\nif(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',ligaMathFastTopicsBoot,{once:true});}else{ligaMathFastTopicsBoot();}\n</script>",1)
p.write_text(s,encoding='utf-8')

# 4) Global stars: include modular lesson 6 result once.
p=Path('shared/js/global-stars-v818.js')
if p.exists():
    s=p.read_text(encoding='utf-8')
    token="Object.keys(g).forEach(function(k){total+=n(g[k])});"
    addition=token+"\n  total+=n(localStorage.getItem('liga_math_topic6_goals'));"
    if "liga_math_topic6_goals" not in s and token in s:
        s=s.replace(token,addition,1)
        p.write_text(s,encoding='utf-8')
PY

echo "=== FINAL LESSON 6 PATCH CHECK ==="
grep -q "img_001_67a145f6bf3e5227.webp" math/lessons/06/css/lesson.css && echo "OK background: WEBP"
grep -q "divisors30Done" math/lessons/06/js/lesson.js && echo "OK scoring: practice task 1 = one goal"
grep -q "Math.max(old,Math.min(13,score))" math/lessons/06/js/lesson.js && echo "OK scoring: best result 0..13, no downgrade"
grep -q "location.replace(mathTopicsUrl())" math/lessons/06/js/lesson.js && echo "OK finish: direct return to Math topics"
grep -q '<section id="topics" class="screen">' math/index.html && echo "OK topics: visible immediately, no landing flash"
if [ -f shared/js/global-stars-v818.js ]; then grep -q "liga_math_topic6_goals" shared/js/global-stars-v818.js && echo "OK global stars: lesson 6 included"; fi

echo "Patch applied. Now run: bash UPDATE_SITE.sh"
