---
type: capability
title: Transactions
tags: [treasury]
status: draft
source: product-owner briefings, 2026-07-16 (treasury) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app action-export verification (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + direct-execution eligibility verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + data-view verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e (2026-09-13, backend source snapshot; API-version limits in log.md)
---

# Transactions

The Transactions page provides a full record of value moving through the account and of what the account has done. Reached from the nav bar, this [collection page](../application/collection-pages.md) defines four tabs:

- **All transactions** — executions, deposits, and withdrawals in one list.
- **Executions** — distinct `DAO.execute` calls.
- **Deposits** — asset transfers into the account.
- **Withdrawals** — asset transfers out of the account.

Tabs appear when the account has activity in more than one transaction category. Otherwise the page shows its single category directly, or an empty state when there is no history.

With [linked accounts](../accounts/linked-account.md), the account filter defaults to **All accounts**, and the unfiltered history combines the primary and linked accounts. Selecting the primary or a linked account narrows the history to that account. Reloading the page or opening a shared link restores the selection. With only one account, the account filter is hidden.

The **Execution** button acts on the account whose page is open, regardless of the history filter. It appears when the connected actor passes that account's Execute-permission check. [Create transaction](./create-transaction.md#mechanics) explains the check and the visibility limits of conditioned grants.

## Opening a transaction

- Selecting an **execution** opens a dialog with its execution timestamp, total action count, transaction hash, and action list. The action list reuses the [Basic, Decoded and Raw modes](../application/action-builder.md#viewing-actions); the [action catalogue](../application/basic-action-views.md#preparing-and-reviewing) distinguishes specialized details from creation-only forms. The complete action set can be downloaded as reusable [action JSON](../application/action-builder.md#reusing-action-sets-as-json).
- Selecting a **deposit or withdrawal** opens that transaction in the chain's block explorer. These rows are intentionally simpler: they show the transfer direction, timestamp, amount, and asset — for example, `Received · 0.5 ETH`.

The action views, JSON export, and block-explorer links provide access to underlying facts: the page begins with a usable account-level record and keeps the underlying transaction facts available on demand.

Because the account executes arbitrary actions and is itself the [vault](./vault.md), an execution contains an array of actions, each ultimately represented by a `to`/`value`/`data` triple. An execution created through a [proposal](../governance/proposal.md) is also visible on that proposal.

Action descriptions may take time to become available after execution. The dialog checks for updated descriptions for a short period. If it cannot obtain a complete decoded action set, it shows the whole batch in [Raw view](../application/action-builder.md#viewing-actions), preserving the transaction data for inspection.

Reopening the transaction later can retrieve completed descriptions once the cached result expires. An unavailable description does not mean an action failed; the transaction's onchain result remains authoritative.
