---
type: pattern
title: Normalize input without changing its meaning
tags: [design, interaction, forms, validation]
status: draft
source: app interaction-principles inventory against app@122f1bd1 + product-owner review (2026-08-05, see log.md)
---

# Normalize input without changing its meaning

Input normalization converts an entered value to a consistent form without changing what the person meant. Use it when the product can prove that two representations mean the same thing. If a change could alter the value's meaning, preserve the input and validate it instead.

The aim is to remove work that has no value. A person should not have to repair harmless formatting that the product understands, and the product must not guess when the intended value is uncertain.

## Normalize by meaning, not by widget

Choose normalization from the field's product meaning. Two text inputs may need different treatment even when they use the same component.

| Input | Treatment | Reason |
| --- | --- | --- |
| A name, title, summary, or plain-text description | Remove surrounding whitespace and apply the field's documented plain-text cleanup. | Surrounding whitespace does not normally change the intended prose. |
| A valid account or contract address | Convert it to the validated checksum form through the shared [address input](./address-input.md). | The checksum form represents the same address and makes mistyped mixed case detectable. |
| A URL, identifier, amount, calldata value, or other structured value | Preserve it unless that field defines a proven equivalent form. Reject or explain an invalid value instead of guessing. | Characters, case, separators, or precision may change the result. |
| Rich content rendered in the app | Apply the rendering safety boundary separately. | Removing unsafe markup is sanitization, not proof that two entered values mean the same thing. |

Normalization does not make an invalid value valid. It may remove irrelevant differences before validation, but [an unsatisfiable value is still refused](./invariant-validation.md), and an ambiguous value still needs the person's decision.

## Use one visible boundary

Apply a field's normalization through one shared rule wherever that semantic field appears. Run it when the person finishes editing, before the value is validated for the next step or stored, and show the normalized value back in the field. Do not make the result depend on an unrelated option that a caller must also remember to enable.

For example, a proposal title with accidental surrounding spaces becomes the same title without those spaces when the person leaves the field. A URL whose path might change meaning stays as entered and receives a validation message if the product cannot use it.

The field declaration owns the decision: what may change, when it changes, and which canonical form results. Individual forms reuse that rule rather than rebuilding it from combinations of low-level trimming and sanitizing flags.
