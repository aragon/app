---
type: capability
title: Claiming an Aragon Name
tags: [accounts, identity, onboarding]
status: draft
source: Profiles marketing brief and member-identity release notes (2026-08-03) + app verification (2026-08-04, see log.md) + protocol-doc/framework/member-registry.md + product-owner briefing (2026-08-05, see log.md)
---

# Claiming an Aragon Name

**User promise:** a wallet without a primary ENS name can claim a free `name.aragon.eth` fallback in the app, then use it as the wallet's primary ENS name and [Aragon Profile](./aragon-profiles.md).

## Where the flow appears

The app checks a newly connected wallet through its profile-onboarding watcher while the user is viewing a specific account and offers profile creation when no primary ENS name resolves. This is user onboarding, not the [account-deployment wizard](./account-creation.md): the organizational account's optional `<label>.dao.eth` address record belongs to [the account's `dao.eth` subname](./account.md#the-accounts-optional-daoeth-subname), not to this wallet identity. The same creation action is available from the user menu. A wallet that already has a primary ENS name uses that name for its profile instead of being offered a second identity through this flow.

The claim dialog also checks the Member Registry directly. If the wallet already registered an Aragon subname but has not made it primary, the app offers to set that existing name as primary rather than registering another one.

## Claiming

The user chooses an available label, then approves two Ethereum-mainnet transactions:

1. Register the label through the [Member Registry](../protocol-doc/framework/member-registry.md).
2. Set the resulting `name.aragon.eth` as the wallet's primary ENS name through the ENS reverse registrar.

Both app-built requests carry zero native value: the claim itself is free, though the wallet still pays Ethereum-mainnet transaction fees. Registration, the primary-name update, later profile edits, rename, and release all use mainnet across the entire Aragon UI.

## Name lifecycle

An Aragon Name can be changed from the profile editor. Before calling the registry's `move`, the app enumerates the current text records through its indexer and reads the live address and contenthash from the resolver. It supplies those records to the move and then asks the wallet to set the new name as primary. This preserves the record types in the registry's migration tuple; it is not a promise to migrate every record type an ENS resolver could support.

The profile editor also exposes release for a primary name ending in `.aragon.eth`. The user confirms a mainnet `release` transaction; the registry's clean-handover behavior clears the resolver records and address, and the label becomes available for another wallet to claim.

## Constraints

- An Aragon Name is a subname under the registry-managed `aragon.eth` parent, not an independently owned ENS name. The member controls its resolver records through the approval model documented upstream.
- The app treats a registered wallet as having one active Aragon subname and routes it to that existing name rather than offering another claim.
- The app validates the label format and live availability. The inspected claim UI has no separate reservation, impersonation, anti-squatting, blacklist, or label-policy check beyond those validations.
- The deployed Member Registry has been audited and is authorized to create subnames under `aragon.eth`.
- Its permissioned eviction path and upgrade administration are controlled through an internal Aragon-held address. A claimed subname is therefore revocable, and the registry remains administratively upgradable, even though the member manages the resolver records.
