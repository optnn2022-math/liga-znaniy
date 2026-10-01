#!/usr/bin/env bash
set -e

cd /workspaces/liga-znaniy

# Не отправляем ZIP-архивы в GitHub (они могут превышать лимит GitHub).
find . -maxdepth 1 -type f -iname "*.zip" -print0 | xargs -0 -r rm -f

git add -A

if git diff --cached --quiet; then
  echo "Нет изменений для публикации."
  exit 0
fi

git commit -m "Update Liga Znaniy"
git push origin main

echo
echo "Готово: изменения отправлены в GitHub. GitHub Pages обновится автоматически."
