---
type: concept
title: Proposal identifiers
tags: [governance, semantics, naming]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner briefings (2026-08-04, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Proposal identifiers

A [proposal](./proposal.md) carries two identifiers: an onchain one the protocol works with, and a friendly one the app displays.

## The onchain proposal ID

This is what the plugins actually know. When a body sends a result for a proposal — a [Safe](./safe-as-a-body.md) included — it sends it against this ID; results are reported and checked against it. It is a long, unfriendly integer, [derived rather than sequential](../protocol-doc/common/proposal.md#proposal-ids-are-derived-not-sequential).

## The slug

The **slug** combines a process key with an offchain proposal number, for example `PIP-3`. At [process](./process.md) creation, the [governance designer](./governance-designer.md) collects the key in the process’s IPFS metadata. The indexer reserves a key for that process within its account and network, appending a suffix when another process already uses it. Different accounts or networks can use the same slug.

The indexer assigns each new proposal one more than the largest stored proposal number for its plugin and network, starting at 1. Reprocessing an already stored proposal creation leaves that record and its number unchanged. This number depends on the indexer’s stored history; it carries no guarantee of identical numbering after that history is rebuilt or of collision-free allocation across concurrent writers.

Changing the process key through metadata changes the friendly slugs of its existing proposals too. The proposal-details URL resolves the current slug in the owning account and network; substituting the bare onchain proposal ID does not provide an alternative route. Links to linked-account proposals use that account’s own context.

For a durable onchain reference, retain the network, plugin address, and onchain proposal ID together. A friendly slug alone does not identify a proposal globally or permanently.

The proposal's **Details** panel provides a copy control for the complete onchain proposal ID, even when the displayed number is shortened. **Published** opens the creation transaction in the block explorer. The process's contract address is available from its [Process details page](./process.md#process-details-page).
