/* Injected by GitHub CI into a temporary v5-7.html page. */
(async function(){
const sleep=t=>new Promise(r=>setTimeout(r,t));
let result={};
try{
 let d=null;
 for(let i=0;i<120;i++){
  d=document.getElementById('app')?.contentDocument;
  if(d?.getElementById('start')&&document.getElementById('app').contentWindow.MathTrainer)break;
  await sleep(200);
 }
 if(!d?.getElementById('start'))throw Error('Topic page failed to load');
 const press=s=>{const e=d.querySelector(s);if(!e)throw Error('No element: '+s);e.click();return e;};
 const leaked=()=>[...d.body.childNodes].some(n=>n.nodeType===3&&/function open\\(session\\)|window\\.LigaSessionPDF/.test(n.textContent));
 result.leakedInitially=leaked();
 press('[data-topic="fractions"]');press('[data-mode="practice"]');press('#start');await sleep(120);
 result.fractionVisible=!d.getElementById('fractionEntry').hidden;
 result.fractionPlainInputHidden=d.getElementById('answer').style.display==='none';
 result.fractionKeyboardVisible=!d.getElementById('numpad').classList.contains('hidden');
 press('#numpad [data-key="3"]');press('#numpad [data-key="/"]');press('#numpad [data-key="8"]');
 result.fractionAnswer=d.getElementById('answer').value;
 result.fractionNumerator=d.querySelector('[data-fpart="num"]').textContent;
 result.fractionDenominator=d.querySelector('[data-fpart="den"]').textContent;
 press('#stop');press('#back');
 press('[data-topic="mixed"]');press('[data-mode="practice"]');press('#start');await sleep(120);
 result.mixedVisible=!d.getElementById('fractionEntry').hidden;
 result.mixedWholeVisible=!d.getElementById('fractionWhole').hidden;
 press('#stop');press('#back');
 press('[data-topic="decompose"]');press('[data-level="5"]');press('[data-mode="practice"]');press('#start');await sleep(120);
 result.splitFieldsVisible=!d.getElementById('splitAnswer').classList.contains('hidden');
 result.splitKeyboardVisible=!d.getElementById('numpad').classList.contains('hidden');
 press('#numpad [data-key="1"]');press('#numpad [data-key="0"]');press('#numpad [data-key="0"]');
 result.splitValue=d.getElementById('splitPart1').value;
 result.leakedFinally=leaked();
 result.pass=result.fractionVisible&&result.fractionPlainInputHidden&&result.fractionKeyboardVisible&&result.fractionAnswer==='3/8'&&result.fractionNumerator==='3'&&result.fractionDenominator==='8'&&result.mixedVisible&&result.mixedWholeVisible&&result.splitFieldsVisible&&result.splitKeyboardVisible&&result.splitValue==='100'&&!result.leakedInitially&&!result.leakedFinally;
}catch(error){result.pass=false;result.error=String(error.stack||error);}
const pre=document.createElement('pre');pre.id='SMOKE_RESULT';pre.textContent=JSON.stringify(result);document.body.appendChild(pre);
})();