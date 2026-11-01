/* Регрессия автономной HTML и Android-версии 6.9. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('ustny-schet/v6-9.html','utf8');
const source=fs.readFileSync('ustny-schet/topics/engine.js','utf8');
const lessons=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
const adaptive=fs.readFileSync('ustny-schet/topics/adaptive.js','utf8');
for(const page of ['topics','plan']){
 const matched=html.match(new RegExp('<script type="text/plain" id="page-'+page+'">([^<]+)</script>'));
 assert.ok(matched,'Нет автономной страницы: '+page);
 const embedded=Buffer.from(matched[1],'base64').toString('utf8');
 for(const [name,code] of [['engine',source],['lessons',lessons],['adaptive',adaptive]])assert.ok(embedded.includes(code),'В автономной версии не обновлён '+name+': '+page);
 assert.ok(embedded.includes("case 'composition': {"),'Нет счёта до 10: '+page);
 assert.ok(embedded.includes("const operation=pick(['+','−']);"),'В счёте десятками остались лишние операции: '+page);
 assert.ok(embedded.includes("case 'multiply': {")&&embedded.includes("case 'divide': {"),'Пропали темы таблиц: '+page);
 assert.ok(embedded.includes("case 'multiply_round': {")&&embedded.includes("case 'divide_round': {"),'Нет отдельных тем круглых чисел: '+page);
 assert.ok(embedded.includes("roundScheme:69"),'Нет версии уровней умножения: '+page);
 assert.ok(embedded.includes("a=rnd(3,7);b=rnd(1,a-1)"),'Нет базовых пропусков: '+page);
 if(page==='topics')assert.ok(embedded.includes('const compositionSamples'),'Нет примеров по уровню сложности');
}
assert.ok(html.includes('id="page-stats"')&&html.includes('id="page-general"'),'Не хватает статистики или спринта');
console.log('Offline 6.9 verified: online and APK generators/lessons/adaptive modules agree.');
