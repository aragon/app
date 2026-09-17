---
type: concept
title: Scoped authority
tags: [access-control, semantics]
source: initial briefing (2026-07-13 scaffold, see log.md) + aragon-knowledge-base protocol/mechanisms/permission-management.md + execute-selector-condition.md (first-slice brain dump, 2026-07-06) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner ACL one-pager (mined 2026-08-03 and 2026-08-04, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app/protocol verification + product-owner scope answer and authorization-model review (2026-08-04, see log.md) + product-owner permission-model review (2026-08-05, see log.md) + product-owner access-control structure review (2026-08-05, see log.md) + product-owner Permission Viewer launch briefing and app/backend verification (2026-08-28, see log.md)
---

# Scoped authority

Scoped authority limits a [governance process](../governance/process.md) at an [account's](../accounts/account.md) execution boundary to an explicit set of calls and, when supported, constraints on their arguments or native-token value. This lets an organization divide responsibility between processes while external contracts continue to recognize one account.

Scoped authority is a product rule for preserving separation of powers as an account's authority is composed and changed. The [authorization and execution model](./authorization-and-execution.md) defines the actors and call boundaries; [OSx authorization paths](./osx-authorization-paths.md) maps the rule to Aragon's contracts; and the protocol docs define the underlying [permission triples and conditions](../protocol-doc/core/permissions.md).

## The execution-boundary premise

In the usual Aragon path, a process approves a batch of [actions](../governance/action.md), calls `DAO.execute`, and the DAO account calls each action target as itself. Each target therefore applies its access-control rules to the DAO address, not to the process that selected the action. External targets can give the account ownership, roles, or managed authority while the account's own permission configuration determines which processes may direct it.

Because the [account](../accounts/account.md) is also the [treasury](../treasury/vault.md), limiting the calls a process may direct limits the treasury operations and externally granted powers it can exercise through that address.

[OSx authorization paths](./osx-authorization-paths.md) owns the caller path, permission checks, and ROOT administration. This page focuses on the scope a process receives at the account boundary.

## Prevent executor collapse

A bare `EXECUTE_PERMISSION_ID` grant places no target or calldata restriction at the DAO boundary. When its holder calls `DAO.execute`, downstream guards see the DAO as caller; those guards, balances, and contract state still determine which calls complete.

Scoped authority puts an Execute condition on that grant so the executor may forward only the selected calls. In OSx, an [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md) evaluates every action inside `DAO.execute` against configured selector and native-transfer allowances; [OSx authorization paths](./osx-authorization-paths.md#trace-a-standard-plugin-execution) owns the exact call cases. The batch passes only when every action passes. The configured scope can keep a process's authority aligned with its assigned responsibility.

## Set an explicit scope

A selector allowlist names the target contract and function selector a process may use. It can start empty, making the conditioned grant a default-deny grant until an allowed pair is added. Removing a pair withdraws that action scope.

A selector limits the function class, not its arguments. `ExecuteSelectorCondition` can also control whether an action may carry native value to a target, but it does not cap the amount. A specific recipient, token amount, native-token amount, or other argument requires a condition that evaluates the relevant calldata or value. A process receives only the guarantee the configured condition can enforce.

## Separate responsibilities without changing the account

Each organization can assign independent scopes to its processes: treasury operations to one, protocol parameters to another, and permission configuration to another. The onchain grants and conditions make that division inspectable independently of the app. A scope can move to a different process while assets remain held at the same address and external targets continue to recognize that address; [gradual permission handover](./gradual-permission-handover.md) applies this principle to selected powers.

In OSx, the DAO combines the organization's shared permission authority, general-purpose execution account, stable identity, and treasury. Separate governance plugins can receive independently scoped Execute grants into that account, so several processes can hold distinct powers over one treasury.

OpenZeppelin [`AccessManager`](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management) is also shared access control. Its core policy assigns caller roles to target-function selectors, with optional delays and a `schedule`/`execute` route. An `AccessManaged` target called directly authorizes the original caller, while a call routed through `AccessManager.execute` reaches the target with `AccessManager` as the caller after the manager authorizes or schedules the original caller. OSx records `(where, who, permissionId)` grants and can attach a condition that evaluates the full data supplied to the permission check; a permission ID names a capability independently of function selectors.

In an AccessManager-based architecture, the designer separately chooses which component holds assets and broader execution authority. [`GovernorTimelockAccess`](https://docs.openzeppelin.com/contracts/5.x/api/governance) connects a Governor to the manager's workflow while the Governor can retain its assets and permissions. The comparable separation can therefore be composed from OpenZeppelin contracts; OSx provides the organization-specific account, treasury, permission authority, and execution boundary together in the DAO.

## Change authority through configuration

Granting, revoking, and conditioning permission entries, or changing an execute-condition allowlist, are permission and configuration actions. They change authority configuration and condition state; they do not upgrade the account's or a target's implementation code. The governed ROOT route for those actions belongs to [OSx authorization paths](./osx-authorization-paths.md#root-administers-the-dao-permission-table).

The [governance designer](../governance/governance-designer.md#choosing-authorized-actions) sets a new process's initial scope: **Any action** gives it a bare Execute grant, while **Specific actions** creates a selector-scoped grant. The [action builder](../governance/action-builder.md) owns how governed change actions are composed. [Permission Viewer](./permission-viewer.md) presents the account-wide indexed grants and conditions, while the process details page presents the selected authorized actions for one process.
