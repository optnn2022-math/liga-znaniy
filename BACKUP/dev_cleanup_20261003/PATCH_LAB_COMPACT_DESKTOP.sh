#!/usr/bin/env bash
set -e

FILE="russian/lesson02/index.html"
BACKUP="${FILE}.bak-compact-desktop"

cp "$FILE" "$BACKUP"

python3 - <<'PY'
from pathlib import Path

p = Path("russian/lesson02/index.html")
s = p.read_text(encoding="utf-8")

css = r'''
<style id="lab-compact-desktop-v2">

/* Только ПК */
@media (min-width: 1100px) {

  /*
   * Компактная версия словарной лаборатории.
   * Уменьшаем именно визуальные словари/книжки,
   * не изменяя мобильную версию.
   */

  body:has(.dictionary-lab) .dictionary-lab img,
  body:has(.dictionary-laboratory) .dictionary-laboratory img,
  body:has(.lab-stage) .lab-stage img {
      max-width: 65%;
      height: auto;
  }

  /*
   * Четыре области словарей.
   * Сохраняем их места в сетке, но уменьшаем
   * декоративную часть примерно на 35%.
   */
  body:has(.dictionary-lab) .dictionary-dropzone,
  body:has(.dictionary-lab) .dictionary-zone,
  body:has(.dictionary-laboratory) .dictionary-dropzone,
  body:has(.dictionary-laboratory) .dictionary-zone,
  body:has(.lab-stage) .dictionary-dropzone,
  body:has(.lab-stage) .dictionary-zone {
      transform: scale(0.65);
      transform-origin: center top;
  }

  /*
   * Поднимаем всю рабочую часть лаборатории выше.
   */
  body:has(.dictionary-lab) .dictionary-lab,
  body:has(.dictionary-laboratory) .dictionary-laboratory,
  body:has(.lab-stage) .lab-stage {
      position: relative;
      top: -70px;
  }

  /*
   * Убираем лишнее вертикальное пространство,
   * появившееся после уменьшения.
   */
  body:has(.dictionary-lab) .dictionary-grid,
  body:has(.dictionary-laboratory) .dictionary-grid,
  body:has(.lab-stage) .dictionary-grid {
      margin-top: -35px;
      row-gap: 4px;
  }
}

</style>
'''

# Чтобы повторный запуск патча не добавлял CSS второй раз
start = s.find('<style id="lab-compact-desktop-v2">')
if start != -1:
    end = s.find('</style>', start)
    if end != -1:
        s = s[:start] + s[end + len('</style>'):]

if "</head>" not in s:
    raise SystemExit("❌ В HTML не найден </head>")

s = s.replace("</head>", css + "\n</head>", 1)
p.write_text(s, encoding="utf-8")

print("✅ Таблички и книжки уменьшены на 35%")
print("✅ Рабочая композиция поднята выше")
print("✅ Мобильная версия не изменена")
PY

git add "$FILE"
git commit -m "Compact dictionary laboratory decorations and move layout up" || true
git pull --rebase origin main
git push origin main

echo "✅ Патч применён и отправлен в GitHub"
echo "↩ Резервная копия: $BACKUP"
