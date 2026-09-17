---
type: capability
title: Create transaction
tags: [treasury, transactions, access-control]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app transaction encoding and simulation verification (2026-08-03–04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + supported-chain reconciliation (2026-09-10, app@d1fa9970; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner briefings (2026-09-11, see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + direct and linked-account execution verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner briefings (2026-09-15, see log.md)
---

# Create transaction

The Create transaction flow provides a [direct execution route](../application/execution-routing.md#direct-execution) for a connected actor with [Execute permission](../protocol-doc/core/permissions.md) on the account. The actor submits actions without creating a proposal on that account.

## Execute transaction page

### Mechanics

The [Transactions](./transactions.md) page shows an **Execution** button when the connected actor — a wallet, a [Safe](../application/connecting-a-safe.md), or another account acting over WalletConnect — passes the account's Execute-permission check. The check evaluates the permission onchain with empty condition data (`0x`). A conditioned grant must accept that data for the button to appear; a condition that requires the actual execution call can leave the button hidden even when it permits particular batches. Opening the flow does not establish that the prepared batch is authorized: the account checks the actual call at execution.

The same eligibility check guards the wizard and returns an ineligible actor to Transactions.

### Composing and submitting

Clicking **Execution** opens a **one-step** [full-screen wizard](../application/wizard.md#full-screen-wizard) around the shared [action builder](../application/action-builder.md). There is no metadata or settings step because direct execution creates no proposal; it calls the DAO's own [execute](../protocol-doc/core/execution.md). The composer does not filter actions to the connected actor's permission scope; its catalog uses the account's plugins and permissions as described under [allowed-action filtering](../application/action-builder.md#filtering-to-allowed-actions).

Continuing from the action-builder step opens the direct-execution transaction dialog. When the user prepares several actions, the app encodes them into one `DAO.execute` call: a single transaction carrying an atomic action batch ([protocol execution](../protocol-doc/core/execution.md)). A signer authorizes that one outer transaction. The third-party wallet controls its signing display; Aragon's [action views](../application/action-builder.md#viewing-actions) provide the action detail before submission.

Before submitting on a [chain with simulation available](../application/supported-chains.md), the user can [simulate the prepared actions](../application/action-simulation.md) or skip simulation. In this direct-execution flow the connected wallet is the caller and the DAO is the target; no proposal object or governance plugin participates. Submission then runs the direct-execution transaction dialog: a two-step send that shares the [transaction dialog](../application/submitting-a-transaction.md)'s chain-mismatch disclosure and pre-signing switch, but not its four phases or its memory of an interrupted attempt. Its exit guard releases as soon as the send succeeds and re-arms if it fails ([leaving an unfinished flow](../application/wizard.md#leaving-an-unfinished-wizard)).

## Who reaches for it

The [specialized action catalogue](../application/basic-action-views.md) applies to direct composition as well as proposals.

This is how an actor holding execute permission **on the DAO itself** acts — a deliberate arrangement that sits alongside the governance processes rather than inside them. It is a different grant from executing a *passed proposal* on a process, which stays inside governance ([direct execution grant to a Safe](../governance/multisig-gates.md#direct-execution-grant-to-a-safe) holds that contrast). It is also the same permission-gated button the linked-account flow drives — with the difference that when the connected actor arrives over WalletConnect, the composed call is handed back to that actor and rides its own governance instead of executing immediately ([executing on a linked account](../accounts/executing-on-a-linked-account.md)).
