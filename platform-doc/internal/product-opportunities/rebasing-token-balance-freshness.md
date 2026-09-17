---
type: opportunity
title: Rebasing-token balance freshness
tags: [treasury, indexing, data-freshness, rebasing-tokens]
status: candidate
source: product-owner feedback, 2026-07-28
---

# Rebasing-token balance freshness

## User story

As a person managing a treasury that holds rebasing tokens, I want Assets to reflect balance changes that occur without a transfer, so that I can assess the account's holdings using current balances.

## Context + benefit

[Assets](../../treasury/assets.md) refreshes a held token's balance when the indexer observes an ERC-20 `Transfer` involving the account. Rebasing tokens and some other balances can change without such an event, leaving that refresh path unaware of the change.

The candidate would investigate another way to keep affected balances current. If the event-based refresh produces material inaccuracies, an additional refresh path could give treasury operators a more reliable view of their holdings.

Before ticketing, establish the user-visible impact, determine whether affected tokens can be identified reliably or whether refresh must work without an exhaustive token list, and assess the operational cost and reliability of possible strategies.
