#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"

echo "Replacing Russian lesson 01..."
rm -f russian/lesson-01.html
cp NEW_RUSSIAN_LESSON01/russian/lesson-01.html russian/lesson-01.html

echo "CHECK:"
grep -q 'b17582f472c0a8bb9cfec444b4385756' russian/lesson-01.html && echo "OK video"
grep -q '← Темы' russian/lesson-01.html && echo "OK navigation"
! grep -q 'v8DirectNav' russian/lesson-01.html && echo "OK duplicate navigation removed"
echo "READY"
