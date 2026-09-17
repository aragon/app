---
type: capability
title: Aragon Profiles
tags: [accounts, identity, governance]
status: draft
source: Profiles marketing brief and member-identity release notes (2026-08-03) + app and app-backend verification (2026-08-04, see log.md) + product-owner Member-page commission and content separation (2026-09-10, see log.md) + avatar fallback verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 with locked gov-ui-kit@2.11.4 and @radix-ui/react-avatar@1.2.6 (2026-09-13, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Aragon Profiles

**Aragon Profiles** makes a governance participant recognizable through the primary ENS identity they control. That identity appears on the [Member page](../governance/member.md#member-page) and across the app.

## Resolution and display

The app resolves the wallet's primary ENS name, avatar, and profile records from Ethereum mainnet. It works with an independently owned ENS name as well as a claimed [Aragon Name](./aragon-names.md#claiming). On member-facing surfaces, an Aragon subname may be shortened from `alice.aragon.eth` to `alice`; the underlying primary ENS name remains unchanged.

The same primary ENS identity is reused across member, vote, proposal, navigation, and delegation views. Supported profile records include description, website, GitHub, Twitter, email, Discord, and Telegram; the app displays these on the Member page and exposes them in the profile editor. When no ENS avatar can be displayed, the app shows a pixelated icon generated from the wallet address. Reads use a shared cache.

A token-specific [delegate statement](../governance/delegate-profile-record.md) extends Aragon Profiles with context for delegation. Members can publish and edit these statements on their [Member page](../governance/member.md#identifying-a-member).

## ENS as the profile layer

Aragon uses a participant's primary ENS name and its records as the authoritative profile layer instead of creating an Aragon-owned profile database. The app reads those records from Ethereum mainnet, and [Aragon Names](./aragon-names.md) gives a wallet without a primary ENS name a fallback under `aragon.eth`.

- **Identity remains user-controlled.** A participant manages the resolver records attached to their ENS name. The free subname fallback uses the [Member Registry](../protocol-doc/framework/member-registry.md)’s distinct custody model.
- **The data is portable.** An interface that implements the same ENS and IPFS conventions can resolve the same profile and [delegate profile record](../governance/delegate-profile-record.md) without depending on an Aragon profile account or proprietary API.
- **ENS stays authoritative over delivery infrastructure.** The app caches ENS reads, pins uploaded avatars and delegate-statement JSON to IPFS, retrieves statement content through its backend, and uses an indexer to enumerate text records during an Aragon Name rename. Those services only deliver and migrate the public data; the records on ENS remain the source of truth.
- **"ENS-backed" splits storage between mainnet and IPFS.** ENS stores profile records and the delegate statement's `ipfs://` pointer on Ethereum mainnet; the statement JSON and app-pinned avatars live on IPFS.

The consequence is intentionally cross-chain: even when a participant is viewing governance on another [supported chain](./supported-chains.md), profile resolution and profile-changing transactions use Ethereum mainnet.

## Editing

When the `aragonProfiles` feature is enabled, the connected wallet can open its profile editor from the user menu. It edits the [profile text records and avatar](#resolution-and-display) on the current primary ENS name. Text updates become resolver writes in one signed Ethereum-mainnet transaction; a newly uploaded avatar is pinned to IPFS first and its URI is then written to the avatar record. The resolver enforces the wallet's write authority when that transaction executes.

The same Aragon Profile dialog family provides the [Aragon Name claim, rename, and release flows](./aragon-names.md#claiming).
