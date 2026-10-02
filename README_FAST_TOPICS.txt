Liga Znaniy — Math fast topics patch
Fixes the ~5 second blue screen when returning from lessons 1/6 to Math topics.
Cause: math/index.html hid the body and waited for window.load (all images/media) before rendering topics.
Patch: render topics at DOMContentLoaded and do not hide the whole body while media loads.
Does not change lessons, scores, navigation structure, or visual design.
