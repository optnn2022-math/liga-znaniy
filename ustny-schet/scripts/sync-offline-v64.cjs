/* Sync the self-contained Android HTML with the verified v6.4 sources. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const versionPath=path.join(root,'ustny-schet/v6-4.html');
const definitions={
 topics:[
  {file:'ustny-schet/topics/adaptive.js',marker:'root.LigaAdaptive='},
  {file:'ustny-schet/topics/app.js',marker:'const {topics,groups,make}=window.MathTrainer;'}
 ],
 plan:[
  {file:'ustny-schet/topics/adaptive.js',marker:'root.LigaAdaptive='},
  {file:'ustny-schet/plan.js',marker:"const STORAGE='liga_math_daily_plan_v1'"}
 ]
};
function syncPage(decoded,entries){
 const hits=new Map(entries.map(e=>[e.file,0]));
 const updated=decoded.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,(full,open,body,close)=>{
  const match=entries.find(e=>body.includes(e.marker));
  if(!match)return full;
  hits.set(match.file,hits.get(match.file)+1);
  return open+'\n'+fs.readFileSync(path.join(root,match.file),'utf8')+'\n'+close;
 });
 for(const entry of entries){
  if(hits.get(entry.file)!==1)throw Error('Embedded script not found exactly once: '+entry.file+' ('+hits.get(entry.file)+')');
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
 fs.writeFileSync(versionPath,html,'utf8');
 console.log('Offline Android HTML synchronized: '+Buffer.byteLength(html)+' bytes');
}
if(require.main===module)syncOffline();
module.exports={syncPage,syncOffline};
