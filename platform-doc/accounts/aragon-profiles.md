---
type: capability
title: Aragon Profiles
tags: [accounts, identity, governance]
status: draft
source: Profiles marketing brief and member-identity release notes (2026-08-03) + app and app-backend verification (2026-08-04, see log.md)
---

# Aragon Profiles

**User promise:** make a governance participant recognizable through the primary ENS identity they already control across all networks.

## Resolution and display

The app resolves the wallet's primary ENS name, avatar, and profile records from Ethereum mainnet. It works with an independently owned ENS name as well as a claimed [Aragon Name](./claiming-an-aragon-eth-name.md). On member-facing surfaces, an Aragon subname may be shortened from `alice.aragon.eth` to `alice`; the underlying primary ENS name remains unchanged.

The member profile shows the resolved name, avatar, description, and links for website, GitHub, Twitter, email, Discord, and Telegram. The same primary ENS identity is reused across member, vote, proposal, navigation, and delegation surfaces; the app's supported profile fields are shown on the member page and in the editor. When no ENS avatar resolves, the app still supplies the wallet address to its shared member-avatar component; the component's exact visual fallback is outside this source verification. Reads use a shared cache but continue to treat ENS as the authoritative source, following the [ENS profile-layer decision](./ens-as-the-profile-layer.md).

## Editing

When the `aragonProfiles` feature is enabled, the connected wallet can open its profile editor from the user menu. It edits description, website, GitHub, Twitter, email, Discord, and Telegram text records and the avatar on the current primary ENS name. Text updates become resolver writes in one signed Ethereum-mainnet transaction; a newly uploaded avatar is pinned to IPFS first and its URI is then written to the avatar record. The resolver enforces the wallet's write authority when that transaction executes.

The same Aragon Profile dialog family provides the [Aragon Name claim, rename, and release flows](./claiming-an-aragon-eth-name.md). It does not create a separate Aragon display-name field: the displayed name is the wallet's primary ENS name.

## Member-profile context

The member profile supplies participant context; the [token panel](../governance/token-panel.md) owns the actionable wrap, voting-escrow lock, and delegation controls on the Members page and in onboarding.

For each visible token body that supports delegation, the member page can show:

- voting power, token balance, and the number of delegations received;
- the token-specific [delegate statement](../governance/delegate-profile-record.md), with create or edit controls offered to the connected member-address holder.

The profile aside can also show Ethereum Follow Protocol follower and following counts when its third-party API returns data, with a link to the participant's EFP profile.

Featured delegates are a discovery surface around these profiles; [App CMS](../app-cms.md#five-established-uses) selects the addresses. When a non-empty configuration matches a Token Voting body, the dashboard replaces its ordinary Members section with the featured list; the Members page adds that list as its first, default tab. The featured-delegate lookup itself does not apply the CMS plugin-visibility filter, and a featured address need not currently hold voting power.
