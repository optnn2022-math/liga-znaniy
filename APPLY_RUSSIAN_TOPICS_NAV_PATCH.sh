#!/usr/bin/env bash
set -euo pipefail

echo "=== Лига знаний: кнопка «К темам» → список тем русского языка ==="

if [ ! -d "russian" ]; then
  echo "ОШИБКА: папка russian не найдена. Запустите скрипт из корня liga-znaniy."
  exit 1
fi

python3 <<'PY'
from pathlib import Path
import os, re

root = Path("russian")
changed = []

for p in root.rglob("*.html"):
    if p == root / "index.html" or ".bak" in p.name:
        continue

    text = p.read_text(encoding="utf-8")
    old = text
    rel = Path(os.path.relpath(root / "index.html", p.parent)).as_posix()

    # Кнопки с id=homeBtn — именно такая кнопка используется в уроке 1.
    def home_repl(m):
        tag = m.group(0)
        tag = re.sub(r'''\s+onclick\s*=\s*(["']).*?\1''', "", tag, flags=re.I)
        return tag[:-1] + " onclick=\"location.href='" + rel + "'\">"

    text = re.sub(
        r'''<button\b(?=[^>]*\bid\s*=\s*["']homeBtn["'])[^>]*>''',
        home_repl, text, flags=re.I
    )

    # Прямые кнопки/ссылки «К темам» и «Темы».
    def nav_repl(m):
        tag, label = m.group(1), m.group(2)
        if re.search(r'''\bhref\s*='[^']*'|\bhref\s*="[^"]*"''', tag, flags=re.I):
            tag = re.sub(r'''\bhref\s*=\s*(["']).*?\1''',
                         'href="' + rel + '"', tag, count=1, flags=re.I)
        elif re.search(r'''\bonclick\s*='[^']*'|\bonclick\s*="[^"]*"''', tag, flags=re.I):
            tag = re.sub(r'''\bonclick\s*=\s*(["']).*?\1''',
                         "onclick=\"location.href='" + rel + "'\"",
                         tag, count=1, flags=re.I)
        else:
            tag = tag[:-1] + " onclick=\"location.href='" + rel + "'\">"
        return tag + label

    text = re.sub(
        r'''(<(?:button|a)\b[^>]*>)(\s*←?\s*(?:К\s+темам|Темы)\b)''',
        nav_repl, text, flags=re.I
    )

    if text != old:
        p.write_text(text, encoding="utf-8")
        changed.append((p.as_posix(), rel))

if changed:
    print("Исправлены:")
    for name, rel in changed:
        print(" ✓", name, "→", rel)
else:
    print("Изменений не потребовалось или кнопки не найдены.")

print("\nЦелевая страница: russian/index.html")
PY

echo
echo "=== Что изменилось ==="
git diff -- russian || true

echo
echo "Если diff верный, загрузите обновление:"
echo 'git add russian'
echo 'git commit -m "Fix Russian topics navigation"'
echo 'git push origin main'
