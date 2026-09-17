---
type: guide
title: Choose between a Safe and an Aragon multisig
tags: [governance, accounts, semantics]
status: draft
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + product-owner authorization-model review (2026-08-04, see log.md)
---

# Choose between a Safe and an Aragon multisig

Choose the multisig shape that fits the role you need in Aragon: an existing Safe account or an Aragon multisig plugin installed on the account. Governance discussions often call both "a multisig," but they have different capabilities and fit different governance patterns.

Before you choose, decide whether the multisig must be an independent account that can hold permissions and act as itself, or a governor that operates through an Aragon governance process or stage. See the canonical definitions of [Safe](../accounts/safe.md) and the [Aragon multisig plugin](../protocol-doc/plugins/multisig-plugin.md) for their underlying mechanics.

## 1. Choose the role

- **Choose a Safe when the multisig must be an account.** A Safe can hold a permission grant directly and act on it itself. It can also serve as a governing [body](../governance/body.md) in a staged process ([Safe as a body](../governance/safe-as-a-body.md)).
- **Choose an Aragon multisig when the account should install a multisig governor.** The plugin records member approvals and applies its configured threshold. In the normal routes it passes approved actions to the account for execution, making it a [process](../governance/process.md), or reports its result into a staged pipeline, making it a [body](../governance/body.md). It does not expose an independent generic arbitrary-call capability or hold the treasury as an account.

## 2. Place it in the governance process

When the multisig should gate a governance process, represent its decision as an explicit stage wherever possible. This keeps the multisig's role visible in the process whether the stage uses a Safe or an Aragon multisig. See [multisig gates](../governance/multisig-gates.md) for the worked pattern and [stages over direct permission grants](../governance/stages-over-direct-permissions.md) for why the staged form is preferred.

A direct proposal-creation or execution grant outside the staged process works only for a Safe acting as an account. An Aragon multisig has no independent generic entry point for using an isolated permission; anything it does follows its governance process and configured execution route. An alternate `DelegateCall` route can run actions in the plugin's context, but it still does not turn the plugin into an independent account.

## Continue with the selected route

You have completed this choice when you know whether the governance design uses a Safe account or an installed Aragon multisig plugin, and whether it participates as a visible stage. To use a Safe, see [connecting a Safe](../accounts/connecting-a-safe.md) and [Safe as a body](../governance/safe-as-a-body.md). To install an Aragon multisig or place either kind in a staged process, continue with the [Governance Designer](../governance/governance-designer.md) or the guide to [add a multisig gate](./multisigs-in-advanced-governance.md).
