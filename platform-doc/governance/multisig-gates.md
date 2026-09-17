---
type: concept
title: Multisig gates
tags: [governance, semantics]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md)
---

# Multisig gates

A **multisig** — a Safe or an Aragon multisig plugin ([Safe vs Aragon multisig](../guides/safe-vs-aragon-multisig.md)) — serving as the **governing body of a [stage](./stage.md)** in a [staged governance process](./staged-proposals.md), gating what comes before or after that stage. This page is the general pattern; a Safe acting as a stage's body specifically is [Safe as a body](./safe-as-a-body.md).

The recurring ask behind this pattern is a multisig able to **create a proposal** — not one that creates or installs a governance process itself; process creation is covered by the [governance designer](./governance-designer.md).

## Why gate at all

Governance that requires affirmative participation in routine decisions can create significant coordination and transaction overhead. A multisig approval stage adds a structured sign-off before or after a wider vote. A [body](./body.md) can instead take a passive veto role through [optimistic governance](./optimistic-governance.md). That is a related safeguard, not another name for the multisig pattern here: an optimistic configuration need not use a multisig at all.

People commonly equate "voting" with token voting specifically — a distinct process involving token holders. Aragon treats governance more broadly: governance is decision-making, and a multisig is part of governance. A multisig governing a stage, or creating a proposal, is not outside governance — it is a governance body like any other.

## Before Token Voting

A multisig can govern **stage one**, with [Token Voting](../protocol-doc/plugins/token-voting-plugin.md) governing stage two: the multisig's threshold gates advancement into the token vote, and [proposal creation](./proposal-creation.md) can be restricted to the multisig's own members.

The experience-level phrasing "the multisig creates the proposal" hides a more precise flow: the proposal already exists on the staged process the moment it is created, and the multisig's approval is what lets it advance into the Token Voting stage. A multisig able to create a proposal that then advances into Token Voting is effectively approving that proposal first — this is exactly what a [staged process](./staged-proposals.md) is for.

## After Token Voting

A multisig can also govern a stage **after** Token Voting in either role. As an approval body, it creates a final approval gate before execution. As a vetoing body, it gives a security council or another stakeholder group a protected objection window after token holders approve. These are separate configurations; the product does not assign a security council one universal role.

The phrasing "the multisig executes the proposal" hides the same kind of simplification: the multisig does not execute — its result either satisfies an approval requirement or reaches a veto condition before execution becomes available. Execution is its own function, covered on [proposal](./proposal.md).

## At any point in the process

A multisig can gate a stage anywhere in a longer staged process, according to the organization's governance design — not only immediately before or after Token Voting. The product handles the conditions this requires and lets the designer configure who can create the overall proposal (see [proposal creation](./proposal-creation.md)).

## The recommended experience

Represent each multisig role explicitly as its own stage, so the [Voting Terminal](../design/voting-terminal.md) shows the complete process end to end — where the proposal is, and what still has to happen. The alternative — granting the multisig a permission directly instead of a visible stage — is [stages over direct permission grants](./stages-over-direct-permissions.md).

A customer's own reasons for wanting a multisig kept out of view — for instance, not wanting its behavior visible to others — are theirs to have; the recommendation to make each role an explicit, visible stage stands regardless.

## Worked recommendations

- **Safe:** Safe as the sole body in stage one ([Safe as a body](./safe-as-a-body.md)), Token Voting in stage two, with Safe owners eligible to create the proposal.
- **Aragon multisig:** Aragon multisig as the sole body in stage one, Token Voting in stage two, with only Aragon multisig members eligible to create the proposal.

Both shapes are directly expressible in the [governance designer](./governance-designer.md)'s advanced flow: the Aragon multisig as a plugin body, the Safe via the add-body **any address** option ([governance designer](./governance-designer.md#adding-a-body), [Safe as a body](./safe-as-a-body.md)).

If a proposed gate depends on conditions or interactions the staged model cannot explain faithfully, follow the [staged-process escalation path](./staged-proposals.md#when-the-model-reaches-an-edge-case) rather than treating it as an ordinary multisig configuration.
