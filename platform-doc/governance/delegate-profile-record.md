---
type: reference
title: Delegate profile record
tags: [governance, delegation, identity, standards]
status: draft
source: Profiles marketing brief and member-identity release notes (2026-08-03) + app and app-backend verification (2026-08-04, see log.md) + product-owner briefing (2026-08-05, see log.md)
---

# Delegate profile record

A delegate profile record attaches a token-specific statement to a participant's primary ENS name. It keeps the identity and pointer in the participant's ENS records while scoping the statement to the network and token where delegation state lives.

## ENS record

The text-record key is:

```text
<network-shortname>.<lowercase-token-address>.delegate
```

Production networks use their EIP-3770 shortname. The current supported testnet, Ethereum Sepolia, uses the app's `test` namespace. For example:

```text
eth.0xc18360217d8f7ab5e7c516566761ea12ce7f9d72.delegate
```

The value is an `ipfs://<CID>` URI. Both reads and writes target the primary ENS name's resolver on Ethereum mainnet, even when the governance token is on another network.

## Statement document

The CID resolves to the versioned JSON shape written by the current editor:

```json
{
  "version": 1,
  "type": "statement",
  "format": "markdown",
  "content": "..."
}
```

On a delegation-enabled token body's member profile, the connected member-address holder is offered a rich-text editor for the Markdown content; the resolver enforces write permission in the eventual mainnet transaction. The app pins the editor's JSON to IPFS, resolves the primary name's mainnet resolver, and writes the resulting URI to the token-specific ENS key.

On read, the backend accepts a nonempty string `content`, normalizes the returned statement, and the app safely renders that content. It does not enforce the complete writer schema for an externally supplied record. A viewer sees the card only when a readable statement exists; the connected member-address holder also sees the create or edit control.

The ENS record is the portable pointer and the JSON is off-chain content on IPFS. An interface can implement this same convention without depending on an Aragon-owned profile database, following the [ENS profile-layer decision](../accounts/ens-as-the-profile-layer.md).

ENS reviewed this key and document shape and endorsed the approach. Aragon does not present that feedback as a general ENS standard.
