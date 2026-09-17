---
type: decision
title: ENS as the profile layer
tags: [accounts, identity, standards]
status: draft
source: Profiles marketing brief and member-identity release notes (2026-08-03) + app and app-backend verification (2026-08-04, see log.md) + protocol-doc/framework/member-registry.md
---

# ENS as the profile layer

Aragon uses a participant's primary ENS name and its records as the authoritative profile layer instead of creating an Aragon-owned profile database. [Aragon Profiles](./aragon-profiles.md) reads those records from Ethereum mainnet, and [Aragon Names](./aragon-names.md) gives a wallet without a primary ENS name a fallback under `aragon.eth`.

## Decision

- **Identity remains user-controlled.** A participant manages the resolver records attached to their ENS name. The [Member Registry](../protocol-doc/framework/member-registry.md) owns the distinct custody mechanics for the free subname fallback.
- **The data is portable.** An interface that implements the same ENS and IPFS conventions can resolve the same profile and [delegate profile record](../governance/delegate-profile-record.md) without depending on an Aragon profile account or proprietary API.
- **ENS stays authoritative over delivery infrastructure.** The app caches ENS reads, pins uploaded avatars and delegate-statement JSON to IPFS, retrieves statement content through its backend, and uses an indexer to enumerate text records during an Aragon Name rename. Those services only deliver and migrate the public data; the records on ENS remain the source of truth.
- **"ENS-backed" splits storage between mainnet and IPFS.** ENS stores profile records and the delegate statement's `ipfs://` pointer on Ethereum mainnet; the statement JSON and app-pinned avatars live on IPFS.

The consequence is intentionally cross-chain: even when a participant is viewing governance on another supported network, profile resolution and profile-changing transactions use Ethereum mainnet.
