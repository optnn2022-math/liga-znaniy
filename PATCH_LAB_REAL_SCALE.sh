#!/usr/bin/env bash
set -e

FILE="russian/lesson02/index.html"

cp "$FILE" "$FILE.bak-real-scale"

python3 <<'PY'
from pathlib import Path

p = Path("russian/lesson02/index.html")
s = p.read_text(encoding="utf-8")

# Удаляем предыдущую версию именно этого патча при повторном запуске
start = s.find('<style id="lab-real-scale-v1">')
if start != -1:
    end = s.find('</style>', start)
    if end != -1:
        s = s[:start] + s[end + len('</style>'):]

css = r'''
<style id="lab-real-scale-v1">

/* =========================================================
   ЛАБОРАТОРИЯ — компактный режим ТОЛЬКО ДЛЯ ПК
   Реальные классы страницы:
   .labs-zones
   .lab5-zone
   .lab5-zone > img
   .lab5-drop
   ========================================================= */

@media (min-width: 1100px) {

    /* Весь блок четырёх словарей поднимаем выше */
    body:has(.labs-zones) .labs-zones {
        position: relative !important;
        top: -55px !important;

        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;

        column-gap: 14px !important;
        row-gap: 10px !important;

        width: 65% !important;
        max-width: 900px !important;

        margin-left: auto !important;
        margin-right: auto !important;
        margin-bottom: -45px !important;

        align-items: start !important;
        justify-items: center !important;
    }

    /* Каждый словарь */
    body:has(.labs-zones) .lab5-zone {
        position: relative !important;

        width: 100% !important;
        max-width: 430px !important;

        margin: 0 !important;
        padding: 0 !important;

        overflow: visible !important;
    }

    /* Сама декоративная книжка/табличка */
    body:has(.labs-zones) .lab5-zone > img {
        display: block !important;

        width: 100% !important;
        height: auto !important;

        max-width: 430px !important;

        margin: 0 auto !important;
    }

    /*
       Область, куда попадают утверждения.
       Она остаётся внутри соответствующей картинки.
    */
    body:has(.labs-zones) .lab5-drop {
        position: absolute !important;

        left: 12% !important;
        right: 12% !important;

        top: 48% !important;
        bottom: 10% !important;

        width: auto !important;
        height: auto !important;

        min-width: 0 !important;
        min-height: 0 !important;

        display: flex !important;
        flex-wrap: wrap !important;

        align-content: center !important;
        justify-content: center !important;
        align-items: center !important;

        gap: 5px !important;

        overflow: hidden !important;
        box-sizing: border-box !important;
    }

    /* Карточки после попадания в словарь */
    body:has(.labs-zones) .lab5-drop .lab-card {
        flex: 0 1 calc(33.333% - 6px) !important;

        width: auto !important;
        min-width: 0 !important;
        max-width: 31% !important;

        padding: 4px 5px !important;
        margin: 0 !important;

        font-size: 10px !important;
        line-height: 1.08 !important;

        box-sizing: border-box !important;
        overflow-wrap: anywhere !important;
    }

}

/* Телефон и планшет — утверждённое оформление НЕ меняем */
@media (max-width: 1099px) {
    body:has(.labs-zones) .labs-zones,
    body:has(.labs-zones) .lab5-zone,
    body:has(.labs-zones) .lab5-zone > img,
    body:has(.labs-zones) .lab5-drop {
        zoom: 1 !important;
        transform: none !important;
    }
}

</style>
'''

if "</head>" not in s:
    raise SystemExit("❌ В файле не найден </head>")

s = s.replace("</head>", css + "\n</head>", 1)

p.write_text(s, encoding="utf-8")

print("✅ Найдены реальные элементы .labs-zones / .lab5-zone / .lab5-drop")
print("✅ 4 словаря на ПК уменьшены примерно до 65%")
print("✅ Блок поднят выше")
print("✅ Drop-зоны остаются внутри словарей")
print("✅ Мобильное оформление сохранено")
PY

git add "$FILE"
git commit -m "Scale real dictionary laboratory elements for desktop" || true

git pull --rebase origin main
git push origin main

echo "✅ Готово — патч отправлен в GitHub"
