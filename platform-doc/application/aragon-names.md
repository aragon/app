---
type: concept
title: Aragon Names
tags: [accounts, identity, standards]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + Profiles brief and member-identity release notes (2026-08-03) + app verification (2026-08-04, see log.md) + protocol-doc/framework/member-registry.md; consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Aragon Names

An Aragon Name is an ENS-based name such as `username.aragon.eth` that provides an open, non-proprietary identity in the Aragon platform UI. A wallet without a primary ENS name can claim this free fallback, then use it as its primary ENS name and [Aragon Profile](./aragon-profiles.md).

A participant with an existing primary ENS name can already use [Aragon Profiles](./aragon-profiles.md). Aragon Names uses the same ecosystem standard so people and other applications can resolve the identity without depending on an Aragon-hosted profile system ([ENS as the profile layer](./aragon-profiles.md#ens-as-the-profile-layer)).

## Constraints

- An Aragon Name is a subname under the registry-managed `aragon.eth` parent, not an independently owned ENS name. The member controls its resolver records through the approval model documented upstream.
- The app treats a registered wallet as having one active Aragon subname and routes it to that existing name rather than offering another claim.
- The app validates the label format and live availability. The claim UI has no separate reservation, impersonation, anti-squatting, blacklist, or label-policy check beyond those validations.
- The deployed Member Registry has been audited and is authorized to create subnames under `aragon.eth`.
- Its permissioned eviction path and upgrade administration are controlled through an internal Aragon-held address. A claimed subname is therefore revocable, and the registry remains administratively upgradable, even though the member manages the resolver records.

The [Member Registry](../protocol-doc/framework/member-registry.md) provides the subnames and resolver-record custody. Its protocol reference covers registration, record management, moving, release and eviction.

## Where the flow appears

The app checks a newly connected wallet through its profile-onboarding watcher while the user is viewing a specific account and offers profile creation when no primary ENS name resolves. This is user onboarding, not the [account-deployment wizard](../accounts/account-creation.md): the organizational account's optional `<label>.dao.eth` address record belongs to [the account's `dao.eth` subname](../accounts/account.md#identifying-an-account), not to this wallet identity. The same creation action is available from the user menu. A wallet that already has a primary ENS name uses that name for its profile instead of being offered a second identity through this flow.

The claim dialog also checks the Member Registry directly. If the wallet already registered an Aragon subname but has not made it primary, the app offers to set that existing name as primary rather than registering another one.

## Claiming

The user chooses an available label, then approves two Ethereum-mainnet transactions:

1. Register the label through the [Member Registry](../protocol-doc/framework/member-registry.md).
2. Set the resulting `name.aragon.eth` as the wallet's primary ENS name through the ENS reverse registrar.

Both app-built requests carry zero native value: the claim itself is free, though the wallet still pays Ethereum-mainnet transaction fees. Registration, the primary-name update, later profile edits, rename, and release all use mainnet across the entire Aragon UI.

## Name lifecycle

The name supports an [editable Aragon Profile](./aragon-profiles.md#editing) and a [network-and-token-specific delegate statement stored on IPFS](../governance/delegate-profile-record.md).

### Renaming

An Aragon Name can be changed from the profile editor. Before calling the registry's `move`, the app enumerates the current text records through its indexer and reads the live address and contenthash from the resolver. It supplies those records to the move and then asks the wallet to set the new name as primary. This preserves the record types in the registry's migration tuple; it is not a promise to migrate every record type an ENS resolver could support.

### Releasing a name

The profile editor also exposes release for a primary name ending in `.aragon.eth`. The user confirms a mainnet `release` transaction; the registry's clean-handover behavior clears the resolver records and address, and the label becomes available for another wallet to claim.
