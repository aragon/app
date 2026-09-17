---
type: capability
title: Create transaction
tags: [treasury, transactions, access-control]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app transaction encoding and simulation verification (2026-08-03–04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Create transaction

**User promise:** execute directly on the account, bypassing **that account's** governance processes, when the connected actor holds [execute permission](../protocol-doc/core/permissions.md) on the DAO itself.

## Mechanics

The [transactions](./transactions.md) page shows a **"+ Transaction"** button only when the connected actor — a wallet, a [Safe](../accounts/connecting-a-safe.md), or another account acting over WalletConnect — holds that permission; the button is hidden otherwise. Clicking it opens a **one-step** [full-screen wizard](../design/full-screen-wizard.md) around the shared [action builder](../governance/action-builder.md). There is no metadata or settings step because a direct execution has no proposal object and is sent to no plugin; the call is the DAO's own [execute](../protocol-doc/core/execution.md), not a plugin's create-proposal.

A transfer action's amount is typed into a plain numeric field with no decimal masking, so an entry can carry more precision than the token has decimals. The app takes it and [rounds to the token's precision](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/transferAssetAction/transferAssetAction.tsx#L141) — half-up on the last digit it keeps, carrying where that digit rolls over — then [writes the parsed value back into the amount field](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/transferAssetAction/transferAssetAction.tsx#L270-L274). Typing 1.1234567 of a six-decimal token therefore yields 1.123457 in the encoded call and in the field alike, with no message calling the change out.

Reshaping the amount departs from both input rules the pattern library states. [Refusing unsatisfiable configuration](../design/invariant-validation.md) rejects a value that could never describe a workable state; [input normalization](../design/input-normalization.md) converts a value only where two forms provably mean the same thing, and counts amount precision among what a conversion may change. An over-precise amount is neither refused nor preserved: it is a valid intent the token cannot express exactly, and the app resolves it to the nearest amount the token can. The same composition path builds a proposal's transfer action ([action builder](../governance/action-builder.md)), which rounds identically.

Continuing from the action-builder step opens the direct-execution transaction dialog. When the user prepares several actions, the app encodes them into one `DAO.execute` call: a single transaction carrying an atomic action batch ([protocol execution](../protocol-doc/core/execution.md)). A signer authorizes that one outer transaction, while wallets may expose different amounts of its nested action detail; the app's own [action views](../governance/action-builder.md#understanding-actions) provide the product's drill-down.

Before submitting on a Tenderly-supported chain, the user can [simulate the prepared actions](../governance/action-simulation.md) or skip simulation. In this direct-execution flow the connected wallet is the caller and the DAO is the target; no proposal object or governance plugin participates. Submission then runs the direct-execution transaction dialog: a two-step send that shares the [transaction submission stepper](../design/transaction-submission.md)'s chain-mismatch disclosure and pre-signing switch, but not its four phases or its memory of an interrupted attempt.

Without the permission the call simply reverts on chain — the DAO's own permission check is the enforcement; hiding the button is just the app not offering a flow that could not succeed. The button uses the hidden treatment from [control availability](../design/control-availability.md), rather than being shown and blocked: unlike executing a passed proposal, where an ineligible user gets a guard explaining why ([proposal](../governance/proposal.md)), a direct transaction has no governance context to explain, so the affordance simply does not appear.

## Who reaches for it

This is how an actor holding execute permission **on the DAO itself** acts — a deliberate arrangement that sits alongside the governance processes rather than inside them. It is a different grant from executing a *passed proposal* on a process, which stays inside governance ([stages over direct permission grants](../governance/stages-over-direct-permissions.md) holds that contrast). It is also the same permission-gated button the linked-account flow drives — with the difference that when the connected actor arrives over WalletConnect, the composed call is handed back to that actor and rides its own governance instead of executing immediately ([executing on a linked account](../accounts/executing-on-a-linked-account.md)).

## Open questions

- [ ] Whether the "+ Transaction" visibility check accounts for a *conditioned* execute grant, and whether the action builder applies the same [authorized-actions filter](../governance/action-builder.md) here as it does for a process's scoped grant.
