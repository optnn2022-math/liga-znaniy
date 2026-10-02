#!/usr/bin/env bash
set -e
git add russian/index.html
git commit -m "Restore Russian written works card layout" || true
git push origin main
echo "Готово. GitHub Pages обновится автоматически."
