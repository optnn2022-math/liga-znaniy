from pathlib import Path
import re

RUS = Path("russian/index.html")
MAIN = Path("index.html")

if not RUS.exists():
    raise SystemExit("❌ Не найден russian/index.html")
if not MAIN.exists():
    raise SystemExit("❌ Не найден index.html")

rus = RUS.read_text(encoding="utf-8")
main = MAIN.read_text(encoding="utf-8")

# --------------------------------------------------
# 1. Проверяем исходное состояние
# --------------------------------------------------

old_002 = (
    '<button type="button" class="row russian-open-row" '
    'aria-disabled="false" onclick="location.href=\'lesson02/index.html\'">'
    '<span class="num">002</span>'
    '<span class="name">Лингвистика как наука о языке</span>'
    '<span class="goals">⚽ 0</span></button>'
)

if old_002 not in rus:
    raise SystemExit(
        "❌ Не найдена ожидаемая карточка 002. "
        "Патч остановлен, чтобы не повредить актуальную версию."
    )

# --------------------------------------------------
# 2. Сдвигаем номера ВСЕХ существующих тем 003+ на +2
#    Тесты 📝 не затрагиваются
# --------------------------------------------------

def shift_number(m):
    n = int(m.group(1))
    if n >= 3:
        return f'<span class="num">{n + 2:03d}</span>'
    return m.group(0)

rus = re.sub(
    r'<span class="num">(\d{3})</span>',
    shift_number,
    rus
)

# --------------------------------------------------
# 3. Исправляем 002 и добавляем новые 003 и 004
# --------------------------------------------------

new_topics = (
    '<button type="button" class="row russian-open-row" '
    'aria-disabled="false" onclick="location.href=\'lesson02/index.html\'">'
    '<span class="num">002</span>'
    '<span class="name">Роль языка в жизни человека и общества</span>'
    '<span class="goals">⚽ 0</span></button>'

    '<button type="button" class="row locked russian-row" aria-disabled="true">'
    '<span class="num">003</span>'
    '<span class="name">Лингвистика — наука о языке</span>'
    '<span class="goals">🔒</span></button>'

    '<button type="button" class="row locked russian-row" aria-disabled="true">'
    '<span class="num">004</span>'
    '<span class="name">Состав слова</span>'
    '<span class="goals">🔒</span></button>'
)

# После перенумерации старая карточка 002 не изменилась
rus = rus.replace(old_002, new_topics, 1)

# --------------------------------------------------
# 4. Обновляем количество тем внутри русского языка
# --------------------------------------------------

rus, count_rus = re.subn(
    r'157 тем · 12 смысловых блоков',
    '159 тем · 12 смысловых блоков',
    rus,
    count=1
)

if count_rus != 1:
    raise SystemExit(
        "❌ Не удалось обновить счётчик тем на странице русского языка."
    )

# --------------------------------------------------
# 5. Обновляем количество тем на ГЛАВНОЙ странице
#    Меняем только карточку русского языка
# --------------------------------------------------

old_main = 'Русский язык<small>План курса · 157 тем</small>'
new_main = 'Русский язык<small>План курса · 159 тем</small>'

if old_main not in main:
    raise SystemExit(
        "❌ Не найден счётчик 157 тем на главной странице."
    )

main = main.replace(old_main, new_main, 1)

# --------------------------------------------------
# 6. Контрольные проверки
# --------------------------------------------------

nums = [
    int(x)
    for x in re.findall(r'<span class="num">(\d{3})</span>', rus)
]

if 3 not in nums or 4 not in nums:
    raise SystemExit("❌ Новые темы 003/004 не появились.")

if "Лингвистика — наука о языке" not in rus:
    raise SystemExit("❌ Тема 003 не добавлена.")

if "Состав слова" not in rus:
    raise SystemExit("❌ Тема 004 не добавлена.")

if "План курса · 159 тем" not in main:
    raise SystemExit("❌ Главная страница не обновлена.")

# --------------------------------------------------
# 7. Сохраняем
# --------------------------------------------------

RUS.write_text(rus, encoding="utf-8")
MAIN.write_text(main, encoding="utf-8")

print("✅ Перечень русского языка обновлён")
print("✅ 002 — Роль языка в жизни человека и общества")
print("✅ 003 — Лингвистика — наука о языке")
print("✅ 004 — Состав слова")
print("✅ Все прежние темы 003+ сдвинуты на +2")
print("✅ Итоговое количество: 159 тем")
print("✅ Главная страница: 159 тем")
print("✅ Тесты 📝 не перенумерованы")
