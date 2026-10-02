#!/usr/bin/env bash
set -euo pipefail

# Точечный патч: фон ТОЛЬКО для страницы русского диктанта.
# Не изменяет другие страницы, уроки, навигацию или механику сайта.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

TARGET="russian/dictation-01.html"
ASSET_DIR="russian/assets"
ASSET="$ASSET_DIR/dictation-bg.png"
SOURCE="${1:-dictation-bg.png}"

if [[ ! -f "$TARGET" ]]; then
  echo "ERROR: не найден $TARGET"
  exit 1
fi
if [[ ! -f "$SOURCE" ]]; then
  echo "ERROR: не найден файл изображения $SOURCE"
  echo "Запустите скрипт из папки, где рядом лежит dictation-bg.png,"
  echo "или передайте путь: bash APPLY_RUSSIAN_DICTATION_BG_PATCH.sh /путь/к/картинке.png"
  exit 1
fi

mkdir -p "$ASSET_DIR"
cp "$SOURCE" "$ASSET"

python3 - <<'PY'
from pathlib import Path
import re

p = Path('russian/dictation-01.html')
s = p.read_text(encoding='utf-8')

start = '/* LIGA_DICTATION_BG_START */'
end = '/* LIGA_DICTATION_BG_END */'
css = '''/* LIGA_DICTATION_BG_START */
<style id="liga-dictation-bg">
  html, body { min-height: 100%; }
  body {
    background-image: url("assets/dictation-bg.png") !important;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
  }
</style>
/* LIGA_DICTATION_BG_END */'''

# Повторный запуск безопасен: старый блок этого патча заменяется.
pat = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
if pat.search(s):
    s = pat.sub(css, s, count=1)
else:
    if '</head>' not in s:
        raise SystemExit('ERROR: в russian/dictation-01.html не найден </head>')
    s = s.replace('</head>', css + '\n</head>', 1)

p.write_text(s, encoding='utf-8')
print('OK: фон добавлен только в russian/dictation-01.html')
PY

echo
echo "Изменены только:"
echo "  $TARGET"
echo "  $ASSET"
echo
echo "Проверка точечных изменений:"
git status --short -- "$TARGET" "$ASSET"
echo
echo "Перед commit рекомендуется открыть страницу диктанта и проверить фон."
