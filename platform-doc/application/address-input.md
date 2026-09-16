---
type: pattern
title: Address input
tags: [accounts, design, interaction, identity, forms]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app verification (2026-08-04, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md); user-facing behavior split from design/address-input.md and design/abstract-then-drill-down.md in the product/internal content separation (2026-09-10, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Address input

Wherever the app asks for an account or contract address, such as a transfer recipient, a multisig member, a delegate, a contract to call, or a body's address, the field validates and resolves the value the same way. Use the shared address input for these identifiers so every form uses one resolution and validation boundary. The surrounding form decides whether the value is required and what the address means.

## Validation and ENS resolution

Checksum enforcement is on by default. The field accepts an all-lowercase, all-uppercase, or correctly checksummed address and normalizes it to its EIP-55 checksum form. An address whose mixed-case checksum is wrong is marked critical and is not accepted, because a failed checksum is how a mistyped address is detected. Surrounding whitespace is trimmed when the field loses focus, and the field reports a value only when the input is a valid address or a resolvable ENS name.

A `.eth` name resolves through Ethereum mainnet's ENS Universal Resolver, and an entered address receives the corresponding reverse lookup; when both are known, the field can switch between showing the ENS name and the address. Resolution uses mainnet even when the transaction being composed belongs to another chain, consistent with [ENS as the profile layer](./aragon-profiles.md#ens-as-the-profile-layer).

## Controls

The controls sit beside the value: paste when the field is empty, clear while editing a non-empty value, switch between the ENS name and the address when both have resolved, open the address in the block explorer of the chain the flow acts on, and copy the current field text. To copy the address behind a resolved ENS name, switch to the address view first. The explorer control is disabled when that chain has no configured explorer. It targets a resolved address or text that loosely parses as one, so an address with a wrong checksum can still expose the explorer and copy controls even though the field marks it critical and does not accept it.

Copying never reinterprets or authorizes the value. [Address display](./address-display.md) applies the same exact-copy rule outside forms.
