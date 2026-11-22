---
"@aragon/gov-ui-kit": minor
---

Fix what the review of the spacing previews found: a density-invariant `gap-phrase` role (with `gap-phrase--fixed-2`, `--fixed-6` and `--4-6`) for text fragments of one phrase laid out as flex children (value and unit, voting status and progress labels), whose rows now wrap like text; `control-item` and `control-item-flat` sizes for the block padding of item-shaped controls (menu items, accordion headers, data list action rows, choice cards); the compact coarse-pointer fallback now covers every control block dimension and the generator fails when one escapes; looser keeps New's phone x insets, the aside cards' x inset and a few density-invariant exceptions (definition list and accordion header gaps, the voting progress row) so it never wraps a label that fits in New. Nothing renders differently.
