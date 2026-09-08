---
type: pattern
title: Dialog taxonomy
tags: [design, interaction, dialogs]
status: draft
source: aragon-knowledge-base/design/interaction-patterns/dialog-taxonomy.md (first-slice brain dump, 2026-07-06) + product-owner briefing (2026-07-20, wizard system) + product-owner briefings (2026-07-28, see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md)
---

# Dialog taxonomy

The product distinguishes three kinds of dialogs:

- **Dialog wizards**
- **General dialogs**
- **Alert dialogs**

A **dialog wizard** is the dialog-shaped [wizard](./wizard.md) container — a constrained sub-flow inside a larger flow; when to reach for it, and how it nests inside a [full-screen wizard](./full-screen-wizard.md), is the [wizard pattern](./wizard.md)'s to define.

The [full-screen wizard](./full-screen-wizard.md) sits apart from the dialog family: it is a dedicated, focused destination rather than a dialog layered over another flow.

The [transaction submission stepper](./transaction-submission.md) is documented separately because it is a cross-cutting submission lifecycle, not a transaction-input wizard. Its reuse does not introduce another wizard category; this taxonomy remains about the interaction containers.

A **general dialog** is the base dialog used for most needs. The choice between a general dialog and an alert dialog follows what the flow needs from the user: any form input means a general dialog, never an alert.

An **alert dialog** follows the standard pattern for the component (built on Radix) and exists for the watch-out moment — alerting the user to be careful. The severity of the alert itself — warning vs. critical — is its own pattern: see [alert severity](./alert-severity.md).

## gov-ui-kit mapping

gov-ui-kit exports exactly two public component families from `dialogs/`: `Dialog` and `DialogAlert`. The three product kinds map onto them as follows:

| Product kind | Component composition |
| --- | --- |
| General dialog | `Dialog.Root`, `Dialog.Header`, `Dialog.Content`, and `Dialog.Footer` with its default treatment. The header may expose a close control; content provides the scrolling body; primary and secondary footer actions are optional. |
| Dialog wizard | The same general `Dialog` family with `Dialog.Footer variant="wizard"`. The variant places the secondary Back/Close control on the left and the primary Next/Submit control on the right; it does not supply steps or flow state. |
| Alert dialog | `DialogAlert.Root`, `DialogAlert.Header`, `DialogAlert.Content`, and `DialogAlert.Footer`. It uses the Radix Alert Dialog primitive, has no header close control, and requires both a consequential action and a cancel action. Warning or critical presentation is selected on the root. |

This mapping is complete for the public `dialogs/` export: no dialog component family sits outside the three kinds. Header, content, footer, hidden accessibility elements, alert context, and animation utilities are parts of these two families rather than additional dialog kinds. The toolkit also supports `info` and `success` visual variants on `DialogAlert`; their availability does not add product severity categories or override the rule that form input belongs in a general dialog.

## Wallet readiness

Any dialog, of any of the three kinds, may declare on its registration that it requires a connected wallet to be meaningful. This is the app's own rule layered on top of the dialog container — the component library has no notion of wallet state. When a wallet-requiring dialog would open without a connected wallet, the app does not render it; if the wallet disconnects while one is already open, the app closes it outright rather than let it render against a missing address. A momentary gap — the wallet reconnecting on page load, or switching connector — is treated as distinct from a genuine disconnect: the app hides the dialog for the moment but leaves it on the stack, restoring it once the wallet settles back to a connected address instead of losing it. A dialog stacked on top of a wallet-requiring dialog should declare the requirement too; otherwise it is left standing alone once its parent closes from under it.

Keeping focus inside the dialog is a component-library default for both general and alert dialogs; blocking interaction with everything outside is a default for general dialogs and unconditional for alert dialogs. The app turns the focus trap off outright, as a fixed registration choice, for exactly two dialogs: the one that starts a wallet connection, and smart-contract verification. Only the connect-wallet dialog also tracks the wallet connector's own lifecycle: while the connector's UI is open, it releases its modal block so the connector can take focus and clicks — for example, letting the user type into a wallet search field — and hides itself outright; once the connector's UI closes, it resumes its normal modal behavior.
