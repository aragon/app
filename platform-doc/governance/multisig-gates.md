---
type: concept
title: Multisig gates
tags: [governance, semantics, access-control]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner briefings (2026-09-11, see log.md); consolidated source provenance in log.md (stages consolidation, 2026-09-15)
---

# Multisig gates

A **multisig gate** is a Safe or an Aragon multisig plugin ([Safe vs Aragon multisig](../guides/safe-vs-aragon-multisig.md)) serving as the **governing body of a [stage](./stage.md)** in a [staged governance process](./proposal.md#staged-proposals), gating what comes before or after that stage. For a Safe acting as a stage’s body, see [Safe as a body](./safe-as-a-body.md).

The recurring ask behind this pattern is a multisig able to **create a proposal** — not one that creates or installs a governance process itself; process creation is covered by the [governance designer](./governance-designer.md).

## Why gate at all

Governance that requires affirmative participation in routine decisions can create significant coordination and transaction overhead. A multisig approval stage adds a structured sign-off before or after a wider vote. A [body](./body.md) can instead take a passive veto role through [optimistic governance](./optimistic-governance.md). That is a related safeguard, not another name for the multisig pattern here: an optimistic configuration need not use a multisig at all.

People commonly equate "voting" with token voting specifically — a distinct process involving token holders. Aragon treats governance more broadly: governance is decision-making, and a multisig is part of governance. A multisig governing a stage, or creating a proposal, is not outside governance — it is a governance body like any other.

## Before Token Voting

A multisig can govern **stage one**, with [Token Voting](../protocol-doc/plugins/token-voting-plugin.md) governing stage two: the multisig's threshold gates advancement into the token vote, and [proposal creation](./proposal-creation.md) can be restricted to the multisig's own [members](./member.md#membership-and-participation).

The experience-level phrasing "the multisig creates the proposal" hides a more precise flow: the proposal already exists on the staged process the moment it is created, and the multisig's approval is what lets it advance into the Token Voting stage. A multisig able to create a proposal that then advances into Token Voting is effectively approving that proposal first — this is exactly what a [staged process](./proposal.md#staged-proposals) is for.

## After Token Voting

A multisig can also govern a stage **after** Token Voting in either role. As an approval body, it creates a final approval gate before execution. As a vetoing body, it gives a security council or another stakeholder group a protected objection window after token holders approve. These are separate configurations; the product does not assign a security council one universal role.

The phrasing "the multisig executes the proposal" hides the same kind of simplification: the multisig does not execute — its result either satisfies an approval requirement or reaches a veto condition before execution becomes available. Execution is its own function, covered on [proposal](./proposal.md).

## At any point in the process

A multisig can gate a stage anywhere in a longer staged process, according to the organization's governance design — not only immediately before or after Token Voting. The product handles the conditions this requires and lets the designer configure who can create the overall proposal (see [proposal creation](./proposal-creation.md)).

## Changing an installed gate

An installed Aragon multisig body's roster and approval threshold can be changed through [membership and settings actions](../application/basic-action-views.md#multisig-membership-and-rules). Review those changes together: removing members can require a preceding threshold change, and existing proposals retain their membership snapshots.

## Stages over direct permission grants

A multisig can gate a process in two ways. As a body inside a stage, its decision is part of the process and appears on the [proposal page](./proposal.md#voting). As the address holding the process's [proposal-creation](./proposal-creation.md) or execution permission directly, with no stage involved, it gates the same proposal through a bare permission grant ([authorization and execution model](../access-control/authorization-and-execution.md)). Both arrangements are supported and can lead to the same proposal outcome; the difference is whether the multisig's part in deciding is modeled as part of the process or left as a permission that the governance UI has no stage to show.

Represent each multisig role explicitly as its own stage, so the proposal page shows the complete process end to end — where the proposal is, and what still has to happen. A direct grant reaches the same outcome with fewer configured parts, but it removes the multisig's role from that view. The app supports the arrangement and shows who is eligible to create or execute either way; what disappears is the stage that would tell anyone reading the proposal page that the multisig stands between the proposal and its outcome. Choose a direct grant only when the account deliberately wants that role to sit outside the visible staged process.

### Direct creation grant to a Safe

Of the two multisig kinds, only a Safe can take a direct creation grant: a Safe is an [account](../accounts/account.md), so it can hold a permission and act on it directly, which an Aragon multisig cannot ([below](#an-aragon-multisig-outside-a-stage)). The [governance designer](./governance-designer.md) does not offer this grant, although it is the arrangement closest to a literal "let the multisig create but not vote" request. It takes an [Admin](./admin-flow.md) route instead: install the process under Admin control with proposal creation open to anyone, then have a separate Admin proposal revoke that open grant and grant creation specifically to the [Safe](../accounts/safe.md). The Safe [connects to the app](../application/connecting-a-safe.md) and creates the proposal from within the Safe.

The creation variant also carries a review problem. The Safe transaction that creates the proposal is itself a `Create Proposal` call, with the proposal's real [actions](./action.md) nested inside that call's own action array, even though those actions are the proposal's actual content. The Safe side shows that calldata raw, with none of the basic or decoded action presentation of the [action builder](../application/action-builder.md), so signers need other tools to work out what the proposal would do. A Safe-side simulation of the transaction, for example in Tenderly, mainly shows that the Safe can call `Create Proposal`; it would likely succeed even if the eventual proposal's actions are invalid, so it does not answer what a signer needs to know. [Action simulation](../application/action-simulation.md) bypasses the proposal wrapper and simulates the actions' own execution route.

### Direct execution grant to a Safe

The same shape applies to execution: grant execute on the process to the Safe and revoke it from everyone else. The app supports this arrangement, and [proposal](./proposal.md#actions-and-execution) covers what ineligible users see. It carries the transparency cost — the Safe's role does not appear as a stage on the proposal page — but not the review problem: signers approving an execution are not reading nested proposal calldata, which is why the creation variant is the materially worse of the two.

This is still execution *on the process*, a passed proposal's execution step. Executing on the account directly, outside every process, is a different grant with its own surface: [create transaction](../treasury/create-transaction.md).

### An Aragon multisig outside a stage

An [Aragon multisig](../protocol-doc/plugins/multisig-plugin.md) is a governance plugin, not an account: it has no independent entry point for holding and acting on an isolated permission the way a Safe does. For it to perform one isolated action on another process — create or execute a proposal — it would need to exist as its own governance process merely to route that action through its configured [execution path](./target.md#plugin-targets). The normal path uses the account as the caller; an alternate `DelegateCall` path can run as the plugin, but neither gives the multisig a Safe-like generic account interface. That reproduces what the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) already does, with added indirection, and is not recommended whether or not it can be made to work. Give an Aragon multisig its role as a stage body instead.

## Worked recommendations

- **Safe:** Safe as the sole body in stage one ([Safe as a body](./safe-as-a-body.md)), Token Voting in stage two, with Safe owners eligible to create the proposal.
- **Aragon multisig:** Aragon multisig as the sole body in stage one, Token Voting in stage two, with only Aragon multisig members eligible to create the proposal.

Aragon can configure both shapes through its [advanced-governance setup](./governance-designer.md#the-advanced-flow): the Aragon multisig as a plugin body, the Safe via the add-body **any address** option ([governance designer](./governance-designer.md#adding-a-body), [Safe as a body](./safe-as-a-body.md)).

If a proposed gate depends on conditions or interactions the staged model cannot explain faithfully, follow the [staged-process escalation path](./process.md#configuration-options) rather than treating it as an ordinary multisig configuration.
