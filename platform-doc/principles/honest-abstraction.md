---
type: principle
title: Honest abstraction
tags: [principles, abstraction, transparency, cross-cutting]
status: draft
source: product-owner briefing (2026-07-29, see log.md)
---

# Honest abstraction

Within the [platform design principles](../principles.md), honest abstraction governs how the app serves on-chain reality while making it usable by people. Users trust Aragon to curate that human-level model, so the abstraction must preserve the state and consequences they need to make an informed decision.

Most people cannot be expected to understand smart contracts, wallet behavior, or the mechanics of the EVM, yet that machinery is what every wallet signature they provide commits them to. Managing that gap is the app's responsibility.

## The calibration

Over-abstraction hides relevant reality and becomes dishonest. Under-abstraction exposes detail without giving people a workable model. Product concepts such as a [governance process](../governance/process.md) and a [body](../governance/body.md) are valuable because they make governance understandable, even though they are not protocol objects.

Technical transparency therefore wins over pure accessibility, but it is bounded: show the user-relevant model, state, and consequences, not every implementation distinction.

## Where the abstraction reaches its limit

- The [advanced governance designer](../governance/governance-designer.md) is not a general app flow because, at that depth, a simple abstraction and faithful representation can conflict.
- Existing conditions and interactions between sub-plugins and the staged proposal processor can exceed what the app can honestly explain. In those edge cases, the [reach-out pattern](../design/reach-out-to-the-team.md) is more honest than inventing a misleading simplification.
- When several actions are batched into one [`DAO.execute`](../protocol-doc/core/execution.md) transaction, a wallet may present only an opaque outer call with nested calldata. The convenience of batching must not conceal the consequence from a signer.

## Abstract, then offer a drill-down

Do not front-load exhaustive technical detail. [Abstract, then offer a drill-down](../design/abstract-then-drill-down.md) to the authoritative fact when people need it: a decoded call, raw calldata, or a block-explorer link. A drill-down is an on-demand route to relevant reality, not a reason to introduce every internal concept into the primary experience.

This boundary complements [every element makes a claim](../design/every-element-makes-a-claim.md): the drill-down affordance must earn its place in context, while its target need not be surfaced by default.
