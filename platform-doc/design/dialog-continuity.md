---
type: pattern
title: Preserve task context across dialogs
tags: [design, interaction, dialogs]
status: draft
source: app interaction-principles inventory against app@122f1bd1 + product-owner review (2026-08-05, see log.md)
---

# Preserve task context across dialogs

A dialog that opens another decision preserves the person's task when that decision belongs to the task. An unrelated prompt waits its turn. Opening a dialog must not silently discard work or replace a separate prompt by accident.

## Stack, replace, or queue deliberately

| Relationship | Treatment | Result |
| --- | --- | --- |
| The new dialog answers a smaller question for the current task. | Stack it over the parent. | Closing the child returns to the parent with its state intact. |
| The new dialog completes or supersedes the current dialog. | Replace the current dialog. | The previous dialog is no longer a valid place to return. |
| The new dialog is an independent prompt or interruption. | Queue it at the layer that coordinates the prompts. | One prompt finishes before the next appears; call order does not decide which one is lost. |

For example, selecting an asset from a transfer form is a child decision. The asset selector opens over the form, and choosing an asset returns the person to the same form. A retry warning during transaction submission belongs to the active transaction, so it preserves the [transaction dialog](./transaction-submission.md) underneath it.

Two onboarding prompts are different. Neither is a child of the other, so they need an explicit priority and sequence. They must not rely on both callers opening independently and whichever call runs last replacing the first.

## Preserve more than visibility

Returning to a parent restores its entered values, selected options, validation state, scroll position when material, and useful focus. A child result updates only the part of the parent that requested it. If the new decision invalidates the parent instead, the flow closes or replaces the parent explicitly and explains the resulting state.

This pattern governs the relationship between dialogs. The [dialog taxonomy](./dialog-taxonomy.md) still determines which dialog kind fits, and the [wizard pattern](./wizard.md) governs a wizard's own steps.
