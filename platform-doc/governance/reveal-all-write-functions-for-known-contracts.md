---
type: opportunity
title: Reveal all write functions for known contracts
tags: [governance, actions, discoverability]
status: candidate
source: product-owner action-builder briefing (2026-08-05, see log.md) + app source verification at app@122f1bd1
---

# Reveal all write functions for known contracts

This is a product-discovery candidate, not current behavior or a roadmap commitment.

## Opportunity

The [+ Action picker](./action-builder.md#adding-one-action) deliberately shows a curated set of registered functions for contracts the app already knows. The same verified contract may expose further write functions that are valid proposal actions but absent from that default group. An author can reach them today only by choosing **Add contract address** and submitting an address already visible in the picker; the app then retrieves its ABI and merges the remaining write functions into the contract group.

Offer a **Show all** control on a known contract group when its verified ABI contains additional write functions. Expanding in place would preserve the curated first view while making the existing add-the-same-address detour discoverable. Functions that already have Basic forms would keep them; the rest would use the ABI-derived Decoded composer.

## Before ticketing

- Confirm which known contract groups may expand and whether ABI availability alone is sufficient.
- Keep read-only and view functions out of the composing list.
- Preserve **Only show allowed actions**: expanding a group while that filter is enabled must not reveal functions outside the process's allowlist.
- Decide whether Raw calldata remains a separate item at the end of an expanded group.
