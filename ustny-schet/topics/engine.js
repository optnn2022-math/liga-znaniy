/* Учебный генератор: арифметические ответы и несколько верных способов разложения. */
(function(root){
'use strict';
const topics=[
 {id:'composition',group:0,title:'Состав числа до 10',icon:'🧩',sample:'8 = 5 + ?',method:'Представь число как две части. Чтобы найти недостающую часть, вычти известную из целого.'},
 {id:'tens',group:0,title:'Счёт десятками',icon:'🔟',sample:'27, 37, 47, ?',method:'При прибавлении или вычитании десятков единицы не меняются.'},
 {id:'round',group:0,title:'До круглого числа',icon:'🎯',sample:'68 + ? = 70',method:'Определи ближайший следующий десяток, сотню или тысячу и найди разницу.'},
 {id:'decompose',group:0,title:'Удобные слагаемые',icon:'🪄',sample:'38 + 27 = 38 + 2 + ?',method:'Удобно по-разному: можно дополнить до круглого числа или выделить сотни, десятки и единицы. На уровне 5 ты сам выбираешь слагаемые.'},
 {id:'multiply',group:1,title:'Таблица умножения',icon:'✖️',sample:'7 × 8 = ?',method:'Свяжи умножение с одинаковыми слагаемыми и запоминай табличные случаи.'},
 {id:'divide',group:1,title:'Таблица деления',icon:'➗',sample:'56 ÷ 7 = ?',method:'Проверь частное умножением: какое число при умножении на 7 даёт 56?'},
 {id:'convenient',group:2,title:'Сложение и вычитание удобным способом',icon:'⚖️',sample:'39 + 26 = 40 + 25',method:'При сложении можно перенести единицу между слагаемыми. При вычитании округли вычитаемое и сделай поправку.'},
 {id:'subtract_parts',group:2,title:'Вычитание частями',icon:'🧱',sample:'73 − 28 = 73 − 20 − 8',method:'Разложи вычитаемое на разрядные слагаемые и вычитай их последовательно.'},
 {id:'round_ops',group:2,title:'Умножение и деление на круглые числа',icon:'💯',sample:'240 ÷ 60 = 24 ÷ 6',method:'Используй разрядные единицы и свойства умножения и деления.'},
 {id:'distributive',group:2,title:'Распределительный закон',icon:'🧠',sample:'14 × 6 = (10 + 4) × 6',method:'(a+b)·c=a·c+b·c. При делении суммы раздели каждое слагаемое на одно число, если это возможно.'},
 {id:'hundreds',group:3,title:'Сложение и вычитание до 100 и 1000',icon:'🔢',sample:'387 + 245 = ?',method:'Работай с разрядами: сотни, десятки, единицы. Оставляй перенос в уме.'},
 {id:'chain',group:3,title:'Счёт в несколько действий',icon:'🔗',sample:'Начни с 8 → +7 → ×2 → −4',method:'Делай действия строго в указанной стрелками последовательности; удерживай промежуточный ответ в уме.'},
 {id:'divisibility',group:4,block:2,title:'Признаки делимости',icon:'🔍',sample:'Делится ли 354 на 3?',method:'Проверяй число по признаку делимости. Отвечай «да» или «нет».'},
 {id:'fractions',group:4,block:2,title:'Обыкновенные дроби',icon:'🍰',sample:'1/4 + 2/4 = ?',method:'Складывай, вычитай, умножай и дели правильные дроби. В этой теме и слагаемые, и ответ меньше 1; смешанные числа изучаются отдельно.'},
 {id:'mixed',group:4,block:2,title:'Смешанные числа',icon:'🧮',sample:'2 1/3 + 1 1/3 = ?',method:'Выделяй целую часть, превращай смешанные числа в неправильные дроби и вычисляй.'},
 {id:'decimals',group:4,block:2,title:'Десятичные дроби',icon:'💧',sample:'3,7 + 1,25 = ?',method:'Считай по разрядам, уравнивай количество знаков после запятой. Ответ вводи с запятой или точкой.'}
];
const groups=[{title:'Фундамент счёта',subtitle:'Состав числа, десятки и округление',icon:'🌱'}, {title:'Табличные навыки',subtitle:'Умножение и деление',icon:'⭐'}, {title:'Рациональные приёмы',subtitle:'Удобные вычисления',icon:'🧠'}, {title:'Беглость и внимание',subtitle:'Большие числа и цепочки',icon:'🚀'}, {title:'Блок 2 · Дроби и делимость',subtitle:'Признаки делимости, обыкновенные, смешанные и десятичные дроби',icon:'🎓'}];
function rnd(min,max){return min+Math.floor(Math.random()*(max-min+1));}
function pick(arr){return arr[rnd(0,arr.length-1)];}

// Точные рациональные вычисления: никаких сравнений через погрешность float.
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a||1;};
function rat(n,d=1){if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)throw Error('Некорректная дробь');if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>rat(a.n*b.d-b.n*a.d,a.d*b.d);
const mul=(a,b)=>rat(a.n*b.n,a.d*b.d);
const div=(a,b)=>rat(a.n*b.d,a.d*b.n);
const fr=(a)=>a.d===1?String(a.n):`${a.n}/${a.d}`;
function mixed(a){const w=Math.floor(a.n/a.d),rest=a.n%a.d;return rest?(w?`${w} ${rest}/${a.d}`:`${rest}/${a.d}`):String(w);}
function decimal(a){if(a.d===1)return String(a.n);let n=a.n,d=a.d,places=0;while(d%2===0){d/=2;places++;}let t=0;d=a.d;while(d%2===0)d/=2;while(d%5===0){d/=5;t++;}if(d!==1)return fr(a);const k=Math.max(places,t);let v=String(Math.round(a.n*10**k/a.d)).padStart(k+1,'0');return (k?v.slice(0,-k)+','+v.slice(-k).replace(/0+$/,''):v).replace(/,$/,'');}
function parseRational(raw){
 const s=String(raw).trim().replace(/−/g,'-').replace(/\s+/g,' ').replace(',', '.');
 let m=s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);if(m){const whole=Number(m[1]),num=Number(m[2]),den=Number(m[3]);if(den===0||num>=den)return null;return rat((whole<0?-1:1)*(Math.abs(whole)*den+num),den);}
 m=s.match(/^(-?\d+)\/([1-9]\d*)$/);if(m)return rat(Number(m[1]),Number(m[2]));
 m=s.match(/^(-?\d+)(?:\.(\d{1,6}))?$/);if(m){const places=(m[2]||'').length;return rat(Number(m[1])*(10**places)+(m[1].startsWith('-')?-1:1)*Number(m[2]||0),10**places);}
 return null;
}
function check(task,raw){const s=String(raw??'').trim().toLowerCase();
 if(task.kind==='split'){
  if(!/^\d+\s*\+\s*\d+(?:\s*\+\s*\d+)?$/.test(s))return {valid:false,message:'Введи два или три натуральных слагаемых, например 100 + 5.'};
  const parts=s.split('+').map(t=>Number(t.trim()));
  if(parts.some(n=>!Number.isSafeInteger(n)||n<=0))return {valid:false,message:'Каждая часть должна быть положительным целым числом.'};
  const sum=parts.reduce((a,b)=>a+b,0),correct=sum===task.target;
  const sorted=parts.slice().sort((a,b)=>a-b);
  const ideal=task.parts.slice().sort((a,b)=>a-b);
  const match=sorted.length===ideal.length&&sorted.every((v,i)=>v===ideal[i]);
  const roundParts=parts.every(n=>{let q=n;while(q%10===0)q/=10;return q<10;});
  const roundedFirst=parts.some(x=>[10,100,1000].some(m=>(task.base+(task.operation==='subtract'?-x:x))%m===0));
  const efficient=match||(roundParts&&parts.length<=task.parts.length)||roundedFirst;
  const user=parts.join(' + ');
  const reason=!correct?`Сумма выбранных частей равна ${sum}, а нужно ${task.target}.`:
   efficient?match?'Отлично! Ты выделил удобные разрядные слагаемые.':roundedFirst?`Отлично! Одна из частей помогает ${task.operation==='subtract'?'получить круглое число при вычитании':'дополнить число до круглого'}.`:'Отлично! Части удобно считать по разрядам.':
   `Разложение математически верное. Есть и другой удобный способ: ${task.target} = ${task.parts.join(' + ')}.`;
  return {valid:true,user,correct,efficient,reason,parts};
 }

 if(task.kind==='yesno')return ['да','нет'].includes(s)?{valid:true,user:s,correct:s===task.answer}:{valid:false,message:'Выбери «Да» или «Нет».'};
 if(task.kind==='rational'){const x=parseRational(raw);if(!x)return {valid:false,message:'Введите число, десятичную или обыкновенную дробь (например, 1/2 или 2 1/3).'};const y=rat(task.expected.n,task.expected.d);return {valid:true,user:String(raw).trim(),correct:x.n*y.d===y.n*x.d};}
 const val=String(raw).trim().replace(/−/g,'-');if(!/^-?\d{1,9}$/.test(val))return {valid:false,message:'Введите целое число.'};return {valid:true,user:Number(val),correct:Number(val)===task.answer};
}
function divisibilityRule(d,n){let tail=String(n).slice(d===8?-3:-2),sum=String(n).split('').reduce((a,c)=>a+Number(c),0);
 switch(d){case 2:return 'последняя цифра чётная';case 3:return `сумма цифр ${sum} делится на 3`;case 4:return `последние две цифры (${Number(tail)}) делятся на 4`;case 5:return 'последняя цифра — 0 или 5';case 6:return 'число делится и на 2, и на 3';case 8:return `последние три цифры (${Number(tail)}) делятся на 8`;case 9:return `сумма цифр ${sum} делится на 9`;case 10:return 'последняя цифра равна 0';case 15:return 'число делится и на 3, и на 5';case 25:return 'последние две цифры — 00, 25, 50 или 75';case 100:return 'последние две цифры равны 00';default:return 'раздели число без остатка';}}
