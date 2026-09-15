---
type: capability
title: Capital Distributor
tags: [governance, treasury, plugins]
status: draft
source: product-owner release-notes briefing, "Capital distributor & Merkle-based reward distribution" category (1.8.0, 1.9, 1.15, and 1.23; 2026-08-03) + public aragon/osx-capital-distributor repository verification (development@8577c133, inspected 2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Capital Distributor

**Capital Distributor** is a capability provided by an installed [plugin](./plugin.md) for making tokens in a DAO's [vault](../treasury/vault.md) claimable by eligible recipients. A campaign defines who can claim and how the payout is made; each successful claim verifies that allocation and transfers the token out of the DAO. This supports both one-off distributions such as airdrops and ongoing reward programs.

## Merkle eligibility and claiming

The current Aragon claim flow uses a Merkle allocation strategy. An off-chain backend turns the campaign's allocation data into a Merkle tree and root, and serves each claimant the proof for their address and amount. The Merkle strategy stores a root for the campaign; a claim submits the proof and amount so the strategy can verify eligibility onchain. Campaign data and proofs are often prepared in advance.

The app lists the rewards the connected user is eligible to claim. Selecting one opens a short claim wizard: the user requests their proof, signs and submits the claim transaction, and chooses whether the payout goes to their own address or another address. Redirecting the payout does not transfer the eligibility itself — the claim remains against the claimant's allocation.

A campaign can also be configured so a claim compounds directly into a [veLocker](./velocker.md) lock rather than transferring the token to a wallet: the claim still resolves through the same payout-address step described above, but the campaign's attached payout encoder locks that payout into a voting escrow instead of moving the token. Current code shows the campaign, not the claimant, makes this choice: the create-campaign action sets a default direct-transfer encoder or a voting-escrow-lock encoder when the campaign is created. The payout choice surfaces only for accounts wired with a voting-escrow address resolver — today a per-client arrangement, on the same footing as the delivery posture below, not a general campaign option — and when no escrow address resolves, the lock option still appears but carries a warning rather than disappearing. Redirect-to-another-address and lock-compounding are both about where a claim goes: one is the claimant's choice of address, the other is the campaign's choice of what that address receives.

## Claiming access and external integrations

Aragon's claiming UI applies an OFAC-list gate and can also geofence claims for selected countries. These are controls on Aragon's claiming surface; the available source does not define the exact list or country policy, and the controls are not documented here as a compliance guarantee.

External clients can use Aragon's public Merkle-generation API to generate trees and proofs for a claiming experience on their own site, then connect that experience directly to the installed plugin. This separates the campaign and onchain claim mechanics from Aragon's own claim UI.

## Campaign actions

When a campaign-creation action is present on a proposal, the [action builder](./action-builder.md) can show the campaign being created in Basic view. The action applies the app's [metadata input](../design/metadata-input.md) pattern as campaign title, description, and resources; asset, payout behavior, allocation file, and schedule are separate campaign configuration. Aragon also uses the action builder to assemble campaigns for client-specific distributions; this does not establish a general self-service campaign-authoring flow. The app supplies further Basic action views for pausing, resuming, and ending a campaign. Pausing temporarily prevents claims and can be reversed; ending a campaign permanently closes it.

## Gauge-informed rewards

A client-arranged campaign can use [Gauge voting](./gauge-voting.md) outcomes as input to its off-chain reward calculation. The resulting allocation data then becomes campaign-preparation input for Capital Distributor. Gauge Voter does not automatically create the campaign, fund it, or pay its claims; the handoff is configured separately with Aragon.

## Delivery posture and client context

Capital Distributor is a [partially supported plugin](../partially-supported-plugins.md): Aragon supports the installed experience and can deploy it while working directly with a client, but it is not offered as a free self-service deployment flow.

Named users include Boundless, Katana, and Cryptex. Aragon can implement project-specific campaign calculations off-chain — for example, producing a JSON allocation from a client's incentive rules and turning it into the Merkle tree — while the plugin and claim flow remain the reusable product capability. Those client-specific rules are not general Capital Distributor behavior.
