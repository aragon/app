---
type: pattern
title: Use primary actions sparingly
tags: [design, interaction, actions, content]
status: draft
source: product-owner interaction-principles review + app and gov-ui-kit verification (2026-08-05, see log.md)
---

# Use primary actions sparingly

A primary action tells the person which next step the product recommends in the current decision. Use primary styling only when that recommendation exists. Within one decision context, show at most one primary action; when no action should lead, show none.

## One decision, one lead action

A dialog, wizard step, page section, or card is one decision context when its controls answer the same immediate question. Choose the action that advances or completes that decision and make alternatives secondary or tertiary.

If several choices have equal weight, present them as choices rather than styling each one as the primary action. After the person chooses, a single primary action may confirm or continue. If a surface only explains state and offers no recommended next step, it does not need a primary button.

This is not a rule that every page contains exactly one primary-colored element. Independent regions may carry their own local actions, but they must not compete as several answers to the same question. Apply [every element makes a claim](./every-element-makes-a-claim.md): primary styling specifically claims that an action should be taken now.

## Say what the action does

Name the primary action after its immediate outcome or the boundary the person is about to cross:

- **Publish proposal** when the action publishes a proposal;
- **Confirm in wallet** when control moves to the wallet;
- **Save** when a bounded edit is applied; and
- **Next** only when the current step collects information and the immediate outcome is moving to the next step.

Avoid generic terminal labels such as **Continue** or **Submit** when a more specific result is known. The label should remain true even if a later transaction, indexing step, or governance decision still follows.

## Keep hierarchy separate from availability and severity

Primary styling says which action leads. It does not say whether the actor is authorized, whether the action is dangerous, or whether the control is currently available. Use [control availability](./control-availability.md) for hide, disable, guard, and warn decisions, and [alert severity](./alert-severity.md) for consequential confirmations.

The shared dialog footer supports this hierarchy with one optional primary action and one optional secondary action. Direct button composition must preserve the same rule instead of using primary styling as decoration.
