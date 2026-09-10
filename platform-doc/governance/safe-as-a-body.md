---
type: capability
title: Safe as a body
tags: [governance, accounts]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md)
---

# Safe as a body

A [Safe](../accounts/safe.md) can serve as a [stage](./stage.md)'s governing [body](./body.md) — an account, not a plugin, standing in as the decision-maker for that stage. Use [Choose between a Safe and an Aragon multisig](../guides/safe-vs-aragon-multisig.md) for why only a Safe (not an Aragon multisig) fits this role; the pattern this feeds is [multisig gates](./multisig-gates.md).

## In the staged process

A Safe becomes a stage's body the way any body does: the [governance designer](./governance-designer.md)'s add-body **any address** option registers it, and the SPP's install transaction writes it into the stage's **stage config** — the SPP's registration of a stage's [bodies](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md#bodies) — so registration itself has nothing Safe-specific about it.

A Safe is typically the **sole body in a stage that gates a later Token Voting stage** ([multisig gates](./multisig-gates.md) works the recommendation through). [Proposal creation](./proposal-creation.md) can be restricted to the Safe's owners: a connected user must be an owner of the Safe to create the proposal in Aragon — enforced by the app's background [`SafeOwnerCondition`](../protocol-doc/helpers/condition-library/safe-owner-condition.md). Creating the proposal immediately opens stage one.

## Reaching its threshold

The Safe must then reach its required signer threshold and approve before the proposal can advance to stage two:

- The Safe connects to the Aragon app **as the Safe account** ([connecting a Safe](../accounts/connecting-a-safe.md)).
- The proposal page's **Approve** button composes the approval transaction and sends it to the Safe for signing — the app builds the transaction; signers don't construct it themselves.
- Signers review that pending Safe transaction against the proposal in Aragon, comparing the [on-chain proposal ID](./proposal-identifiers.md) before they sign.
- The transaction targets the staged proposal processor and reports the stage's result; only a report from an address registered as a body of that stage counts.
- Once reported, the result is indexed and shown in the app: the stage has received this body's result — and, once the stage's threshold is satisfied, the proposal can advance.

Protocol-side, the Safe takes part as a **manual body** of the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) — an external account whose verdict is reported in, via [`reportProposalResult`](../protocol-doc/plugins/spp-plugin/composing-bodies.md#using-a-manual-body-a-safe), rather than read from an installed plugin.

## How the app presents it

When the app recognizes the body as a Safe, it adds Safe-specific branding and a Safe logo. The logo also identifies the Safe beside the body on the process details page. If the background `SafeOwnerCondition` makes Safe owners eligible to create proposals, the same page shows that eligibility in its proposal-creation section ([proposal creation](./proposal-creation.md)).

## Not on the members list

The [members list](./body.md) does not show the Safe body at all — a deliberate product choice, revisitable later. On the proposal page, the [Voting Terminal](../design/voting-terminal.md) shows the Safe as a **single object**, never its owners — the rationale is on that page.

## What this buys

The state is legible to everyone: the proposal already exists in Aragon, and the token vote visibly has not begun until the Safe stage passes — the [Voting Terminal](../design/voting-terminal.md) shows exactly this. The trade-off is a fixed governance process with a specific, explicit sequence: the roles are locked in as stages rather than left implicit.

If the surrounding staged configuration relies on conditions or sub-plugin interactions the app cannot represent faithfully, use the [staged-process escalation path](./staged-proposals.md#when-the-model-reaches-an-edge-case).
