---
type: opportunity
title: Rebasing-token balance freshness
tags: [treasury, indexing, data-freshness, rebasing-tokens]
status: candidate
source: product-owner feedback, 2026-07-28
---

# Rebasing-token balance freshness

This is a product-discovery candidate, not a roadmap commitment or a statement of the current [Assets](./assets.md) user promise.

## Opportunity

Assets refreshes a held token's balance when the indexer observes an ERC-20 `Transfer` involving the account. Some balances, including rebasing-token balances, can change without such an event. Explore whether those balances need another freshness path.

## Before ticketing

- Establish whether this produces material user-facing inaccuracies.
- Determine whether affected tokens can be identified reliably, or whether a solution must avoid depending on an exhaustive token list.
- Assess the operational cost and reliability of possible refresh strategies.
