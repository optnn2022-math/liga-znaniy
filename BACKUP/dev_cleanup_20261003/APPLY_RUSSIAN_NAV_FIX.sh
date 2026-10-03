#!/usr/bin/env bash
set -e

FILE="russian/lessons/001/index.html"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("russian/lessons/001/index.html")
s = p.read_text(encoding="utf-8")

TARGET="../../index.html"

def fix_button(match):
    start = match.group(1)
    rest = match.group(2)

    start = re.sub(
        r'\s+onclick\s*=\s*(["\']).*?\1',
        '',
        start,
        flags=re.I | re.S
    )

    start += f' onclick="window.location.href=\'{TARGET}\'; return false;"'
    return start + rest

# Кнопка «К темам»
s, n1 = re.subn(
    r'(<button\b[^>]*)(>[\s\S]{0,100}?К\s*темам[\s\S]{0,50}?</button>)',
    fix_button,
    s,
    count=1,
    flags=re.I
)

# Кнопка «Завершить урок»
s, n2 = re.subn(
    r'(<button\b[^>]*)(>[\s\S]{0,150}?Завершить\s+урок[\s\S]{0,100}?</button>)',
    fix_button,
    s,
    count=1,
    flags=re.I
)

p.write_text(s, encoding="utf-8")

print("К темам:", "OK" if n1 else "НЕ НАЙДЕНА")
print("Завершить урок:", "OK" if n2 else "НЕ НАЙДЕНА")
PY

git diff -- "$FILE"
