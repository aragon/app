---
type: capability
title: Executing on a linked account
tags: [accounts, governance, transactions]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md)
---

# Executing on a linked account

**User promise:** when the primary account can [execute](../protocol-doc/core/execution.md) on a [linked account](./linked-account.md), drive that linked account's actions from the primary's own [proposal](../governance/proposal.md) flow — building them in the linked account's real UI rather than by hand — and let voters read exactly what will run.

This is the payoff of granting one account Execute permission on another ([linking does not imply control](./linking-does-not-imply-control.md)). It works for **any actor** holding that permission — an EOA or a [Safe](./connecting-a-safe.md), not only a linked primary.

## The flow

The app bridges two browser sessions over WalletConnect, building on the [action builder](../governance/action-builder.md)'s WalletConnect integration with the roles reversed — here the Aragon app itself is the dApp being connected to:

1. In the primary account's [action builder](../governance/action-builder.md), the user selects **Connect** and connects to another app over WalletConnect.
2. In another browser, the user opens the Aragon app on the **linked account** and gets its WalletConnect QR code.
3. Supplying that code to the primary's action builder makes the **primary the connected actor** for the linked account.
4. The linked account's [transactions](../treasury/transactions.md) page checks [Execute permission](../protocol-doc/core/permissions.md) for the connected actor in the background; when the actor has it, a **"+ Transaction"** button leads into the linked account's action builder — the same [create transaction](../treasury/create-transaction.md) flow.
5. The user builds actions in the linked account's own UI and selects **Create transaction**; WalletConnect returns the result to the primary, where it becomes a [proposal](../governance/proposal.md) to execute on the linked account.
6. On passing, the primary [executes](../protocol-doc/core/execution.md) a call to the linked account, which executes the inner actions (e.g. clawing back funds).

## Reading nested actions

Because one account is telling another to execute, the calldata is **nested**, and generic decoders struggle with it. The app's [action](../governance/action.md) rendering **unnests and decodes the inner calls**, so reviewers see the actions that will ultimately run against the linked account rather than an opaque blob. That readability is central to the [action builder](../governance/action-builder.md)'s role as a control surface and applies the [abstract-then-drill-down pattern](../design/abstract-then-drill-down.md).

## Open questions

- [ ] Whether both browser sessions are always required, or the app can drive a linked account the user already has open without the WalletConnect round-trip.