function advanced(topic,level){let a,b,c,ans,expression,hint,solution,kind='rational',expected;
 if(topic==='divisibility'){
  const divisions=[[2,5,10],[3,9,2,5],[4,25,3,9,10],[6,8,15,25,100]][level-1];a=pick(divisions);const should=rnd(0,1)===1;
  const min=[0,10,50,100,300][level],max=[0,99,900,1500,9999][level];
  if(should){const lo=Math.ceil(min/a),hi=Math.floor(max/a);b=rnd(lo,hi)*a;}
  else {do{b=rnd(min,max);}while(b%a===0);}
  kind='yesno';ans=should?'да':'нет';expression=`Делится ли ${b} на ${a}?`;
  hint=`Признак: ${divisibilityRule(a,b)}.`;solution=`${b} ${should?'делится':'не делится'} на ${a}. Проверяем признак: ${divisibilityRule(a,b)} — условие ${should?'выполнено':'не выполнено'}.`;
 }
 else if(topic==='fractions'){
  // В теме «Обыкновенные дроби» только правильные дроби: 0 < x, y, ответ < 1.
  // Смешанные числа изучаются исключительно в отдельной теме «Смешанные числа».
  let x,y,op;
  const ds=[3,4,5,6,8,9,10,12];
  op=level===4?pick(['+','−','×','÷']):pick(['+','−']);
  const results={'+':add,'−':sub,'×':mul,'÷':div};
  let found=false;
  for(let attempt=0;attempt<300;attempt++){
   if(level===1){a=pick([3,4,5,6,8,10]);b=rnd(1,a-1);c=rnd(1,a-1);x=rat(b,a);y=rat(c,a);}
   else if(level===2){a=pick([2,3,4,5,6]);b=a*pick([2,3]);x=rat(rnd(1,a-1),a);y=rat(rnd(1,b-1),b);}
   else {a=pick(ds);b=pick(ds.filter(d=>d!==a));x=rat(rnd(1,a-1),a);y=rat(rnd(1,b-1),b);}
   // Положительная разность и частное меньше единицы.
   if(op==='−' && x.n*y.d<y.n*x.d)[x,y]=[y,x];
   if(op==='÷' && x.n*y.d>y.n*x.d)[x,y]=[y,x];
   expected=results[op](x,y);
   if(expected.n>0 && expected.n<expected.d){found=true;break;}
  }
  if(!found)throw Error('Не удалось создать правильную дробь');
  expression=`${fr(x)} ${op} ${fr(y)} = ?`;
  hint=op==='+'||op==='−'?(x.d===y.d?'Знаменатели одинаковые: выполни действие с числителями, знаменатель оставь прежним.':`Приведи дроби к общему знаменателю ${x.d*y.d/gcd(x.d,y.d)} (НОК). Домножь числители на дополнительные множители.`):op==='×'?'Умножь числители и знаменатели.':'Умножь первую дробь на дробь, обратную второй.';
  solution=`${fr(x)} ${op} ${fr(y)} = ${fr(expected)}. Ответ — правильная дробь. Равные дроби принимаются.`;ans=fr(expected);
 }
 else if(topic==='mixed'){
  let x,y,op;
  if(level===1){a=rnd(1,4);b=pick([3,4,5,6,8]);c=rnd(1,b-1);x=rat(a*b+c,b);expected=x;expression=`Выдели целую часть: ${a*b+c}/${b} = ?`;hint='Раздели числитель на знаменатель с остатком.';solution=`${a*b+c} ÷ ${b} = ${a} (остаток ${c}), значит ${mixed(x)}.`;ans=mixed(x);}
  else if(level===2){a=rnd(1,5);b=pick([3,4,5,6,8]);c=rnd(1,b-1);expected=rat(a*b+c,b);expression=`Запиши неправильной дробью: ${a} ${c}/${b} = ?`;hint=`Умножь целую часть ${a} на ${b} и прибавь числитель ${c}.`;solution=`(${a} × ${b} + ${c})/${b} = ${fr(expected)}.`;ans=fr(expected);}
  else {a=pick([3,4,5,6,8,10]);b=rnd(1,a-1);c=rnd(1,a-1);let w=rnd(1,5),z=rnd(1,4);x=rat(w*a+b,a);y=rat(z*a+c,a);op=rnd(0,1)?'+':'−';if(op==='−'&&x.n*y.d<y.n*x.d)[x,y]=[y,x];if(level===4){const other=pick([2,3,4,5,6,8].filter(d=>d!==a));y=rat(z*other+rnd(1,other-1),other);if(op==='−'&&x.n*y.d<y.n*x.d)[x,y]=[y,x];}
   expected=op==='+'?add(x,y):sub(x,y);expression=`${mixed(x)} ${op} ${mixed(y)} = ?`;hint='Представь числа неправильными дробями, затем выполни действие.';solution=`${fr(x)} ${op} ${fr(y)} = ${fr(expected)} = ${mixed(expected)}.`;ans=mixed(expected);
  }
 }
 else if(topic==='decimals'){
  const power=[0,10,100,100,1000][level];let x,y,op;
  if(level===1||level===2){a=rnd(5,level===1?90:990);b=rnd(1,level===1?70:800);const den=level===1?10:100;x=rat(a,den);y=rat(b,den);op=rnd(0,1)?'+':'−';if(op==='−'&&a<b)[x,y]=[y,x];expected=op==='+'?add(x,y):sub(x,y);}
  else if(level===3){a=rnd(11,999);x=rat(a,100);b=rnd(2,9);y=rat(b);op=pick(['×','÷','+','−']);if(op==='−'&&x.n*y.d<y.n*x.d)[x,y]=[y,x];if(op==='÷'){x=mul(x,y);}}
  else {a=rnd(12,990);b=rnd(2,9);x=rat(a,100);y=rat(b,10);op=pick(['×','÷','+','−']);if(op==='−'&&x.n*y.d<y.n*x.d)[x,y]=[y,x];if(op==='÷'){x=mul(x,y);}}
  if(level>=3)expected={'+':add,'−':sub,'×':mul,'÷':div}[op](x,y);
  expression=`${decimal(x)} ${op} ${decimal(y)} = ?`;ans=decimal(expected);hint=op==='+'||op==='−'?'Уравняй количество знаков после запятой и вычисляй по разрядам.':op==='×'?'Умножь как натуральные числа и поставь запятую.':'Сделай делитель целым: перенеси запятые в обоих числах на одинаковое количество разрядов.';
  solution=`${decimal(x)} ${op} ${decimal(y)} = ${decimal(expected)}.`;
 }
 else throw Error('Неизвестная тема второго блока: '+topic);
 return {topic,kind,expression,answer:ans,expected,hint,solution,key:topic+'|'+expression,level};
}

