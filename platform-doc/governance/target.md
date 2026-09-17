---
type: concept
title: Target
tags: [governance, semantics]
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + app and osx source verification (2026-08-04, see log.md) + product-owner briefings and setup verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 with pinned protocol-doc (2026-09-15, see log.md)
---

# Target

A **target** is the address an onchain call is directed to. Under the general [authorization and execution model](../access-control/authorization-and-execution.md), a contract can be the target of one call and the caller of the next. Contracts can call other contracts as their code allows. Each guarded function enforces authorization for the call it receives, whether it checks its own state or consults a separate permission authority.

In the usual governance arrangement, an [account](../accounts/account.md) calls the targets specified by its [actions](./action.md), whereas a [governance plugin](./plugin.md) targets the account to request execution of those actions.

## Action targets

An **action target** is the address in an action's `to` field. When the account executes the action, it calls that address with the specified value and calldata. For a contract interaction, the calldata identifies the function and its arguments.

For an ERC-20 transfer, the target is the token contract; the recipient and amount are arguments to its transfer function. For a protocol parameter change, the target is the protocol contract, and the calldata specifies the function and new setting. An action can also target the account itself, for example to update its metadata or grant a permission.

A target contract sees the account as the caller and applies its own authorization rules to evaluate that call. For example, changing a protected protocol parameter requires the protocol contract to authorize that account to make that change.

## Plugin targets

The supported Aragon OSx governance plugins do not implement their own executors and are not themselves accounts. A plugin's target is the executor address to which it submits its actions. Its [target configuration](../protocol-doc/framework/plugins.md#how-a-plugin-makes-the-dao-act) determines the address to which the actions are sent.

The target configuration also specifies the call mode: `Call` sends the actions to the target executor, while `DelegateCall` uses that executor's code to execute them in the plugin's own context.

With these settings, the Aragon platform supports two target configurations:

- **Governance process.** The default route for governance plugins is `Call` to their own account. A plugin acting as a [process](./process.md) sends the proposal's actions to `DAO.execute` once its governance requirements are met. The account checks the plugin's **Execute permission** (`EXECUTE_PERMISSION_ID`), including any [conditions](../access-control/scoped-authority.md), before executing those actions as itself.
- **Body in staged governance.** A plugin can alternatively use `DelegateCall` with the shared [GlobalExecutor](../protocol-doc/core/execution.md#the-standalone-executor). This executes the shared code in the plugin's context, allowing it to report a [body's](./body.md) decision to the [Staged Proposal Processor (SPP)](./proposal.md#staged-proposals) from its own address. The body's sub-proposal contains the reporting action; SPP recognizes the caller as that body. SPP applies the stage rules and submits the main proposal's actions to the account when the process's execution requirements are met.

Target configuration is handled during setup by the [governance designer](./governance-designer.md) or the Aragon team. The application abstracts these technical details for users proposing and voting. The configuration should remain as set during setup: changing it can prevent execution or stop SPP from recognizing a body's reports, so any change needs technical review.
