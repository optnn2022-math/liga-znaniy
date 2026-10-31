/* Проверка автономной HTML-версии 6.5 после синхронизации. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('ustny-schet/v6-5.html','utf8');
const source=fs.readFileSync('ustny-schet/topics/engine.js','utf8');
const lessons=fs.readFileSync('ustny-schet/topics/lessons.js','utf8');
for(const page of ['topics','plan']){
 const matched=html.match(new RegExp('<script type="text/plain" id="page-'+page+'">([^<]+)</script>'));
 assert.ok(matched,'Отсутствует автономная страница '+page);
 const embedded=Buffer.from(matched[1],'base64').toString('utf8');
 assert.ok(embedded.includes(source),'Встроенный генератор устарел: '+page);
 assert.ok(embedded.includes(lessons),'Встроенные уроки устарели: '+page);
 assert.ok(embedded.includes('case \'tens\': {'),'Тема десятков отсутствует: '+page);
 assert.ok(embedded.includes("const operation=pick(['+','−','×','÷','sequence']);"),'Операции отсутствуют: '+page);
}
assert.ok(html.includes('id="page-general"')&&html.includes('id="page-stats"'),'Пропали общий спринт или статистика');
console.log('Autonomous v6.5 verified: online engine and lessons match, 2 embedded pages available.');
