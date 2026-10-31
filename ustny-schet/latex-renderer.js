window.LigaLatex=(function(){
 const fracTopics=new Set(['fractions','mixed','decimals']);
 const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Исходные данные и ответы по-прежнему хранятся в обычной записи для проверки и статистики.
 function asTeX(s){
  return String(s).replace(/(-?\d+\s+\d+\/\d+|-?\d+\/\d+|-?\d+,\d+)/g,segment=>{
   let m=segment.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
   if(m)return m[1]+'\\,'+'\\frac{'+m[2]+'}{'+m[3]+'}';
   m=segment.match(/^(-?\d+)\/(\d+)$/);
   if(m)return '\\frac{'+m[1]+'}{'+m[2]+'}';
   return segment.replace(',', '{,}');
  }).replace(/×/g,' \\times ').replace(/÷/g,' \\div ').replace(/−/g,' - ');
 }
 function fallback(s){
  return escapeHTML(s).replace(/(-?\d+)\s+(\d+)\/(\d+)|(-?\d+)\/(\d+)/g,(_m,w,n,d,num,den)=>{
   const whole=w?escapeHTML(w)+'&nbsp;':'';
   return whole+'<span style="display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1.03;font-size:.83em;margin:0 .12em"><span style="border-bottom:1.3px solid currentColor;padding:0 .12em .08em">'+escapeHTML(n||num)+'</span><span style="padding:.08em .12em 0">'+escapeHTML(d||den)+'</span></span>';
  });
 }
 function svg(tex){
  try {const out=window.MathJax.tex2svg(tex,{display:false});return out.outerHTML;}
  catch(e){return '';}
 }
 function formula(raw,topic){
  if(!fracTopics.has(topic))return escapeHTML(raw);
  const s=String(raw),m=s.match(/^([^:]+:\s*)([\s\S]+)$/);
  const prefix=m?escapeHTML(m[1]):'',expr=m?m[2]:s;
  return prefix+(svg(asTeX(expr))||fallback(expr));
 }
 function inline(raw,topic){
  if(!fracTopics.has(topic))return escapeHTML(raw);
  const s=String(raw),regex=/(-?\d+\s+\d+\/\d+|-?\d+\/\d+|-?\d+,\d+)/g;
  let html='',last=0,m;
  while((m=regex.exec(s))){
   html+=escapeHTML(s.slice(last,m.index));
   html+=(svg(asTeX(m[0]))||fallback(m[0]));last=regex.lastIndex;
  }
  return html+escapeHTML(s.slice(last));
 }
 return {formula,inline,asTeX};
})();

