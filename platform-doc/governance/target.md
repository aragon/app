---
type: concept
title: Target
tags: [governance, semantics]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + app and osx source verification (2026-08-04, see log.md)
---

# Target

A governance [plugin](./plugin.md) has a configured **execution endpoint and operation** for its approved [actions](./action.md). In protocol terms this is its [`TargetConfig`](../protocol-doc/framework/plugins.md#how-a-plugin-makes-the-dao-act): a target address plus `Call` or `DelegateCall`. The product calls this the plugin's **process target**, but that target is not always an [account](../accounts/account.md).

The default route is `Call` to the plugin's own DAO. The plugin calls `DAO.execute`, and the DAO account makes the action calls as itself. A plugin can also use `DelegateCall` with the shared GlobalExecutor so its actions run in its own context, or `Call` another executor exposing the same entry point.

## How a plugin's approved actions shape process and body

The two product configurations documented today are:

- **Calling its own DAO** — the plugin carries its decision to execution on the account by itself, so it is a [process](./process.md).
- **Reporting into the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md)** — the plugin's approved action reports its result into the pipeline instead of completing execution on the account, so it represents a [body](./body.md) in that wider process. The processor is the target of that action, not the plugin's own route. SPP counts the report for a plugin body only when it arrives from that body's address; [OSx authorization paths](../access-control/osx-authorization-paths.md#spp-callback-through-globalexecutor) owns how the `DelegateCall`/GlobalExecutor route preserves that caller identity. A body that is not a plugin has no route to configure and reports directly ([Safe as a body](./safe-as-a-body.md)).

That classification depends on what a plugin's approved actions accomplish in the wider governance flow, not on its `TargetConfig.target` being an account.

## Process target vs action target

The process target above is distinct from an individual action's target, the `Action.to` address of one call:

- In the normal route, the plugin calls the process target `DAO.execute`, then the DAO calls each action target.
- In a `DelegateCall` route, the plugin borrows execution code from the process target, then each action target sees the plugin as caller.

Each guarded function evaluates the caller at its own call ([authorization and execution model](../access-control/authorization-and-execution.md)). Cross-account execution — a proposal whose action target is *another* account's `execute` function — turns on the individual action, not the process target (see [executing on a linked account](../accounts/executing-on-a-linked-account.md)).
