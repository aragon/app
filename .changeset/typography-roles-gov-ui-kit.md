---
"@aragon/gov-ui-kit": minor
---

Components take their typography from role classes: `type-<role>` for 15 roles (`type-title-page`, `type-supporting`, `type-control`, …), `type-<role>--<pattern>` exceptions for places that keep their own size, and the modifiers `type-strong`, `type-mono` and `type-numeric`. A role sets font size, line height, weight, family and letter spacing, so text in a component no longer inherits a size or weight from its parent where it did before. A raw `text-*`, `leading-*`, `font-*` or `tracking-*` class passed through `className` now wins over the component's role at every width, above `md` too. `Heading` takes `typeClassName`, a role class that replaces the one `size` picks.
