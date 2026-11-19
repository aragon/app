---
"@aragon/gov-ui-kit": patch
---

Move every component's colours to the semantic colour classes (410 classes in 74 files, mapped in `design-system/tokens/semantic-colors.component-map.json`); the default theme looks exactly as before, while the `next` and `dark` themes now reach most components. Classes the design tokens do not cover yet stay on the primitive palette. Two Button fixes from the Button conversion: a ghost button hovers to white again (code-only token `bg-surface-ghost-hover`) instead of `neutral-50`, and an open Dropdown trigger shows its `neutral-300` border again (code-only token `border-surface-open`), on tertiary and critical triggers only as before. A secondary button's label still turns `primary-600` while pressed.
