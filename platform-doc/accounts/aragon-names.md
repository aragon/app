---
type: capability
title: Aragon Names
tags: [accounts, identity, standards]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + Profiles brief and member-identity release notes (2026-08-03) + app verification (2026-08-04, see log.md) + protocol-doc/framework/member-registry.md
---

# Aragon Names

**User promise:** use an ENS-based Aragon name such as `username.aragon.eth` as an open, non-proprietary identity layer for the Aragon platform UI.

Aragon adopts ENS because it is an ecosystem standard people and other applications can resolve without depending on an Aragon-hosted profile system. A participant with any primary ENS name can use the app's profile layer; an eligible wallet without one can [claim an Aragon Name](./claiming-an-aragon-eth-name.md) as a free alternative. The [ENS-as-profile-layer decision](./ens-as-the-profile-layer.md) owns why this data remains portable instead of becoming an Aragon-specific account.

This page is the feature-level overview. It is broken down further here:

- [Claiming an Aragon Name](./claiming-an-aragon-eth-name.md) — eligibility, mainnet transactions, and the rename and release lifecycle.
- [Aragon Profiles](./aragon-profiles.md) — how the app resolves, displays, and edits ENS-backed participant profiles.
- [Delegate profile record](../governance/delegate-profile-record.md) — the network-and-token-specific ENS record that points to a delegate statement on IPFS.

The protocol mechanism is the [Member Registry](../protocol-doc/framework/member-registry.md) contract, which provides `aragon.eth` subnames and resolver-record custody. Its page owns the registration, record-management, move, release, and eviction mechanics; the pages here document only their product surfaces.
