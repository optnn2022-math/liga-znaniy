from pathlib import Path
import re

p = Path("russian/lesson-01.html")
s = p.read_text(encoding="utf-8")

VIDEO = "https://rutube.ru/play/embed/16cbc702d77c6ec26aea0e403b23470f"

iframe = f'''<iframe
  src="{VIDEO}"
  title="Русский язык. 5 класс. Урок 1. Богатство и выразительность русского языка"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen>
</iframe>'''

# Ищем видеоблок этапа «Разминка».
# Сначала заменяем существующий iframe, если он там есть.
warmup = re.search(
    r'(<section[^>]*>.*?ЭТАП\s*2.*?)(</section>)',
    s,
    flags=re.I | re.S
)

if not warmup:
    raise SystemExit("ERROR: блок ЭТАП 2 не найден")

block = warmup.group(1)

if re.search(r'<iframe\b.*?</iframe>', block, flags=re.I | re.S):
    block2 = re.sub(
        r'<iframe\b.*?</iframe>',
        iframe,
        block,
        count=1,
        flags=re.I | re.S
    )
else:
    # Находим пустую область видео перед блоком
    # «На что обратить внимание».
    marker = re.search(
        r'(<[^>]+[^>]*(?:video|media)[^>]*>)(.*?)(</[^>]+>)',
        block,
        flags=re.I | re.S
    )

    if marker:
        block2 = (
            block[:marker.start()]
            + marker.group(1)
            + iframe
            + marker.group(3)
            + block[marker.end():]
        )
    else:
        # Резервный вариант: вставляем iframe непосредственно
        # перед текстом «На что обратить внимание».
        pos = block.find("На что обратить внимание")
        if pos == -1:
            raise SystemExit("ERROR: видеоконтейнер не найден")

        block2 = block[:pos] + iframe + "\n" + block[pos:]

s = s[:warmup.start(1)] + block2 + s[warmup.end(1):]

p.write_text(s, encoding="utf-8")

print("OK: Russian lesson 01 video installed")
print("VIDEO:", VIDEO)
