Patch based on VIDEO_EXAMPLE.zip.

I checked the working lessons in the supplied math archive.
Working RUTUBE embeds use:
  https://rutube.ru/play/embed/<VIDEO_ID>/
with iframe permissions including autoplay/fullscreen.

This patch normalizes ONLY the video iframe in:
  russian/lesson-01.html

Run:
  unzip -o Liga_Znaniy_RUSSIAN_LESSON01_WORKING_VIDEO_PATTERN_PATCH.zip
  bash APPLY_RUSSIAN_LESSON01_WORKING_VIDEO_PATTERN.sh

Then:
  git add russian/lesson-01.html
  git commit -m "Embed Russian lesson 01 video using working site pattern"
  git push origin main
