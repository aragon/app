---
type: concept
title: Vault
tags: [treasury, semantics]
status: draft
source: product-owner briefing, 2026-07-16 (treasury)
---

# Vault

The [account](../accounts/account.md) is the treasury: assets are held by the DAO contract itself, not by any auxiliary vault contract. This works because of what the DAO is at the protocol layer — an account that executes arbitrary actions ([`DAO.sol`](../protocol-doc/core/dao.md), sometimes referred to as an "agent"), and acting as the vault is *why* it needs that capability.

Not any contract address can meaningfully hold a treasury: holding assets in a useful sense means being able to **act** on them — transfer tokens, approve spends, enter and exit DeFi positions. Because the DAO executes arbitrary actions (an execution is an array of calls, each a `to`/`value`/`data` triple), it can do anything an externally-owned account could: any asset can live on it, and it can hold DeFi positions through the actions passed through it.

Everything the product shows about the treasury hangs off this one fact:

- [Assets](./assets.md) — what the account holds, and how the app knows.
- [Transactions](./transactions.md) — deposits, withdrawals, and the executions the account performs.
