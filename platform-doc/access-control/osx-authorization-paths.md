---
type: reference
title: OSx authorization paths
tags: [access-control, semantics]
source: product-owner ACL one-pager (2026-08-03) + product-owner authorization-model review (2026-08-04, see log.md) + product-owner authorization-mapping review (2026-08-05, see log.md) + product-owner access-control structure review (2026-08-05, see log.md) + protocol-doc dao/permissions/execution/auth/plugins pages + osx source
---

# OSx authorization paths

An OSx authorization path is the sequence of callers and permission checks from a governance [plugin](../governance/plugin.md), through the `DAO` (the organization's [account](../accounts/account.md)), to a protected function. Within one organization, the DAO is the shared access-control authority: it owns the permission table used by its own guarded functions and by `DaoAuthorizable` contracts that defer to it.

For the generic meanings of caller, target, and selector, see [Authorization and execution model](./authorization-and-execution.md); for the product rationale for scopes, see [Scoped authority](./scoped-authority.md). The upstream pages own the full mechanics of [the DAO](../protocol-doc/core/dao.md), [execution](../protocol-doc/core/execution.md), [permissions](../protocol-doc/core/permissions.md), and [DAO-based authorization](../protocol-doc/common/auth.md).

## Trace a standard plugin execution

Start with the exact plugin, DAO, action target, and calldata (including its selector when present). Whether an approved action can run depends on authorization at `DAO.execute` and, if the action target function is guarded, at that target.

```text
plugin P calls DAO D.execute(actions[])
                  |
                  | D checks P's EXECUTE permission
                  v
           DAO D calls target T
                  |
                  | if guarded, T evaluates D under T's own access control
                  v
             target function
```

At the first boundary, the DAO resolves a permission entry with this shape:

```text
(where, who, permissionId) -> allow | condition | unset
```

`data` is not stored in that tuple. It is the full calldata supplied to `hasPermission`; when the entry holds a [condition](../protocol-doc/common/permission-conditions.md), the DAO asks it to evaluate `(where, who, permissionId, data)` at call time.

| Check | `where` | `who` | Permission or authority to inspect |
| --- | --- | --- | --- |
| Plugin P calls `D.execute` | DAO D | Plugin P | `EXECUTE_PERMISSION_ID`; use the full encoded `execute` call as condition data. |
| DAO D calls action target T | Not a DAO permission tuple by default | DAO D | T's own guard and authority configuration, if the function is guarded. |
| Caller C invokes a guarded plugin function on P | Plugin P | Caller C | The plugin's function-specific permission ID, resolved by D through `DaoAuthorizable`. |

For an [`ExecuteSelectorCondition`](../protocol-doc/helpers/condition-library/execute-selector-condition.md), every action in the batch must be allowed. A function call needs its target-selector pair allowed; if it also carries native value, it needs that target's native-transfer allowance too. A pure native transfer uses the target allowance alone, while an action with neither selector-bearing calldata nor value denies the batch. Nonempty calldata shorter than four bytes also denies the batch, even when the action carries native value. Other conditions receive the same permission context but define their own rule. A successful Execute check authorizes the DAO to attempt the batch; it does not authorize the DAO at each downstream target.

`DAO.execute` performs each action with an ordinary `CALL`, so T sees D as its caller. Inspect T's own ownership, role, or shared-authority rule against D; an unguarded target has no additional authorization decision at that boundary.

## Guarding plugin functions with the DAO's authority

For a guarded plugin function, [`DaoAuthorizable`](../protocol-doc/common/auth.md) stores the DAO reference and has its `auth` modifier call:

```text
dao.hasPermission(address(this), _msgSender(), permissionId, _msgData())
```

The permission is stored on the DAO, but `where` is the plugin. Trace a plugin function with `(where = P, who = C, permissionId)` and its full plugin-function calldata, not with D's Execute tuple. This is a separate check from P calling `D.execute`.

## ROOT administers the DAO permission table

`ROOT_PERMISSION_ID` gates `grant`, `grantWithCondition`, `revoke`, and the batch permission functions. It controls the DAO's permission table; it is not a runtime bypass for `EXECUTE_PERMISSION_ID` or any other guarded function. A ROOT holder can change those entries, including by granting itself another permission. A condition on a ROOT grant constrains that permission-management path.

When D holds ROOT on itself, an action targeting D's `grant` or `revoke` is a self-call: `DAO.execute` calls D, so the permission check sees `(where = D, who = D, permissionId = ROOT_PERMISSION_ID)`. This works because `DAO.execute` blocks re-entry only into `execute`; a self-call to another DAO permission function remains valid. See [where ROOT ends up](../protocol-doc/core/dao.md#where-root-ends-up) and [ROOT in the permission system](../protocol-doc/core/permissions.md#root-the-permission-to-manage-permissions) for the lifecycle and restrictions.

## SPP callback through GlobalExecutor

For an automatic SPP body, executing the body's sub-proposal can call `reportProposalResult`. SPP accepts reports from any address, but it tallies a report only for an address registered as a body. When the registered body is plugin P, the callback action must therefore reach SPP with P as its caller to be counted for that body.

With its default `Call` target, P sends actions through D, so their targets see D as caller. A `TargetConfig` using `DelegateCall` through the shared GlobalExecutor instead runs the executor loop in P's context; SPP then sees P as the caller of `reportProposalResult`. This is the identity-sensitive SPP callback path, not a replacement for the normal DAO Execute route. See [`TargetConfig`](../protocol-doc/framework/plugins.md#how-a-plugin-makes-the-dao-act), [GlobalExecutor](../protocol-doc/core/execution.md#the-standalone-executor), and [SPP body integration](../protocol-doc/plugins/spp-plugin/composing-bodies.md).
