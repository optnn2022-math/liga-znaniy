Liga Znaniy — FINAL Math Lesson 6 patch

Fixes:
1. Restores the main stadium/site background in lesson 6 and on the mini-test screen (WEBP path after optimization).
2. Removes the brief main/landing-page flash when returning to Math topics: topics are visible immediately.
3. Keeps direct navigation from "Завершить урок" to Math topics via location.replace().
4. Corrects lesson 6 goals: 6 interactive practice tasks = max 6 goals; mini-test = max 7 goals; total = 13.
   The first "find all divisors of 30" task now gives ONE goal after the whole task is completed, not one goal per divisor.
5. Saves the BEST lesson result (0..13). Repeating the lesson cannot reduce the saved result.
6. Adds modular lesson 6 goals to global stars when shared/js/global-stars-v818.js is present.

Install from repository root:
unzip -o Liga_Znaniy_MATH_LESSON06_FINAL_PATCH.zip
bash APPLY_MATH_LESSON06_FINAL_PATCH.sh
bash UPDATE_SITE.sh

Backups are created automatically with suffix .bak-l06-final.
