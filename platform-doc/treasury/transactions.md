---
type: capability
title: Transactions
tags: [treasury]
status: draft
source: product-owner briefings, 2026-07-16 (treasury) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app action-export verification (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Transactions

**User promise:** a full record of value moving through the account, and of what the account has done.

The Transactions page is a [datalist page](../design/datalist-page.md), reached from the nav bar. Its list defines four tabs:

- **All transactions** — executions, deposits, and withdrawals in one list.
- **Executions** — distinct `DAO.execute` calls.
- **Deposits** — asset transfers into the account.
- **Withdrawals** — asset transfers out of the account.

The tab row itself renders only when at least two of executions, deposits, and withdrawals have history on the account; a probe query per category decides that — a probe that fails counts as having history — and **All transactions** rides along with the row rather than counting toward it. Two accounts can therefore present different tab sets, and an account whose history sits in one category — or which has no history at all — gets no tab row rather than a row of one; with nothing to list, the page shows its empty state. The set of tabs remains the page's product model ([datalist page](../design/datalist-page.md)); which of them a reader sees follows the account's own history.

When the connected actor holds execute permission on the account, the page also shows a **"+ Transaction"** button — see [create transaction](./create-transaction.md).

## Opening a transaction

- Selecting an **execution** opens a dialog with its execution timestamp, total action count, transaction hash, and action list. The action list reuses the [basic, decoded, and raw action views](../governance/action-builder.md#understanding-actions), and the complete action set can be downloaded as reusable [action JSON](../governance/action-builder.md#reusing-action-sets-as-json).
- Selecting a **deposit or withdrawal** opens that transaction in the chain's block explorer. These rows are intentionally simpler: they show the transfer direction, timestamp, amount, and asset — for example, `Received · 0.5 ETH`.

The action views, JSON export, and block-explorer links are [drill-downs](../design/abstract-then-drill-down.md): the page begins with a usable account-level record and keeps the underlying transaction facts available on demand.

Because the account executes arbitrary actions and is itself the [vault](./vault.md), an execution contains an array of actions, each ultimately represented by a `to`/`value`/`data` triple. An execution created through a [proposal](../governance/proposal.md) is also visible on that proposal.

Decoding those actions happens on the backend and is not necessarily finished when the dialog opens. The dialog polls the decode status every two seconds for up to ten responses — its own bounded window, roughly eighteen seconds from the first response — and shows a loading state while the first response is outstanding, then only while decoding is still running with no raw actions delivered yet.

The result degrades as a whole, not per action. When the number of decoded actions does not match the raw action count, every row drops to raw calldata at once ([the polling bound and the fallback](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialogUtils.ts#L5-L47)), including the actions that decoded cleanly: those rows offer the [raw view](../governance/action-builder.md#understanding-actions) alone, name their function "Unknown", and carry the action viewer's decode warning — "Action had issues with decoding" — when expanded, while the action count the dialog reports stays accurate. The polling bound itself expires unmarked, and expiry only ends the dialog's own retries: reopening the dialog once its cached result has gone stale fetches again and can pick up a completed decode.

With [linked accounts](../accounts/linked-account.md), the page can also partition activity per account — a filter that appears only when there are two or more accounts to choose between.
