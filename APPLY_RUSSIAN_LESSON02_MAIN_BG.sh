#!/usr/bin/env bash
set -e

FILE="russian/lesson02/index.html"
BACKUP="${FILE}.bak-main-bg"

cp "$FILE" "$BACKUP"

python3 - <<'PY'
from pathlib import Path

p = Path("russian/lesson02/index.html")
s = p.read_text(encoding="utf-8")

css = r'''
<style id="lesson02-main-site-background">

/* =========================================================
   ОСНОВНОЙ ФОН ЛИГИ ЗНАНИЙ
   Для всех обычных страниц урока 2.
   Словарная лаборатория сохраняет собственное оформление.
   ========================================================= */

/* Обычные этапы урока */
body:not(:has(.dictionary-lab)):not(:has(.dictionary-laboratory)):not(:has(.lab-stage)) {
    background:
        linear-gradient(rgba(3, 35, 72, 0.28), rgba(3, 35, 72, 0.42)),
        url("../assets/images/background_or_ui_01_61776296.png")
        center center / cover fixed no-repeat !important;

    min-height: 100vh !important;
}

/* Основные контейнеры не должны закрывать фон сплошной заливкой */
body:not(:has(.dictionary-lab)):not(:has(.dictionary-laboratory)):not(:has(.lab-stage)) .lesson-page,
body:not(:has(.dictionary-lab)):not(:has(.dictionary-laboratory)):not(:has(.lab-stage)) .lesson-main,
body:not(:has(.dictionary-lab)):not(:has(.dictionary-laboratory)):not(:has(.lab-stage)) .lesson-content {
    background-color: transparent !important;
}

/* ЛАБОРАТОРИЮ НЕ МЕНЯЕМ */
body:has(.dictionary-lab),
body:has(.dictionary-laboratory),
body:has(.lab-stage) {
    /* сохраняется её существующий фон */
}

</style>
'''

# Не добавляем патч повторно
marker = 'id="lesson02-main-site-background"'

if marker in s:
    print("ℹ️ Патч фона уже присутствует — повторно не добавляем.")
else:
    if "</head>" not in s:
        raise SystemExit("❌ В index.html не найден </head>")

    s = s.replace("</head>", css + "\n</head>", 1)
    p.write_text(s, encoding="utf-8")
    print("✅ Основной фон добавлен на обычные страницы урока 2")
    print("✅ Словарная лаборатория исключена из изменения")

PY

git add "$FILE"
git commit -m "Add main site background to Russian lesson 2 pages" || true
git pull --rebase origin main
git push origin main

echo ""
echo "✅ ГОТОВО"
echo "• Основной фон добавлен на обычные страницы урока 2"
echo "• Словарная лаборатория не изменена"
echo "• Механика этапа 4 не изменена"
echo "• Мобильная версия не перестраивалась"
echo "• Резервная копия: $BACKUP"
