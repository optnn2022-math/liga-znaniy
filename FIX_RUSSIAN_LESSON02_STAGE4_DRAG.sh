#!/usr/bin/env bash
set -e

FILE="russian/lesson02/index.html"

if [ ! -f "$FILE" ]; then
  echo "❌ Не найден $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak-stage4-drag"

python3 - <<'PY'
from pathlib import Path

p = Path("russian/lesson02/index.html")
s = p.read_text(encoding="utf-8")

MARK = "STAGE4_DRAG_FIX_V1"

# Повторный запуск не дублирует исправление
if MARK in s:
    print("ℹ️ Исправление уже присутствует.")
    raise SystemExit(0)

patch = r'''
<script id="stage4-drag-fix-v1">
/* STAGE4_DRAG_FIX_V1
   Исправление перетаскивания ТОЛЬКО:
   Этап 4 -> Задание 2.
*/
(function () {
  'use strict';

  const bank = document.getElementById('labBank');
  const activity = document.getElementById('sortActivity');

  if (!bank || !activity) return;

  const zones = Array.from(activity.querySelectorAll('.zone[data-zone]'));
  const cards = Array.from(bank.querySelectorAll('.chip[data-kind]'));

  if (!zones.length || !cards.length) return;

  let dragged = null;
  let selected = null;

  function clearSelected() {
    cards.forEach(card => {
      card.classList.remove('stage4-selected');
      card.style.outline = '';
    });
    selected = null;
  }

  function selectCard(card) {
    clearSelected();
    selected = card;
    card.classList.add('stage4-selected');
    card.style.outline = '3px solid #ffd34e';
  }

  function moveCard(card, target) {
    if (!card || !target) return;

    target.appendChild(card);

    card.setAttribute('draggable', 'true');
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.transform = '';
    card.style.zIndex = '';

    clearSelected();
  }

  /* ---------- ПК: HTML5 drag & drop ---------- */

  cards.forEach(card => {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function (e) {
      dragged = card;

      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.kind || 'card');
      } catch (_) {}

      card.classList.add('stage4-dragging');
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('stage4-dragging');
      dragged = null;
    });

    /*
      Дополнительная механика:
      клик по карточке -> клик по зоне.
      Работает и как запасной вариант на ПК.
    */
    card.addEventListener('click', function (e) {
      e.stopPropagation();

      if (selected === card) {
        clearSelected();
      } else {
        selectCard(card);
      }
    });
  });

  zones.forEach(zone => {

    zone.addEventListener('dragenter', function (e) {
      e.preventDefault();
      zone.classList.add('stage4-drag-over');
    });

    zone.addEventListener('dragover', function (e) {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      zone.classList.add('stage4-drag-over');
    });

    zone.addEventListener('dragleave', function (e) {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('stage4-drag-over');
      }
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();

      zone.classList.remove('stage4-drag-over');

      if (dragged) {
        moveCard(dragged, zone);
        dragged = null;
      }
    });

    /* Телефон + резерв для ПК */
    zone.addEventListener('click', function () {
      if (selected) {
        moveCard(selected, zone);
      }
    });
  });

  /* ---------- Кнопка "Вернуть" ---------- */

  const reset = document.getElementById('resetSort');

  if (reset) {
    reset.addEventListener('click', function () {
      cards.forEach(card => bank.appendChild(card));
      clearSelected();
    });
  }

  console.log('✅ STAGE4_DRAG_FIX_V1 active');
})();
</script>

<style id="stage4-drag-fix-style-v1">
/* Только визуальная обратная связь для задания 2 */

#sortActivity .chip {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

#sortActivity .chip:active {
  cursor: grabbing;
}

#sortActivity .stage4-dragging {
  opacity: .55;
}

#sortActivity .zone {
  transition: outline .12s ease, background-color .12s ease;
}

#sortActivity .zone.stage4-drag-over {
  outline: 3px solid #ffd34e !important;
  outline-offset: 3px;
}

#sortActivity .stage4-selected {
  outline: 3px solid #ffd34e !important;
}
</style>
'''

if "</body>" not in s:
    raise SystemExit("❌ В index.html не найден </body>")

s = s.replace("</body>", patch + "\n</body>", 1)

p.write_text(s, encoding="utf-8")

print("✅ Исправлена механика этапа 4 / задания 2")
print("✅ Drag & Drop для ПК")
print("✅ Клик карточка → зона сохранён для телефона")
print("✅ Лаборатория не изменена")
PY

git add "$FILE"
git commit -m "Fix Russian lesson 2 stage 4 drag and drop" || true

git pull --rebase origin main
git push origin main

echo ""
echo "✅ Готово. Исправление отправлено в GitHub."
echo "Резервная копия: $FILE.bak-stage4-drag"
