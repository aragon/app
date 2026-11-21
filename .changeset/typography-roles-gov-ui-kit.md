---
"@aragon/gov-ui-kit": minor
---

Add a semantic typography layer: `type-*` utilities for 15 typography roles (display, title-page … title-item, body, body-compact, supporting, caption, label, label-option, control, control-sm, stat, tooltip), documented `type-<role>--<pattern>` exceptions that keep today's rendering of places that differ from their role, and the modifiers `type-strong`, `type-mono` and `type-numeric`, generated from DTCG typography tokens into `src/theme/tokens/typography.css`. Every component now uses them; nothing renders differently. `Heading` gains a `typeRole` prop (styling through `size` is deprecated, `size` still picks the element). A Next typography preview (`data-typography="next"`: Sora and Inter Display, which the consumer loads) is keyed off its own attribute.
