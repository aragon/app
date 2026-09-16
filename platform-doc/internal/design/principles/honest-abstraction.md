---
type: principle
title: Honest abstraction
tags: [principles, abstraction, transparency, cross-cutting]
status: draft
source: product-owner briefing (2026-07-29, see log.md) + product-owner semantic-anchor review (2026-09-10, see log.md) + product-owner briefings (2026-09-11, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Honest abstraction

Honest abstraction is the [platform design principle](../principles.md#product-model-and-interface) that governs how the app makes onchain reality understandable. Users trust Aragon to curate that human-level model, so the abstraction must preserve the state and consequences they need to make an informed decision.

Most people cannot be expected to understand smart contracts, wallet behavior, or the mechanics of the EVM, yet that machinery is what every wallet signature they provide commits them to. Managing that gap is the app's responsibility.

## The calibration

Over-abstraction hides relevant reality and becomes dishonest. Under-abstraction exposes detail without giving people a workable model. Product concepts such as a [governance process](../../../governance/process.md) and a [body](../../../governance/body.md) are valuable because they make governance understandable, even though they are not protocol objects.

Technical transparency therefore wins over pure accessibility, but it is bounded: show the user-relevant model, state, and consequences, not every implementation distinction.

## Abstract, then offer a drill-down

When several actions are batched into one [`DAO.execute`](../../../protocol-doc/core/execution.md) transaction, a wallet may present only an opaque outer call with nested calldata. The convenience of batching must not conceal the consequence from a signer.

Start with the product-level representation a person can understand and act on. When the onchain fact, encoded call, or source record behind it matters, offer a route to it without making that detail the default view. The abstraction can stay simple because it never has to substitute for the authoritative fact; a person who wants the fact can still reach it.

Exhaustive implementation detail does not belong in the first view, but a person who needs to verify a consequential fact must be able to get there. A drill-down satisfies both. It adds a route to the record, not a new concept for the interface to teach, and it earns its place by what it lets a person verify.

This boundary complements [every element makes a claim](./every-element-makes-a-claim.md): the drill-down affordance must earn its place in context, while its target need not be surfaced by default.

### Instances

- The [action builder](../../../application/action-builder.md) moves from a basic view to decoded calldata and then raw calldata when each additional level is available.
- [Transactions](../../../treasury/transactions.md) links transfers to the block explorer and lets a user export an execution's complete action set as JSON.
- [Proposal identifiers](../../../governance/proposal-identifiers.md) distinguishes the readable slug from the onchain identifier; the proposal's Details panel copies the complete ID and links its publication to the creation transaction.
- [Executing on a linked account](../../../accounts/executing-on-a-linked-account.md) decodes nested calls so voters can inspect what will ultimately run.
- Address displays in governance-body summaries, settings, and the [Permission Viewer](../../../access-control/permission-viewer.md) can reveal the full checksummed address behind a compact value or name ([Address display](../../../application/address-display.md)).
- [Process details](../../../governance/process.md#process-details-page) connects readable authorized-action names to their selectors and target contracts; [Permission Viewer](../../../access-control/permission-viewer.md#permissions-page) exposes full permission IDs, actors, targets, and condition addresses through its list details.
- [Assets](../../../treasury/assets.md) and [gauge details](../../../governance/gauge-voting.md#gauges-page) link token or destination identities to their network's explorer records.
- [Action simulation](../../../application/action-simulation.md) links a likely-success or likely-failure verdict to the Tenderly result that supports it.

## Where the abstraction reaches its limit

- Creating [advanced governance](../../../governance/governance-designer.md#the-advanced-flow) requires working with the Aragon team. The app provides an **On request** handoff for that setup.
- Existing conditions and interactions between sub-plugins and the staged proposal processor can exceed what the app can honestly explain. In those edge cases, the [reach-out pattern](../../../application/getting-help.md#when-the-app-needs-the-aragon-team) is more honest than inventing a misleading simplification.
