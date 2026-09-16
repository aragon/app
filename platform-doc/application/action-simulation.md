---
status: draft
type: capability
title: Action simulation
tags: [governance, transactions, actions]
source: product-owner briefings (2026-07-28, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app simulation verification (2026-08-04, see log.md) + product-owner first-principles review (2026-08-05, see log.md) + supported-chain reconciliation (2026-09-10, app@d1fa9970; see log.md)
---

# Action simulation

The app can simulate a prepared batch of [actions](../governance/action.md) before it is executed. The capability is defined by the action array and its intended execution route, not by a [proposal](../governance/proposal.md): proposal creation and the proposal page expose simulation because they already hold a complete action batch and enough process context to derive its route. The direct [create-transaction flow](../treasury/create-transaction.md) exposes the same capability without creating or referring to a proposal at all.

## What it simulates

The simulation reduces the intended execution to an action array plus its caller and account context. In a governance-routed flow it simulates [`execute`](../protocol-doc/core/execution.md#the-execute-function) on the DAO with the process's plugin as caller — the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) itself in a multistage process. In a direct-execution flow, the connected actor is the caller and the DAO is the target.

No proposal object enters that simulation: it deliberately bypasses proposal creation, metadata, status, voting, approval, and every other governance step to test the **permission and action-execution path**: whether the intended caller is permitted to execute, and whether the actions themselves succeed.

The app runs the simulation on **Tenderly**: the UI shows a **likely-to-succeed / likely-to-fail** verdict and links out to the Tenderly results. Simulation requires the app's Tenderly integration for the selected chain; [Supported chains](./supported-chains.md) lists its availability separately from account creation.

## Where it is available

- **During proposal creation**, after the [action builder](./action-builder.md) has prepared the batch and before the proposal is submitted. The selected process supplies the execution context. The author can skip simulation or continue after a likely-to-fail result.
- **On an existing proposal**, where the actions are already bundled and the owning process supplies the execution context. The [Proposal details page](../governance/proposal.md#actions-and-execution) controls when simulation is available and when a result can be refreshed.
- **During direct transaction creation**, after the action builder has prepared the batch and before it is submitted. The user may run or skip the simulation; the connected actor supplies the execution context.

## Why this is the meaningful question

An author, reviewer, voter, or signer needs to know whether the prepared actions will work through their intended execution route and what they will do. Simulating an earlier wrapper call is not equivalent: a Safe-side simulation of a direct proposal-creation grant can show that the Safe may call `createProposal` while saying nothing about whether the bundled actions will succeed later (see [direct creation grants to a Safe](../governance/multisig-gates.md#direct-creation-grant-to-a-safe)). Action simulation asks the execution question directly.