// Случайные упражнения: по 3 группы чисел для сложения и вычитания.
function freeSplit(topic,taskLevel=5){
 const subtract=topic==='subtract_parts',operation=subtract?'subtract':'add',group=rnd(0,2);
 let a,b;
 if(subtract){
  if(group===0){a=rnd(42,99);b=rnd(11,a-1);}
  else if(group===1){a=rnd(132,995);b=rnd(11,89);}
  else {a=rnd(222,995);b=rnd(101,a-1);}
 }else{
  if(group===0){a=rnd(21,99);b=rnd(11,89);}
  else if(group===1){a=rnd(112,995);b=rnd(11,89);}
  else {a=rnd(112,995);b=rnd(101,375);}
 }
 const place=b>=100?100:10,head=Math.floor(b/place)*place,rest=b-head;
 const parts=rest>=10&&rest%10!==0?[head,Math.floor(rest/10)*10,rest%10].filter(Boolean):[head,rest].filter(Boolean);
 // Если число кратно 10/100, сохраняем две строго положительные части.
 if(parts.length<2){parts.splice(0,parts.length,Math.floor(b/10)*10-10,b-(Math.floor(b/10)*10-10));}
 const symbol=subtract?'−':'+';
 const solution=`Например: ${b} = ${parts.join(' + ')}. Поэтому ${a} ${symbol} ${b} = ${a} ${symbol} ${parts.join(' '+symbol+' ')} = ${subtract?a-b:a+b}. Это один из возможных удобных способов.`;
 const hint=subtract?`Разложи ${b} по разрядам или выдели часть, чтобы при вычитании из ${a} получить круглое число. Вычитай части по очереди.`:`Разложи ${b} по разрядам или выдели часть, чтобы при прибавлении к ${a} получить круглое число.`;
 return {topic,kind:'split',operation,level:taskLevel,base:a,target:b,parts,expression:`${a} ${symbol} ${b} = ${a} ${symbol} □ ${symbol} □`,answer:parts.join(' + '),hint,solution,key:`${topic}|split|${a}|${b}`};
}
function make(topic,level=1){
 if(Number(level)===5&&['decompose','subtract_parts'].includes(topic))return freeSplit(topic,5);
  // Профи: обе части второго слагаемого выбирает ученик.
  if(Number(level)===4&&topic==='decompose')return freeSplit(topic,4);
 level=Math.max(1,Math.min(4,Number(level)||1));
 if(['divisibility','fractions','mixed','decimals'].includes(topic))return advanced(topic,level);
 let expression,answer,hint,solution,meta='';
 let a,b,c,d;
 switch(topic){
  case 'composition': {
   const hi=[0,5,7,10,10][level];a=rnd(2,hi);b=rnd(0,a);c=a-b;
   if(rnd(0,1)) {expression=`${a} = ${b} + ?`;answer=c;} else {expression=`${a} = ? + ${c}`;answer=b;}
   hint=`Из ${a} вычти известную часть.`;solution=`${a} − ${a-answer} = ${answer}.`;break;
  }
  case 'tens': {
   const k=[0,10,40,90,250][level];
   a=level===1?rnd(1,5)*10:rnd(1,k);b=10*rnd(1,level>=3?3:1);const direction=a-b>=0&&rnd(0,3)===0?-1:1;
   expression=`${a}, ${a+direction*b}, ${a+2*direction*b}, ?`;
   answer=a+3*direction*b;
   // Для возрастающих серий значения всегда положительные; при убывании — проверяем нулевую границу.
   if(answer<0){expression=`${a}, ${a+10}, ${a+20}, ?`;answer=a+30;b=10;}
   hint='Посмотри, на сколько изменяется число при каждом шаге.';
   solution=`Шаг последовательности: ${direction*b>0?'+':''}${answer-(a+2*direction*b)}. Следующее число: ${answer}.`;
   if(expression.includes(`${a+20}`)&&answer===a+30)solution=`Шаг +10. Следующее число: ${answer}.`;
   break;
  }
  case 'round': {
   const place=[0,10,10,100,1000][level];const block=rnd(level>=3?2:1,level===4?9:level===3?8:9);b=rnd(1,place-1);a=block*place-b;answer=b;
   expression=`${a} + ? = ${block*place}`;hint=`Найди разность ${block*place} − ${a}.`;
   solution=`${block*place} − ${a} = ${answer}.`;break;
  }
  case 'decompose': {
   if(level<=2){const place=level===1?10:100;a=rnd(1,level===1?9:8)*place;b=rnd(1,place-1);const whole=a+b;
    if(rnd(0,1)){expression=`${whole} = ${a} + ?`;answer=b;}else{expression=`${whole} = ? + ${b}`;answer=a;}
    hint='Раздели число на круглую часть и остаток.';solution=`${whole} = ${a} + ${b}.`;
   }else{const place=level===3?10:100;const start=rnd(2,8)*place+rnd(1,place-1);const toNext=place-start%place;
    const second=rnd(toNext+1,toNext+place);answer=second-toNext;
    expression=`${start} + ${second} = ${start} + ${toNext} + ?`;
    hint=`Для круглого числа сначала прибавь ${toNext}. Сколько останется от ${second}?`;
    solution=`${second} = ${toNext} + ${answer}. Далее ${start+toNext} + ${answer} = ${start+second}.`;
   }break;
  }
  case 'multiply': {
   a=rnd(2,[0,4,6,9,10][level]);b=rnd(2,[0,6,9,9,10][level]);answer=a*b;expression=`${a} × ${b} = ?`;
   hint=`Это ${a} групп по ${b}.`;solution=`${a} × ${b} = ${answer}.`;break;
  }
  case 'divide': {
   b=rnd(2,[0,4,6,9,10][level]);c=rnd(2,[0,6,9,9,10][level]);a=b*c;
   expression=`${a} ÷ ${b} = ?`;answer=c;hint=`Найди число, которое при умножении на ${b} даёт ${a}.`;
   solution=`${b} × ${c} = ${a}, поэтому ${a} ÷ ${b} = ${c}.`;break;
  }
  case 'convenient': {
   const place=level>=3?100:10;
   const mult=rnd(2,level>=3?8:9);
   const off=rnd(1,Math.min(place-1,level===1?3:9));a=mult*place-off;
   if(rnd(0,1)) {
    b=rnd(off+1,level>=3?place+65:65);answer=a+b;
    expression=`${a} + ${b} = ?`;
    hint=`Замени на ${a+off} + ${b-off}.`;
    solution=`${a} + ${b} = ${a+off} + ${b-off} = ${answer}.`;
   }else{
    b=rnd(1,level>=3?3:6)*place-off;if(b>a){[a,b]=[b,a];}answer=a-b;
    expression=`${a} − ${b} = ?`;hint=`Замени на (${a} − ${b+off}) + ${off}.`;
    solution=`${a} − ${b} = ${a} − ${b+off} + ${off} = ${answer}.`;
   }
   break;
  }
  case 'subtract_parts': {
   const max=[0,39,99,299,999][level];a=rnd(level===1?20:level===4?200:50,max);b=rnd(level===1?11:level===4?100:21,Math.max(level===1?11:21,a-1));
   if(b>a)b=a-1;
   const chunks=[Math.floor(b/100)*100,Math.floor((b%100)/10)*10,b%10].filter(Boolean);
   answer=a-b;expression=`${a} − ${b} = ?`;
   hint=`Вычитай по частям: ${chunks.join(', затем ')}.`;
   const partials=[a];for(const part of chunks)partials.push(partials.at(-1)-part);
   solution=`${a} − ${b} = ${a} − ${chunks.join(' − ')}. По шагам: ${partials.join(' → ')}.`;break;
  }
  case 'round_ops': {
   const zeros=level<=2?10:level===3?100:10;
   if(rnd(0,1)){
    a=rnd(2,level===4?35:12)*zeros;b=rnd(2,level===1?5:level===2?9:12);
    if(level===4)b=rnd(2,9)*10;
    answer=a*b;expression=`${a} × ${b} = ?`;
    hint=`Сначала умножь ${a/zeros} на ${b}, затем умножь результат на ${zeros}.`;
    solution=`${a} × ${b} = (${a/zeros} × ${b}) × ${zeros} = ${answer}.`;
   }else{
    b=rnd(2,level===4?12:9)*zeros;c=rnd(2,level===4?20:10);a=b*c;
    answer=c;expression=`${a} ÷ ${b} = ?`;
    hint=`Сократи оба числа в ${zeros} раз: ${a/zeros} ÷ ${b/zeros}.`;
    solution=`${a} ÷ ${b} = ${a/zeros} ÷ ${b/zeros} = ${answer}.`;
   }break;
  }
  case 'distributive': {
   if(rnd(0,1)){
    a=rnd(level>=3?2:1,level>=3?9:3)*10;
    b=rnd(1,level===1?4:level===4?19:9);c=rnd(2,level===1?5:level===2?7:10);
    answer=(a+b)*c;expression=`(${a} + ${b}) × ${c} = ?`;
    hint=`Вычисли ${a} × ${c} и ${b} × ${c}, сложи результаты.`;
    solution=`${a} × ${c} + ${b} × ${c} = ${a*c} + ${b*c} = ${answer}.`;
   }else{
    c=rnd(2,level===1?5:level===2?7:9);
    a=c*rnd(2,level>=3?20:10);b=c*rnd(1,level>=3?12:5);
    answer=(a+b)/c;expression=`(${a} + ${b}) ÷ ${c} = ?`;
    hint=`Раздели ${a} и ${b} по отдельности на ${c}.`;
    solution=`${a} ÷ ${c} + ${b} ÷ ${c} = ${a/c} + ${b/c} = ${answer}.`;
   }break;
  }
  case 'hundreds': {
   const max=[0,50,100,500,1000][level];a=rnd(10,max);b=rnd(10,max);
   const addition=rnd(0,1)===1;if(!addition&&b>a)[a,b]=[b,a];answer=addition?a+b:a-b;
   expression=`${a} ${addition?'+':'−'} ${b} = ?`;
   hint='Сначала работай с сотнями и десятками, затем с единицами.';
   solution=`${a} ${addition?'+':'−'} ${b} = ${answer}. Разложи числа на разрядные слагаемые.`;break;
  }
  case 'chain': {
   const steps=level===1?2:level===2?3:level===3?3:4;
   const start=rnd(level===1?2:5,level===4?50:15);let current=start;let labels=[],way=[String(start)];
   for(let i=0;i<steps;i++){
    const available=['+','−'];if(level>=2)available.push('×');if(level>=3)available.push('÷');
    let op=pick(available),n;
    if(op==='+'){n=rnd(2,level===4?40:12);current+=n;}
    else if(op==='−'){if(current<=2){op='+';n=3;current+=n;}else{n=rnd(1,Math.min(current-1,level===4?40:12));current-=n;}}
    else if(op==='×'){n=rnd(2,level===4?5:3);if(current*n>900){op='+';n=5;current+=n;}else current*=n;}
    else{const divisors=[2,3,4,5,6,7,8,9].filter(x=>current%x===0);if(!divisors.length){op='+';n=3;current+=n;}else{n=pick(divisors);current/=n;}}
    labels.push((op==='−'?'−':op==='×'?'×':op==='÷'?'÷':'+')+` ${n}`);way.push(String(current));
   }
   answer=current;expression=`Начни с ${start}: ${labels.join(' → ')} → ?`;
   hint='Считай по порядку от стрелки к стрелке.';
   solution=`${way.join(' → ')}. Ответ: ${answer}.`;
   break;
  }
  default:throw new Error('Неизвестная тема: '+topic);
 }
 if(!Number.isInteger(answer)||answer<0)throw new Error('Некорректный ответ '+topic+' '+expression+': '+answer);
 return {topic,expression,answer,hint,solution,key:topic+'|'+expression,level};
}
root.MathTrainer={topics,groups,make,check,parseRational};
})(typeof window!=='undefined'?window:globalThis);