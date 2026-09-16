---
type: concept
title: Action
tags: [governance, semantics]
source: modularity strategy document (product-owner, mined 2026-07-14, see log.md) + product-owner briefing (2026-07-28, second answers) + product-owner principles review (2026-07-29, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner Action review (2026-09-10, see log.md)
---

# Action

An **action** is one onchain call describing what an [account](../accounts/account.md) is asked to do, such as transfer tokens, change governance settings, or interact with a protocol.

Each action specifies a target address (`to`), an amount of the chain's native token (`value`), and calldata (`data`). For a contract interaction, the calldata identifies the function and its arguments. For a native-token transfer, these fields specify the recipient and amount, with empty calldata.

## Action arrays and execution

An **action array** is an ordered list of actions. Any address authorized by the account's **Execute permission** (`EXECUTE_PERMISSION_ID`) can pass an array to [`DAO.execute`](../protocol-doc/core/execution.md#the-execute-function), subject to any conditions on that permission. The account calls each target in array order, and each target sees the account as the caller. An authorized connected wallet can submit the array through a [direct transaction](../treasury/create-transaction.md).

Execute permission authorizes the caller to make the account act. Each target also applies its own rules to the account's call: a token transfer requires a sufficient balance, for example, and a protected protocol function may require the account to hold a particular role. [Scoped authority](../access-control/scoped-authority.md) can restrict which actions a governance process may execute.

## Actions in proposals

Proposal-based [governance plugins](./plugin.md#governance-semantics-of-plugins) use [proposals](./proposal.md) to let governing bodies decide which actions the account should execute. Creating a proposal submits its action array to the plugin. [Members](./member.md) of the participating [governing bodies](./body.md) evaluate the proposed actions throughout the [proposal lifecycle](./proposal-status.md), according to the process's rules.

Once the proposal satisfies the execution requirements defined by the plugin's governance rules and settings, the authorized governance plugin can pass its action array to the account for execution. The execution request identifies the proposal whose stored actions will run. A proposal can also have an empty action array when its purpose is to signal a position.

## Preparing and reviewing actions in the app

The [action builder](../application/action-builder.md) helps users compose an action array and understand each call. Its **action catalog** includes **Basic actions**, a subset with purpose-built forms or readable details, such as transfers, metadata updates, and governance settings. Other contract functions can be composed through Decoded forms or Raw calldata. [Basic action views](../application/basic-action-views.md) lists the supported forms and details.

The app also assembles action arrays through dedicated flows. When you install governance through the [governance designer](./governance-designer.md#preparing-and-applying-an-installation), it prepares the plugins and builds the proposal containing the actions needed to apply their installation, permissions, and process configuration. [Uninstalling a plugin](./governance-designer.md#editing-across-the-lifecycle) similarly prepares the removal and builds the proposal that applies it. These flows turn the setup you specify into actions you can review.

The app presents the actions for review before submission, including inner actions in recognized execution and proposal-creation calls. The wallet receives the outer transaction request and uses its own decoding to display the confirmation.

## Action targets and authorization

**Account-native actions** call functions governed by the account's permission manager. These include the account's own permission and metadata functions, as well as functions on plugins and other contracts that use [DAO authorization](../protocol-doc/common/auth.md). The account needs the relevant permission at the target.

**External actions** interact with contracts whose authorization is managed separately, such as token contracts and protocols. Transferring ERC-20 tokens calls the token contract; the account's balance and the token's transfer rules determine whether it succeeds.

The catalog contains many Basic actions for account-native functions, and also Basic actions for external calls such as token transfers. A friendly form helps users prepare and read a call; the target's authorization rules determine whether the account may perform it.

## Action order and failures

Each action is prepared independently. The builder validates individual inputs, but does not check how one action changes the conditions for another. During execution, actions run in array order, so a later action sees the changes made by earlier actions.

For example, changing a three-member multisig with a threshold of three into a two-member multisig requires lowering the threshold before removing a member. Removing the member first fails because the remaining membership cannot meet the current threshold. The [membership rule](../protocol-doc/plugins/multisig-plugin/membership.md#minapprovals-and-the-member-count) applies at each call.

The app prepares proposal and direct-execution batches so every action must succeed. If one action fails, the execution transaction reverts and all changes made by earlier actions in that batch are rolled back. For a proposal, that execution attempt fails even if governance has already approved it.

[Action simulation](../application/action-simulation.md) tests the whole array through its intended execution route and can help identify these failures before submission. Its result reflects the state used for the simulation; balances, permissions, and other contract state can change before execution.
