---
type: concept
title: Proposal identifiers
tags: [governance, semantics, naming]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner briefings (2026-08-04, see log.md)
---

# Proposal identifiers

A [proposal](./proposal.md) carries two identifiers: an on-chain one the protocol works with, and a friendly one the app displays.

## The on-chain proposal ID

This is what the plugins actually know. When a body sends a result for a proposal — a [Safe](./safe-as-a-body.md) included — it sends it against this ID; results are reported and checked against it. It is a long, unfriendly integer, [derived rather than sequential](../protocol-doc/common/proposal.md#proposal-ids-are-derived-not-sequential).

## The slug

The app's friendly proposal ID. At [process](./process.md) creation, the [governance designer](./governance-designer.md) asks for a **process key** as part of the process's [metadata input](../design/metadata-input.md) — for example Polygon might choose `PIP` (Polygon Improvement Proposal) — and the process's proposals then follow the same scheme: `PIP-1`, `PIP-2`, `PIP-3`. The key lives in the process's IPFS metadata; the running index is calculated off-chain (there is no on-chain incremental counter), so the slug is a friendly alternative to the on-chain ID, not strictly authoritative. App URLs accept either identifier.

The index should not collide or shift: proposals happen in order, so the count only ever moves forward. If it ever did collide or shift, that would be an indexer bug.
