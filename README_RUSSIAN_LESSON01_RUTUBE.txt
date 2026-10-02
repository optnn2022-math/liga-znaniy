Liga Znaniy — Russian Lesson 01 video patch

Purpose:
- replace the video source in russian/lesson-01.html
- use the verified RUTUBE lesson:
  "Русский язык. 5 класс. Урок 1. Богатство и выразительность русского языка"
- keep the rest of the lesson unchanged

Run:
  unzip -o Liga_Znaniy_RUSSIAN_LESSON01_RUTUBE_PATCH.zip
  bash APPLY_RUSSIAN_LESSON01_RUTUBE.sh

Then:
  git add russian/lesson-01.html
  git commit -m "Fix Russian lesson 01 Rutube video"
  git push origin main
