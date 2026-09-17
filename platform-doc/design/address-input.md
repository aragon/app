---
type: pattern
title: Address input
tags: [design, interaction]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app verification (2026-08-04, see log.md)
---

# Address input

Use the shared address input whenever a flow accepts an account or contract identifier. It gives every consumer one resolution and validation boundary while the consuming form decides whether the value is required and what the address means.

## Resolution and validation

Checksum enforcement is enabled by default. The input normalizes all-lowercase, all-uppercase, and correctly checksummed addresses to their EIP-55 checksum form. Incorrect mixed-case checksums produce a critical validation message and are not accepted. The field trims surrounding whitespace on blur and reports a resolved value only when the input is a valid address or a resolvable ENS name.

`.eth` names resolve through Ethereum mainnet's configured ENS Universal Resolver. Entered addresses receive the corresponding reverse-name lookup, and the control can switch between the resolved ENS name and address. ENS resolution is therefore mainnet identity resolution even when the consuming transaction belongs to another chain, matching the platform's [ENS profile layer](../accounts/ens-as-the-profile-layer.md).

The block-explorer control uses the chain supplied by the consuming flow. It targets an ENS-resolved address or text that loosely parses as an address and is disabled when that chain has no configured explorer. This means incorrectly checksummed mixed-case text can still expose explorer and copy controls even though the field marks it critical and does not accept it.

## Field controls

The standard control set stays close to the value it affects:

- paste when the field is empty;
- clear while editing a non-empty value;
- switch between ENS and address when both have resolved;
- open the resolved or loosely valid address text in the configured block explorer;
- copy the current field text — for a resolved ENS name, switch to the address view first when the address itself is what should be copied.

Address displays outside a form use the same clipboard affordance when the surface supplies a copy value. Member cards and member details, identity surfaces, permission views, finance details, and transaction-oriented views use that shared behavior for addresses and other identifiers. The copy control copies the supplied value exactly; it does not reinterpret or authorize it.
