---
type: capability
title: Executing on a linked account
tags: [accounts, governance, transactions]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + direct and linked-account execution verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + locked Reown WalletKit 1.5.6 and WalletConnect core/utils 2.23.10; see log.md)
---

# Executing on a linked account

When the primary account can [execute](../protocol-doc/core/execution.md) on a [linked account](./linked-account.md), its own [proposal](../governance/proposal.md) can include actions built in the linked account's UI. Voters can inspect what the linked account will execute before the primary account submits the execution request.

Both accounts must be on the same network for this nested execution. [Cross-chain execution](../governance/cross-chain-execution.md) uses a separately configured route between networks.

Linking accounts establishes a [display relationship](./linked-account.md#linking-does-not-imply-control); authority comes from the Execute grant. When the primary account calls the linked account's `execute` function, that function checks the primary account's Execute permission, including any conditions. The linked account then makes the inner calls as itself, so the [action targets](../governance/target.md#action-targets) see the linked account as the caller and apply their own authorization rules to it. These calls can target other accounts or contracts, independently of which accounts the app presents as linked.

An authorized EOA or [Safe](../application/connecting-a-safe.md) can also use the [direct transaction flow](../treasury/create-transaction.md) with its own signing arrangement.

## The flow

The primary's [action builder](../application/action-builder.md#adding-through-walletconnect) receives transaction requests from the linked account's Aragon view over WalletConnect. Keep the primary's WalletConnect dialog open while using the linked-account view, until the request has been added. An already-open linked-account view still needs this WalletConnect pairing.

For example, use another browser for the linked account to keep the two views separate:

1. In the primary account's proposal Action builder, select **Connect**. If the process's [allowed-actions filter](../application/action-builder.md#filtering-to-allowed-actions) hides it, turn the filter off to expose WalletConnect; the process must still permit the intended call.
2. Open the linked account in the other browser and choose **Connect wallet → WalletConnect**. Copy the URI from its QR-code flow into the primary's dialog and select **Connect dApp**.
3. Confirm that the **primary account is the connected actor** in the linked-account view, on the linked account's network.
4. Open the linked account's [Transactions](../treasury/transactions.md) page. When the primary passes the [direct-execution eligibility check](../treasury/create-transaction.md#mechanics), **Execution** opens its action builder.
5. Build the inner actions, select **Execute**, and send the prepared transaction from the execution dialog. WalletConnect queues the call to the linked account in the primary's dialog.
6. Return to the primary, add the received action to its action list, and finish creating the [proposal](../governance/proposal.md). This submits the nested call for governance approval.
7. When that proposal is [executed](../protocol-doc/core/execution.md), the primary calls the linked account, which executes the inner actions, such as returning funds to the primary.

## Reading nested actions

Because one account is telling another to execute, the calldata contains an inner action array. The Execute action's Basic details show that array and check its decoded children against the encoded calls. A mismatch makes the whole inner array fall back to Raw. Individual specialized views also depend on the app resolving the target's supporting data; the [action catalogue](../application/basic-action-views.md#calls-containing-other-actions) explains the available representations.
