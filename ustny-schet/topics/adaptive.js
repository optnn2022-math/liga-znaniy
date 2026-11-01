/* Лига знаний 6.4: индивидуальные задания, повторение ошибок, адаптация. */
(function(root){
'use strict';
const MAX=4000;
function key(t){
 if(!t||!t.topic)return '';
 if(t.key)return t.key;
 if(!t.expression)return '';
 const s=String(t.expression);
 if((t.topic==='subtract_parts'||t.topic==='decompose')&&s.includes('□')){
  const m=s.match(/^(\d+)\s*[+−-]\s*(\d+)\s*=/);
  if(m)return t.topic+'|split|'+m[1]+'|'+m[2];
 }
 return t.topic+'|'+s;
}
function trim(r){
 const keys=Object.keys(r);if(keys.length<=MAX)return;
 keys.sort((a,b)=>(r[a]?.lastAt||0)-(r[b]?.lastAt||0));
 for(let i=0;i<keys.length-MAX;i++)delete r[keys[i]];
}
function ensure(data){
 if(data.review&&typeof data.review==='object'&&!Array.isArray(data.review))return data.review;
 const r=Object.create(null);
 for(const s of (Array.isArray(data.sessions)?data.sessions.slice(-180):[])){
  for(const h of (Array.isArray(s.history)?s.history:[])){
   const k=key(h);if(!k)continue;
   const x=r[k]||{attempts:0,wrong:0,lastAt:0};
   x.attempts++;if(!h.correct)x.wrong++;
   x.lastAt=Math.max(x.lastAt,Date.parse(s.date)||0);r[k]=x;
  }
 }
 trim(r);data.review=r;return r;
}
function record(data,task,correct){
 const r=ensure(data),k=key(task);if(!k)return;
 const p=r[k]||{attempts:0,wrong:0,lastAt:0};
 r[k]={attempts:(Number(p.attempts)||0)+1,wrong:(Number(p.wrong)||0)+(correct?0:1),lastAt:Date.now()};
 if(Object.keys(r).length>MAX)trim(r);
}
function choose(options){
 const topics=Array.isArray(options.topics)?options.topics.filter(Boolean):[];
 if(!topics.length)return null;
 const used=options.used||new Set(),level=Number(options.level)||1,review=options.review||{};
 const wrong=(Array.isArray(options.mistakes)?options.mistakes:[]).filter(p=>p&&topics.includes(p.topic)&&key(p)&&!used.has(key(p))&&(p.level==null||Number(p.level)===level)&&(p.topic!=='multiply_round'||p.roundScheme===69));
 // В среднем 28% случаев отводится заданиям, в которых раньше были ошибки.
 if(wrong.length&&Math.random()<0.28){
  const weights=wrong.map(p=>Math.max(1,Math.min(6,Number(p.errors)||1)));
  let v=Math.random()*weights.reduce((a,b)=>a+b,0);
  for(let i=0;i<wrong.length;i++){v-=weights[i];if(v<0)return wrong[i];}
  return wrong[wrong.length-1];
 }
 let best=null,score=Infinity;
 for(let n=0;n<600;n++){
  const t=options.create(topics[Math.floor(Math.random()*topics.length)],level),k=key(t);
  if(!k||used.has(k))continue;
  const old=review[k];if(!old||!Number(old.attempts))return t;
  const age=Math.max(0,(Date.now()-(Number(old.lastAt)||0))/86400000);
  const rank=Number(old.attempts)*100-Math.min(30,age)+Math.random()*20;
  if(rank<score){score=rank;best=t;}
 }
 return best;
}
function adapt(chosen,current,right,streak,errors){
 const upper=Number(chosen)||1,now=Number(current)||upper;
 if(upper<=1||upper>=5)return {level:now,errors};
 if(!right&&errors>=2)return {level:Math.max(1,now-1),errors:0};
 if(right&&streak>0&&streak%3===0)return {level:Math.min(upper,now+1),errors};
 return {level:now,errors};
}
root.LigaAdaptive={key,ensure,record,choose,adapt};
})(typeof window!=='undefined'?window:globalThis);
