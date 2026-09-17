---
type: pattern
title: Wizard
tags: [design, interaction, wizard, transactions]
status: draft
source: product-owner briefing, 2026-07-20 (wizard system) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + product-owner ruling (2026-08-07, see log.md)
---

# Wizard

A wizard is a transaction-input flow: it holds the information a user provides while the product collects what it needs to produce a transaction. The pattern is for a flow with enough input or state to require guided collection, not merely for every transaction that accepts a choice.

When the flow creates a metadata-bearing object, its first definition step follows the standard [metadata input](./metadata-input.md) pattern. A prerequisite selector may precede that step when it determines the available fields, but metadata comes before governance, membership, actions, permissions, or other operational configuration. Each screen should own one idea so the user does not have to switch mental context within a wizard step.

A single-input transaction does not need a wizard. Voting is the representative case: the user chooses an option directly on the proposal page. That choice could theoretically appear in a dialog without becoming a wizard.

## Choosing the container

- A **dialog wizard** is a constrained sub-flow inside a larger flow.
- A [**full-screen wizard**](./full-screen-wizard.md) is a dedicated destination for a substantial flow that requires sustained focus and working memory. It may contain one screen or several.

A dialog wizard uses the general `Dialog` container; its wizard-control row is `Dialog.Footer variant="wizard"`, which places Back or Close on the left and the primary Next or Submit action on the right. This is a container and footer treatment, not a third dialog component. The consuming app owns the step graph, form state and validation, navigation, exit behavior, analytics, and transitions to other dialogs. The footer variant can also serve another bounded procedural dialog, so the variant alone does not make a flow a wizard; see the complete [dialog taxonomy](./dialog-taxonomy.md).

The supported nesting direction is deliberately one-way: a dialog wizard can open inside a full-screen wizard when a bounded sub-flow requires its own guided input. A full-screen wizard is never nested inside another wizard, and a dialog wizard does not nest another dialog wizard. This lets the enclosing destination retain the parent state while the bounded sub-flow reuses the appropriate guided input.

The [governance designer](../governance/governance-designer.md) is the representative full-screen wizard. The Create Proposal wizard is also a destination flow rather than something performed on the fly; voting, by contrast, stays directly on the proposal page ([proposal experience](../governance/proposal.md)).

Once a wizard has collected enough input to compose a transaction, the reusable [transaction submission stepper](./transaction-submission.md) takes over the prepare, wallet-signature, chain-confirmation, and backend-indexing lifecycle. That submission dialog is downstream of the wizard rather than another kind of input wizard.

## Leaving an unfinished wizard

Every wizard inherits one exit guard from the shared wizard root, so the behavior is the same in a full-screen wizard and in a dialog wizard. It arms as soon as the form holds any change against its defaults, and it challenges the exits that would discard that input: the wizard navigation's close control and other in-app links, the browser's Back, and reloading or closing the tab. It releases once the submission dialog reaches a state the app means the user to leave from — the success action after indexing, or the offer to continue in the background while indexing runs — so the route out of a finished wizard is not challenged; the submission dialog of [direct transaction creation](../treasury/create-transaction.md) releases as soon as its send succeeds and re-arms if it fails.

The challenge is the browser's own prompt rather than a product dialog: a native confirm for in-app exits, carrying the app's line — *If you leave this process, you'll lose all the information you've entered so far.* — and the browser's generic leave-site prompt for a reload or tab close. The browser chrome is accepted as a low-cost implementation choice, not a taxonomy statement: the guard sits outside the [dialog taxonomy](./dialog-taxonomy.md) — no alert severity, no named forward action, only the browser's accept and cancel — and the product attaches no design intent to the prompt's presentation. The guard is the app's rule and the app's mechanism; gov-ui-kit supplies no exit-guard machinery. Dismissing a dialog wizard through its own close control is deliberately outside the guard: a dialog wizard holds a bounded sub-flow with little content, so its explicit close discards that input without challenge. Those dialogs instead refuse outside-click dismissal — the app's own choice on top of a component-library default that would dismiss on an outside click.
