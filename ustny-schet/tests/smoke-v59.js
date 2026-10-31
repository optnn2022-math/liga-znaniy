/* Injected by GitHub CI into a temporary v5-9.html page. */
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
 const leaked=()=>d.body.innerText.includes('function open(session)') || d.body.innerText.includes('window.LigaSessionPDF=(function()');
 result.leakedInitially=leaked();
 result.pdfReady=typeof d.defaultView.LigaSessionPDF?.documentFor==='function';
 result.pdfValid=result.pdfReady&&d.defaultView.LigaSessionPDF.documentFor({history:[{expression:'1+2',user:'3',answer:'3',correct:true}],date:Date.now()}).endsWith('</body></html>');
 result.plusButton=!!d.querySelector('#numpad [data-key="+"]');
 result.manualSummandsButtonVisible=!d.getElementById('freeSplitMode').classList.contains('hidden')&&d.getElementById('freeSplitMode').textContent.includes('Подбери слагаемые сам');
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
 press('[data-topic="decompose"]');press('[data-level="1"]');press('[data-mode="practice"]');press('#start');await sleep(120);
 press('#numpad [data-key="+"]');result.plusInsert=d.getElementById('answer').value==='+';
 press('#stop');press('#back');
 press('[data-topic="decompose"]');press('[data-level="5"]');press('[data-mode="practice"]');press('#start');await sleep(120);
 result.splitFieldsVisible=!d.getElementById('splitAnswer').classList.contains('hidden');
 result.splitKeyboardVisible=!d.getElementById('numpad').classList.contains('hidden');
 press('#numpad [data-key="1"]');press('#numpad [data-key="0"]');press('#numpad [data-key="0"]');
 result.splitValue=d.getElementById('splitPart1').value;
 press('#numpad [data-key="+"]');press('#numpad [data-key="7"]');result.splitSecondValue=d.getElementById('splitPart2').value;
 press('#numpad [data-key="+"]');press('#numpad [data-key="4"]');result.splitThirdValue=d.getElementById('splitPart3').value;
 result.splitThirdShown=!d.getElementById('splitPart3').classList.contains('hidden');
 result.leakedFinally=leaked();
 result.pass=result.pdfReady&&result.pdfValid&&result.plusButton&&result.manualSummandsButtonVisible&&result.plusInsert&&result.fractionVisible&&result.fractionPlainInputHidden&&result.fractionKeyboardVisible&&result.fractionAnswer==='3/8'&&result.fractionNumerator==='3'&&result.fractionDenominator==='8'&&result.mixedVisible&&result.mixedWholeVisible&&result.splitFieldsVisible&&result.splitKeyboardVisible&&result.splitValue==='100'&&result.splitSecondValue==='7'&&result.splitThirdValue==='4'&&result.splitThirdShown&&!result.leakedInitially&&!result.leakedFinally;
}catch(error){result.pass=false;result.error=String(error.stack||error);}
const pre=document.createElement('pre');pre.id='SMOKE_RESULT';pre.textContent=JSON.stringify(result);document.body.appendChild(pre);
})();