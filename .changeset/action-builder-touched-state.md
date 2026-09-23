---
"@aragon/app": patch
---

Stop a removed or reordered proposal action from passing its validation state on to the action that takes its place in the action builder: re-adding an action after removing one that had shown an error no longer shows that error straight away, and moving actions no longer makes an untouched action validate before it has been edited.
