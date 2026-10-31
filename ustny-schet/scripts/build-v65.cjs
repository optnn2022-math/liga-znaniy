/* Создаёт автономный v6-5.html из 6.4, сохраняя утверждённую версию. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const versionPath=path.join(root,'ustny-schet/v6-4.html');
const outputPath=path.join(root,'ustny-schet/v6-5.html');
const engine='ustny-schet/topics/engine.js',lessons='ustny-schet/topics/lessons.js';
const adaptive='ustny-schet/topics/adaptive.js';
const definitions={
 topics:[
  {marker:'root.MathTrainer={topics,groups,make,check,parseRational};',files:[engine]},
  {marker:'window.LigaLessons={lessons,has:',files:[lessons]},
  {marker:'root.LigaAdaptive=',files:[adaptive,'ustny-schet/topics/app.js']}
 ],
 plan:[
  {marker:'root.MathTrainer={topics,groups,make,check,parseRational};',files:[engine]},
  {marker:'window.LigaLessons={lessons,has:',files:[lessons]},
  {marker:'root.LigaAdaptive=',files:[adaptive,'ustny-schet/plan.js']}
 ]
};
function syncPage(decoded,entries){
 const hits=new Map(entries.map(e=>[e.marker,0]));
 const updated=decoded.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,(full,open,body,close)=>{
  const matches=entries.filter(e=>body.includes(e.marker));
  if(matches.length===0)return full;
  if(matches.length!==1)throw Error('Ambiguous inline script: '+matches.map(x=>x.marker).join(','));
  const match=matches[0];
  hits.set(match.marker,hits.get(match.marker)+1);
  const source=match.files.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n\n');
  return open+'\n'+source+'\n'+close;
 });
 for(const entry of entries){
  if(hits.get(entry.marker)!==1)throw Error('Inline script not found exactly once: '+entry.marker);
 }
 return updated;
}
function syncOffline(){
 let html=fs.readFileSync(versionPath,'utf8');
 for(const [page,entries] of Object.entries(definitions)){
  const pattern=new RegExp('(<script type="text/plain" id="page-'+page+'">)([^<]+)(<\\/script>)');
  const match=html.match(pattern);
  if(!match)throw Error('Embedded page not found: '+page);
  const embedded=Buffer.from(match[2],'base64').toString('utf8');
  const synced=syncPage(embedded,entries);
  html=html.replace(pattern,(_all,open,_payload,close)=>open+Buffer.from(synced,'utf8').toString('base64')+close);
 }
 html=html.replace(/v6-4\.html/g,'v6-5.html').replace(/6\.4/g,'6.5');
 fs.writeFileSync(outputPath,html,'utf8');
 console.log('Offline Android HTML 6.5 created: '+Buffer.byteLength(html)+' bytes');
}
if(require.main===module)syncOffline();
module.exports={syncPage,syncOffline};
