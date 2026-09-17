---
type: pattern
title: Dialog taxonomy
tags: [design, interaction, dialogs]
status: draft
source: aragon-knowledge-base/design/interaction-patterns/dialog-taxonomy.md (first-slice brain dump, 2026-07-06) + product-owner briefing (2026-07-20, wizard system) + product-owner briefings (2026-07-28, see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + product-owner briefings (2026-09-11, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner editorial feedback (2026-09-13, see log.md); product-owner reader-boundary refinement (2026-09-14, relocated claims and provenance in log.md; no fresh source verification)
---

# Dialog taxonomy

The product distinguishes three kinds of dialogs:

- **Dialog wizards**
- **General dialogs**
- **Alert dialogs**

A **dialog wizard** collects guided input for a bounded sub-flow. A [full-screen wizard](../../application/wizard.md#full-screen-wizard) is a dedicated destination outside the dialog family.

The [transaction submission stepper](../../application/submitting-a-transaction.md) carries the completed input through submission. Its lifecycle can follow different containers.

A **general dialog** is the base dialog used for most needs. The choice between a general dialog and an alert dialog follows what the flow needs from the user: any form input means a general dialog, never an alert.

An **alert dialog** asks the person to acknowledge information or make a consequential choice. Use [alert severity](./alert-severity.md) to distinguish neutral information, caution, and an error or strong concern.

## Choosing a wizard container

Choose the container from the task's relationship to its surroundings. Use a full-screen wizard when the input flow should become the main task, and a dialog wizard when the action belongs within the current page or flow. A single choice, such as voting, does not require a wizard merely because it produces a transaction; presenting that choice in a dialog would not by itself make it a wizard.

The flow owns its steps, validation, and retained state. Give each screen one idea so the person does not have to switch mental context within a step. A footer arrangement alone does not establish a wizard: use [primary-action hierarchy](./primary-action-hierarchy.md#keep-hierarchy-separate-from-availability-and-severity) to place its controls, and preserve the [nesting and retained-input behavior](../../application/wizard.md#nesting-and-retained-input) when composing a child flow.

The browser confirmation used when [leaving an unfinished wizard](../../application/wizard.md#leaving-an-unfinished-wizard) sits outside these product dialog classes. It has no product alert severity or designed forward action.

## Wallet readiness

A dialog that needs a connected address should remain tied to that connection. Closing it on disconnect prevents an action from continuing without an actor; temporarily hiding it during reconnection lets the user resume once the address is available ([wallet connection](../../application/wallet-connection.md#dialogs-that-need-a-wallet)).

When another service needs to take over the interaction, such as the wallet's connection interface, the app's dialog steps aside so the user can complete that step. The surrounding flow remains the context they return to.
