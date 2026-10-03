#!/usr/bin/env bash
set -e

FILE="russian/lesson02/index.html"

if [ ! -f "$FILE" ]; then
  echo "❌ Не найден $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak-desktop-scale"

python3 - <<'PY'
from pathlib import Path

p = Path("russian/lesson02/index.html")
s = p.read_text(encoding="utf-8")

MARKER = "/* LAB_DESKTOP_COMPACT_V1 */"

if MARKER in s:
    print("ℹ️ Desktop-патч уже установлен.")
    raise SystemExit(0)

css = r'''
<style>
/* LAB_DESKTOP_COMPACT_V1
   Компактный режим ТОЛЬКО для ПК.
   Мобильное оформление лаборатории не изменяется.
*/
@media (min-width: 1100px) {

  /*
   Масштабируем содержимое лаборатории целиком,
   сохраняя утвержденные пропорции и расположение.
   Фон страницы при этом остается полноэкранным.
  */

  body.lab-page main,
  body.lab-page .lesson-main,
  body.lab-page .lesson-content,
  body.lab-page .lab-page,
  body.lab-page .lab-content {
    zoom: 0.50;
  }

  /*
   Если в текущей версии body не имеет lab-page,
   применяем масштаб непосредственно на странице урока 2.
  */
  body:has(.dictionary-lab) .dictionary-lab,
  body:has(.dictionary-laboratory) .dictionary-laboratory,
  body:has(.lab-stage) .lab-stage {
    zoom: 0.50;
  }

  /*
   Фон не должен уменьшаться вместе с интерфейсом.
  */
  html,
  body {
    min-height: 100%;
    background-size: cover !important;
    background-position: center top !important;
    background-attachment: fixed;
  }
}

/*
 На телефоне и планшете сохраняем существующее оформление.
*/
@media (max-width: 1099px) {
  body.lab-page main,
  body.lab-page .lesson-main,
  body.lab-page .lesson-content,
  body.lab-page .lab-page,
  body.lab-page .lab-content,
  body:has(.dictionary-lab) .dictionary-lab,
  body:has(.dictionary-laboratory) .dictionary-laboratory,
  body:has(.lab-stage) .lab-stage {
    zoom: 1;
  }
}
</style>
'''

if "</head>" not in s:
    raise SystemExit("❌ В HTML не найден </head>")

s = s.replace("</head>", css + "\n</head>", 1)
p.write_text(s, encoding="utf-8")

print("✅ Добавлен desktop-режим лаборатории 65%")
print("✅ Мобильная версия не изменена")
print("✅ Создана резервная копия index.html.bak-desktop-scale")
PY

git add russian/lesson02/index.html
git commit -m "Optimize dictionary laboratory for desktop"
git pull --rebase origin main
git push origin main

echo ""
echo "✅ Патч установлен и отправлен в GitHub."
