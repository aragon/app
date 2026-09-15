---
type: capability
title: Action simulation
tags: [governance, transactions, actions]
source: product-owner briefings (2026-07-28, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app simulation verification (2026-08-04, see log.md) + product-owner first-principles review (2026-08-05, see log.md)
---

# Action simulation

The app can simulate a prepared batch of [actions](./action.md) before it is executed. The capability is defined by the action array and its intended execution route, not by a [proposal](./proposal.md): proposal creation and the proposal page expose simulation because they already hold a complete action batch and enough process context to derive its route. The direct [create-transaction flow](../treasury/create-transaction.md) exposes the same capability without creating or referring to a proposal at all.

## What it simulates

The simulation reduces the intended execution to an action array plus its caller and account context. In a governance-routed flow it simulates [`execute`](../protocol-doc/core/execution.md#the-execute-function) on the DAO with the process's plugin as caller — the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) itself in a multistage process. In a direct-execution flow, the connected actor is the caller and the DAO is the target.

No proposal object enters that simulation: it deliberately bypasses proposal creation, metadata, status, voting, approval, and every other governance step to test the **permission and action-execution path**: whether the intended caller is permitted to execute, and whether the actions themselves succeed.

The app runs the simulation on **Tenderly**: the UI shows a **likely-to-succeed / likely-to-fail** verdict and links out to the Tenderly results. Simulation is only available on chains Tenderly supports.

## Where it is available

- **During proposal creation**, after the [action builder](./action-builder.md) has prepared the batch and before the proposal is submitted. The selected process supplies the execution context.
- **On an existing proposal**, where the actions are already bundled and the owning process supplies the execution context. The latest result is cached and displayed, and the app prevents another run until that result is ten minutes old, limiting repeated use of Tenderly credits. This surface is available only in non-terminal states — pending, active, advanceable, or executable — so an executed proposal cannot be simulated again.
- **During direct transaction creation**, after the action builder has prepared the batch and before it is submitted. The user may run or skip the simulation; the connected actor supplies the execution context.

Those lifecycle and caching rules belong to the proposal page, not to the underlying simulation capability.

## Why this is the meaningful question

An author, reviewer, voter, or signer needs to know whether the prepared actions will work through their intended execution route and what they will do. Simulating an earlier wrapper call is not equivalent: a Safe-side simulation of a direct proposal-creation grant can show that the Safe may call `createProposal` while saying nothing about whether the bundled actions will succeed later (see [stages over direct permissions](./stages-over-direct-permissions.md)). Action simulation asks the execution question directly.
