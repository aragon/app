---
type: pattern
title: Execution routing
tags: [governance, transactions, access-control]
status: draft
source: product-owner action-initiation and process-selection briefing (2026-09-15) + shared selector and entry-flow verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-15, see log.md)
---

# Execution routing

In Aragon OSx, an address with **Execute permission** on an [account](../accounts/account.md) can pass [actions](../governance/action.md#action-arrays-and-execution) to the DAO's [`execute` function](../protocol-doc/core/execution.md#the-execute-function). The account checks the caller's permission, including any conditions, and executes the actions. An **execution route** determines which address makes this call and what must happen before it can do so.

## Direct execution

The most direct route is for an authorized actor to submit actions to the account's `execute` function without creating a proposal on that account. In the app, [Create transaction](../treasury/create-transaction.md) provides this route from the Transactions page, where the connected actor prepares and submits the actions. An authorized [primary account acting on a linked account](../accounts/executing-on-a-linked-account.md) can use the same route.

## Execution through governance

A [governance plugin](../governance/plugin.md) can itself hold Execute permission on the account. The plugin manages its own [proposal lifecycle](../governance/proposal-status.md): an author submits actions in a proposal, and participants decide whether they should execute under the process's rules. Once the proposal meets its execution requirements, the plugin can submit the actions to the account's `execute` function. This adds a governance decision before the account executes the actions.

The app uses a shared selector to choose the [governance process](../governance/process.md) when creating a proposal, adding governance, removing a process, or upgrading contracts. This selector currently offers installed process plugins; direct execution uses the separate Transactions entry point.

### Choosing a process

The selector lists visible, supported process plugins installed on the account and its [linked accounts](../accounts/linked-account.md). The choices can be restricted by the flow's requirements, such as requiring a process with unrestricted execution for uninstallation. Each process's [execution scope](../access-control/scoped-authority.md) determines which actions it may ask the account to perform.

Some flows already determine the process and continue without a separate choice. For example, proposal creation and adding governance use the only available process automatically. When a choice is needed, the selector asks which process to use; in proposal creation, this is labelled the **proposal type**.

### Creation requirements

The connected actor must meet the selected process's [proposal-creation requirements](../governance/proposal-creation.md#creation-eligibility). These can depend on membership, voting power, or other configured conditions. The app checks this before continuing with the selected process.

The selector first simulates proposal creation. Processes with a successful check appear first. A process whose simulation returns a definite rejection remains visible but disabled; **View requirements** opens its [Process details page](../governance/process.md#process-details-page). If the simulation cannot run or returns an inconclusive result, the process remains selectable and the app checks eligibility when the flow continues.

The selected process's execution scope and the [target's authorization rules](../governance/target.md#action-targets) also apply when the actions execute.

## Preparing and submitting actions

In general [proposal creation](../governance/proposal-creation.md#creating-a-proposal) and direct execution, the user composes actions with the [Action builder](./action-builder.md). Use case-specific flows, such as [contract upgrades](../accounts/contract-upgrades.md) and [governance installation](../governance/governance-designer.md#preparing-and-applying-an-installation), assemble the actions from the user's choices and any preparation transactions. The app builds the contract calls needed to make the requested change, so the user does not have to identify and compose each call manually.

Submission follows the chosen route: the user publishes a proposal through the selected process or submits the actions directly to the account. Each transaction involved uses the applicable [submission flow](./submitting-a-transaction.md).
