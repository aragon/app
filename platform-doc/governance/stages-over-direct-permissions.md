---
type: decision
title: Stages over direct permission grants
tags: [governance, access-control, semantics]
status: draft
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + product-owner authorization-model review (2026-08-04, see log.md)
---

# Stages over direct permission grants

When a multisig should gate a [governance process](./process.md) — approving before or after a token vote — represent it as an explicit [stage](./stage.md) of the process (see [multisig gates](./multisig-gates.md)). Granting proposal-creation or execution permissions directly to a [Safe](../accounts/safe.md), outside any stage, is valid — the UI supports the execution arrangement, and renders the resulting role either way — but it is right only when a DAO deliberately wants that role to sit outside the visible staged process: the role becomes invisible in the governance UI, and the experience is worse.

## Context

A multisig can gate a process two ways: as a body inside a stage (visible in the [Voting Terminal](../design/voting-terminal.md)), or by being the caller authorized for the process's [creation](./proposal-creation.md) or execution function directly, with no stage involved. Both are technically supported and can lead to the same proposal outcome; the difference is whether the multisig's part in deciding is modelled as part of the process or left as a bare permission grant ([authorization and execution model](../access-control/authorization-and-execution.md)). This page is the rule for choosing between them.

## Chosen direction

Prefer the staged form. The direct-grant form exists and works, but is a deliberate opt-out of transparency, not a shortcut.

### Direct creation grant to a Safe — how it would work

The governance designer does not express this directly — it is the pattern closest to a literal "let the multisig create but not vote" request, and it takes an admin route instead. Install the process under [admin](../accounts/admin-flow.md) control with proposal creation temporarily open to anyone; a separate admin proposal then revokes that open grant and grants creation specifically to the [Safe](../accounts/safe.md). The Safe [connects to the app](../accounts/connecting-a-safe.md) and creates the proposal from within the Safe. This only works with a Safe: a Safe is an [account](../accounts/account.md), so it can hold a permission and act on it directly. An Aragon multisig cannot play this role — see below.

### Why it is discouraged: nested-action review

The Safe transaction that creates the proposal is itself a `Create Proposal` call, with the proposal's real [actions](./action.md) nested inside that call's own action array — even though the actions are the proposal's actual content. The Safe side shows that calldata raw, with none of Aragon's basic or decoded action presentation (the [action builder](./action-builder.md)), so signers need other tools to work out what the proposal would actually do. And a Safe-side simulation of the transaction (e.g. Tenderly) mainly shows that the Safe can call `Create Proposal`; it would likely succeed even if the eventual proposal's actions are invalid, so it does not answer what a signer actually needs to know (contrast [action simulation](./action-simulation.md), which bypasses the proposal wrapper and simulates the actions' execution route).

### Direct execution grant to a Safe

The same shape applies to execution: grant execute on the process to the Safe and revoke it from everyone else. The UI supports this arrangement ([proposal](./proposal.md) covers what ineligible users see). It carries the transparency cost — the Safe's role does not appear as a stage in the Voting Terminal — but not the review problem: signers approving an execution are not reading nested proposal calldata, which is why the creation variant is the materially worse of the two. (This is still execution *on the process* — a passed proposal's execution step. Executing on the DAO directly, outside every process, is a different grant and its own surface: [create transaction](../treasury/create-transaction.md).)

### Never for an Aragon multisig

An [Aragon multisig](../protocol-doc/plugins/multisig-plugin.md) is a governance plugin, not an account — it has no independent entry point for holding and acting on an isolated permission the way a Safe does. For it to perform one isolated action on another process — create or execute a proposal — it would need to exist as its own governance process merely to route that action through its configured execution path. The normal path uses the DAO account as the caller; an alternate `DelegateCall` path can run as the plugin, but neither gives the multisig a Safe-like generic account interface. Reproducing what the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) already does directly adds needless indirection and is not recommended.

## Consequences

- Direct grants keep a multisig's role out of the [Voting Terminal](../design/voting-terminal.md) entirely — the role is real but invisible in the governance UI.
- Choosing the staged form instead is the substance of [multisig gates](./multisig-gates.md): it's what a [staged process](./staged-proposals.md) is for.
- An Aragon multisig acting outside a stage on a process it isn't part of is not a supported recommendation, independent of feasibility.
