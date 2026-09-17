---
type: concept
title: Proposal
tags: [governance, semantics]
status: draft
source: aragon-knowledge-base first-slice brain dump, 2026-07-06 (assembled from mentions across pages; no dedicated source page) + product-owner briefings (2026-07-28, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Proposal

The product's unified view of decision-making items across proposal-producing governance setups. The protocol's [proposal interface](../protocol-doc/common/proposal.md) (`IProposal`) lets the product handle proposals consistently no matter which plugin produced them. It unifies plugins that produce proposals; it does not define the boundary of governance itself. [Gauge voting](./gauge-voting.md), for example, is a governance plugin with no proposal objects or proposal lifecycle.

Each proposal belongs to one [process](./process.md), carries human-readable metadata and an optional ordered batch of [actions](./action.md), and moves through a process-defined lifecycle. A proposal with no actions is a **signaling proposal**: its governance and voting remain onchain, but there is no action batch to execute, so a successful signaling proposal ends as **ACCEPTED** and never becomes **EXECUTABLE** ([proposal status](./proposal-status.md)).

Every proposal also carries two identifiers, an on-chain one and a friendly one — see [proposal identifiers](./proposal-identifiers.md).

Two product facts hang off this:

- **The proposals [datalist](../design/datalist-page.md) is partitioned by [process](./process.md)**: each process appears as its own tab once its installation completes. When more than one process is available, **All proposals** is the leading, default aggregate tab; there, the proposal's [process key](./proposal-identifiers.md), as part of its friendly slug, is the primary indicator of which process produced it. Selecting a process tab narrows the list to that process. The app's vocabulary for a tab is a **proposal type** — partitioning by proposal type is essentially partitioning by process. A body-only plugin (one feeding a staged process) does not get its own tab — the staged process it belongs to does. Proposals from a [linked account](../accounts/linked-account.md) are added into this same per-type list, without introducing another hierarchy level.
- **Not everything using the interface is a proposal in spirit.** Admin actions ([admin management](../accounts/admin-management.md)) execute instantly in a single transaction — the proposal shape is used purely for consistency of handling.

## Product surfaces

Whatever plugin produced it, a proposal gets the same core surfaces:

- **Create** — [proposal creation](./proposal-creation.md) selects the owning process, applies its creation-eligibility rules, collects metadata, actions, and any process-specific settings, then submits the create-proposal transaction.
- **Vote** — members of the deciding [body](./body.md) choose their vote directly on the proposal page rather than entering a wizard. The same applies to per-stage sub-proposals when the process is staged ([staged proposals](./staged-proposals.md)).
- **Simulate** — available both during creation and from the proposal page. The proposal supplies an already-bundled action array and its process context to the proposal-independent [action simulation](./action-simulation.md), which tests whether the actions will work rather than replaying the governance decision.
- **Execute** — execution is a separate function from voting or approving: the lifecycle action appears once the process's governance conditions are satisfied, but caller eligibility is a separate check. Some supported plugin versions protect the call with `EXECUTE_PROPOSAL_PERMISSION`; the app checks the connected wallet against that DAO permission and blocks an unauthorized attempt while keeping the expected action visible ([control availability](../design/control-availability.md)). Older plugin versions leave execution open and do not need the permission check. A restricted grant can, for example, be held directly by a [Safe](../accounts/safe.md) instead of represented by a visible stage ([stages over direct permissions](./stages-over-direct-permissions.md)).

Whatever the surface, a proposal displays an app-derived [status](./proposal-status.md) — active, executable, rejected, and so on — computed from chain state rather than stored on chain (admin proposals, executing instantly, are the exception).
