ПАТЧ: КНОПКА «К ТЕМАМ» — РУССКИЙ ЯЗЫК

Что делает:
• на страницах внутри каталога russian исправляет кнопку «К темам»;
• возврат всегда ведёт на страницу списка тем русского языка russian/index.html;
• учитывает вложенность страниц russian/lessons/...;
• не заменяет уроки старыми резервными копиями;
• не меняет russian/index.html;
• не трогает *.bak*.

Как применить из корня репозитория liga-znaniy:

unzip -o RUSSIAN_TOPICS_NAV_PATCH.zip
chmod +x APPLY_RUSSIAN_TOPICS_NAV_PATCH.sh
./APPLY_RUSSIAN_TOPICS_NAV_PATCH.sh

Сначала скрипт покажет git diff.

После проверки:
git add russian
git commit -m "Fix Russian topics navigation"
git push origin main
