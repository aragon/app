---
"@aragon/gov-ui-kit": minor
---

Finish the spacing conversion of the kit: a `gap-section-stepped` role (24 → 40 at md) for sections that space out on desktop, `mx`/`my` margin utilities for the gap roles, the markdown `prose` margins and code chip on roles, and the remaining raw paddings of the data list, dialog, transaction detail, voting progress, wallet and DAO list item on roles or exceptions. `InputContainer` (and the inputs built on it) gains a `spacing` prop (`default` | `related`) for containers whose label-to-field gap is 12 px at every width. Text-line paddings that New sets to zero now sit as margins of the same size, so the space they gave is kept. Adds the `lint:spacing:*` scripts and the generated Biome plugins that flag raw spacing classes. Nothing renders differently.
