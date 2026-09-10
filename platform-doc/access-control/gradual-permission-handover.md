---
type: pattern
title: Gradual permission handover
tags: [access-control, governance]
source: product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app/protocol verification (2026-08-04, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + product-owner access-control structure review (2026-08-05, see log.md)
---

# Gradual permission handover

Gradual permission handover is an optional pattern for transferring explicit action scopes between [governance processes](../governance/process.md) over time. It applies [scoped authority](./scoped-authority.md) to an [account](../accounts/account.md): each process receives the calls it may direct, and an organization can move one scope to another governance route as its risk, operating needs, and readiness change.

## Transfer scopes independently

The organization first identifies the action scopes that carry distinct responsibility: for example, routine treasury operations, a protocol parameter, or emergency intervention. It assigns each scope to the governance route that fits the relevant risk and operating readiness. When that assessment changes, the organization transfers the selected scope through the governance route currently authorized to make that change.

The scopes move independently. A multisig can retain emergency authority while a narrower operational scope moves to an [optimistic process](../governance/optimistic-governance.md), or a process that lets token holders decide. The account remains the same onchain identity throughout; the change is which process may direct each explicit scope.

## Adapt the pattern to risk and readiness

Each organization chooses the direction and timing for every scope. A scope can remain concentrated, move to an optimistic or token-holder process, or return to an operational process as its risks and required checks change. Each change travels through governance, and the resulting scopes remain independently inspectable onchain.

The [governance designer](../governance/governance-designer.md) sets a new process's initial authorized-action scope. A live organization's authority changes through the process already authorized to apply the relevant configuration action.
