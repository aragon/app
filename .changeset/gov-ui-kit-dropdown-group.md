---
"@aragon/gov-ui-kit": patch
---

`Dropdown.Group` renders its children directly: the wrapper it added around each child drew an empty divider row when a child rendered nothing.
