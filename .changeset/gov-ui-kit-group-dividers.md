---
"@aragon/gov-ui-kit": patch
---

`Dropdown.Group` renders its children directly without adding a wrapper div around each child, avoiding empty divider rows when a child renders nothing. It draws a neutral divider between its children that keeps its colour while a trigger is hovered or pressed.
