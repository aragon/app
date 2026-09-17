---
type: pattern
title: Full-screen wizard
tags: [design, interaction, wizard, transactions]
status: draft
source: aragon-knowledge-base/design/interaction-patterns/full-screen-wizard.md (first-slice brain dump, 2026-07-06) + product-owner briefing (2026-07-20, wizard system) + product-owner briefings (2026-07-28, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Full-screen wizard

The dedicated-destination form of a [wizard](./wizard.md), used for substantial transaction-input flows that require the user's full attention. Most have several screens, but screen count is not the defining rule: Create Transaction uses one action-builder screen because that composer still holds substantial state and benefits from a focused destination. The pattern is deliberately distinct from dialog wizards and from dialogs in general — see [Dialog taxonomy](./dialog-taxonomy.md).

The user steps through the flow while the wizard holds substantial input and intermediate state in working memory. At the end, continuing from the final input step opens a **transaction dialog**. A transaction utility composes one or more transactions that set everything up, and each composed transaction moves through the shared [transaction submission stepper](./transaction-submission.md) — except in Create Transaction, whose direct-execution dialog is a two-step send outside the stepper's four phases.

## When to use

- Use it when the flow holds substantial state and requires sustained focus from the user; multiple screens are common, not mandatory.
- Treat it as a destination the user deliberately enters, not as an interruption or a task performed on the fly.
- Put a bounded sub-flow in a dialog wizard nested inside the full-screen wizard when that sub-flow needs its own guided input ([wizard nesting](./wizard.md)).
- Keep a single direct choice, such as a vote, on the page; it is not a wizard.

## Worked example: governance designer

Clicking "+ Governance" opens the [governance designer](../governance/governance-designer.md) as a full-screen wizard. The user configures governance across the wizard's steps — plugin-specific configuration renders through [plugin slots](./plugin-slots.md) — and the terminal transaction utility composes the setup transactions. Because the account is still in the [admin flow](../accounts/admin-flow.md) at that point, the user holds the permissions to fully install everything at the end.

## The full-screen wizards today

- **Create account** — chain, then account metadata; the submission dialog deploys the account in one transaction. The entry point is on the Explore page above the account list. See [account creation](../accounts/account-creation.md).
- **Create governance process** — process metadata, governance design, proposal-creation rules, then permissions. Adding a voting body is a nested dialog wizard. Publishing prepares the installation and then creates the proposal that applies it. See [governance designer](../governance/governance-designer.md).
- **Create proposal** — proposal metadata, actions, then a plugin-specific settings step only when the selected process requires one; the submission dialog creates the proposal in one transaction. If the account has multiple processes, selecting the proposal type precedes the wizard. See [proposal creation](../governance/proposal-creation.md#creating-a-proposal).
- **Create transaction** — one action-builder step; the submission dialog sends one direct `DAO.execute` transaction. See [create transaction](../treasury/create-transaction.md).

All other multi-step flows use a [dialog wizard](./wizard.md) instead, because they are smaller.

## Open questions

- [ ] Is there a sharper threshold between a full-screen wizard and a dialog wizard than the current substantial-state, sustained-focus, and bounded-subflow criteria?
