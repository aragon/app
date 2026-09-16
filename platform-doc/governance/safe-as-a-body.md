---
type: capability
title: Safe as a body
tags: [governance, accounts]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefings (2026-09-11, see log.md) + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and locked connector packages (2026-09-13, see log.md); relocated section provenance in log.md (section-audit observations, 2026-09-13) (2026-09-13; no fresh source verification)
---

# Safe as a body

A [Safe](../accounts/safe.md) can serve as a [stage](./stage.md)'s governing [body](./body.md) — an account, not a plugin, standing in as the decision-maker for that stage. Use [Choose between a Safe and an Aragon multisig](../guides/safe-vs-aragon-multisig.md) for why only a Safe (not an Aragon multisig) fits this role; the pattern this feeds is [multisig gates](./multisig-gates.md).

## In the staged process

Aragon adds a Safe as a stage's body during [advanced-governance setup](./governance-designer.md#the-advanced-flow). The team's add-body **any address** option registers it, and the SPP's install transaction writes it into the stage's **stage config** — the SPP's registration of a stage's [bodies](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md#bodies) — so registration itself has nothing Safe-specific about it.

A Safe is typically the **sole body in a stage that gates a later Token Voting stage** ([multisig gates](./multisig-gates.md) works the recommendation through). [Proposal creation](./proposal-creation.md) can be restricted to the Safe's owners: a connected user must be an owner of the Safe to create the proposal in Aragon — enforced by the app's background [`SafeOwnerCondition`](../protocol-doc/helpers/condition-library/safe-owner-condition.md). Creating the proposal immediately opens stage one.

## Reaching its threshold

The Safe must then reach its required signer threshold and approve before the proposal can advance to stage two:

- Connect to the Aragon app **as the Safe account**, through a custom Safe App or WalletConnect ([connecting a Safe](../application/connecting-a-safe.md)). The connected address must match the Safe registered as the stage's body; connecting an individual owner's wallet does not satisfy that check.
- The proposal page's **Approve** button composes the approval transaction and sends it to the Safe for signing — the app builds the transaction; signers don't construct it themselves.
- Signers review that pending Safe transaction against the proposal in Aragon, comparing the [onchain proposal ID](./proposal-identifiers.md) before they sign.
- The transaction targets the staged proposal processor and reports the stage's result; only a report from an address registered as a body of that stage counts.
- Once reported, the result is indexed and shown in the app: the stage has received this body's result — and, once the stage's threshold is satisfied, the proposal can advance.

Protocol-side, the Safe takes part as a **manual body** of the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) — an external account whose verdict is reported in, via [`reportProposalResult`](../protocol-doc/plugins/spp-plugin/composing-bodies.md#using-a-manual-body-a-safe), rather than read from an installed plugin.

## Recognizing a Safe body

The [advanced-governance setup](./governance-designer.md#adding-a-body) recognizes a Safe by its contract name from backend metadata. It does not establish Safe identity by checking the contract interface. A Safe with an unrecognized name receives generic address treatment and is absent from the list of bodies eligible for a Safe-owner proposal-creation condition.

A different contract with a matching name can receive Safe branding and the Safe-owner proposal-creation option. Publishing that condition also requires the target to answer `isOwner`; this [condition check](../protocol-doc/helpers/condition-library/safe-owner-condition.md) checks the response shape, without proving the target is a Safe.

## How the app presents it

When the app recognizes the body as a Safe, it adds Safe-specific branding and a Safe logo. The logo also identifies the Safe beside the body on the process details page. On the proposal page the Safe renders as one branded external body: as the sole body of a stage it opens directly in detail; in a multi-body stage the summary row can carry its avatar, and selecting it opens its detail with the Safe label and avatar. The **Votes** tab is hidden for external bodies, the action offered is **Approve proposal** or **Veto proposal** according to the body's configured role, and the page gives Safe-specific connection guidance ([connecting a Safe](../application/connecting-a-safe.md)). If the background `SafeOwnerCondition` makes Safe owners eligible to create proposals, the same page shows that eligibility in its proposal-creation section ([proposal creation](./proposal-creation.md)).

## Not on the members list

The [members list](./body.md#members-page) does not show the Safe body at all, a deliberate product choice. On the proposal page the Safe is a **single object** with no owner- or member-level granularity: a Safe typically collects its signatures off-chain in Safe's own infrastructure, and the app does not index that activity, so it has nothing per-owner to show. An Aragon Multisig body differs here, since its indexed approvals can be listed per [member](./member.md).

## What this buys

The state is legible to everyone: the proposal already exists in Aragon, and the token vote visibly has not begun until the Safe stage passes, as the proposal page's stage accordion shows ([staged proposals](./proposal.md#voting)). The trade-off is a fixed governance process with a specific, explicit sequence: the roles are locked in as stages rather than left implicit.

If the surrounding staged configuration relies on conditions or sub-plugin interactions the app cannot represent faithfully, use the [staged-process escalation path](./process.md#configuration-options).
