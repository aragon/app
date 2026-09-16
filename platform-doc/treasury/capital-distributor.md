---
type: capability
title: Capital Distributor
tags: [governance, treasury, plugins]
status: draft
source: product-owner release-notes briefing, "Capital distributor & Merkle-based reward distribution" category (1.8.0, 1.9, 1.15, and 1.23; 2026-08-03) + public aragon/osx-capital-distributor repository verification (development@8577c133, inspected 2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner briefings (2026-09-11, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Capital Distributor

**Capital Distributor** is a capability provided by an installed [plugin](../governance/plugin.md) for making tokens in a DAO's [vault](./vault.md) claimable by eligible recipients. A campaign defines who can claim and how the payout is made; each successful claim verifies that allocation and transfers the token out of the DAO. This supports both one-off distributions such as airdrops and ongoing reward programs.

## Delivery posture and client context

Capital Distributor is an [Aragon-deployed plugin](../application/aragon-deployed-plugins.md): the team deploys it for clients, and the app supports the installed experience. Deployment is not offered as a free self-service flow. [Contact the Aragon team](../application/getting-help.md#working-with-the-aragon-team) to arrange deployment.

Named users include Boundless, Katana, and Cryptex. Aragon can implement project-specific campaign calculations off-chain — for example, producing a JSON allocation from a client's incentive rules and turning it into the Merkle tree — while the plugin and claim flow remain the reusable product capability. Those client-specific rules are not general Capital Distributor behavior.

## Claiming access and external integrations

Aragon's claiming UI applies an OFAC-list gate. Aragon can also add country restrictions to a client's claiming interface when requested. Those controls apply to that interface; they do not change the plugin's onchain claim eligibility.

External clients can use Aragon's public Merkle-generation API to generate trees and proofs for a claiming experience on their own site, then connect that experience directly to the installed plugin. This separates the campaign and onchain claim mechanics from Aragon's own claim UI.

## Rewards page

The **Rewards page** shows campaigns for the connected wallet on an account with Capital Distributor installed. Without a connected wallet, it prompts the visitor to connect. **Claimable** lists available claims; **Claimed** lets the holder review completed claims. Campaign rows show the campaign description, token amount, and fiat value when priced, while the aside supplies the distributor's description, resource links, and claim summary.

Selecting a claimable campaign opens the [claim flow](#merkle-eligibility-and-claiming). Selecting a claimed campaign opens its recorded claim transaction in the block explorer. The page uses the account's first installed Capital Distributor instance. [App CMS](../application/app-cms.md) can hide Rewards and redirect a direct visit to the dashboard. The [claiming restrictions](#claiming-access-and-external-integrations) and [client deployment arrangement](#delivery-posture-and-client-context) still apply.

Claim details show the token symbol and a shortened amount, an estimated fiat value, campaign resources, and the deadline when one is set. The recipient field identifies where the payout will go. These details do not offer the token contract address or a control to inspect the exact unrounded amount before claiming; the submitted transaction can be inspected through its block-explorer link.

## Merkle eligibility and claiming

The current Aragon claim flow uses a Merkle allocation strategy. An off-chain backend turns the campaign's allocation data into a Merkle tree and root, and serves each claimant the proof for their address and amount. The Merkle strategy stores a root for the campaign; a claim submits the proof and amount so the strategy can verify eligibility onchain. Campaign data and proofs are often prepared in advance.

The app lists the rewards the connected user is eligible to claim. Selecting one opens a short claim wizard: the user requests their proof, signs and submits the claim transaction, and chooses whether the payout goes to their own address or another address. Redirecting the payout does not transfer the eligibility itself — the claim remains against the claimant's allocation.

A campaign can also be configured so a claim compounds directly into a [veLocker](../governance/velocker.md) lock rather than transferring the token to a wallet: the claim still resolves through the same payout-address step described above, but the campaign's attached payout encoder locks that payout into a voting escrow instead of moving the token. The campaign configuration makes this choice: the create-campaign action sets a default direct-transfer encoder or a voting-escrow-lock encoder when the campaign is created. The payout choice surfaces only for accounts wired with a voting-escrow address resolver — today a per-client arrangement, on the same footing as the delivery posture below, not a general campaign option — and when no escrow address resolves, the lock option still appears but carries a warning rather than disappearing. Redirect-to-another-address and lock-compounding are both about where a claim goes: one is the claimant's choice of address, the other is the campaign's choice of what that address receives.

## Campaign actions

Creating a campaign fixes an allocation, payout token, payout behavior and claim schedule. Use it to open a new distribution after those choices are settled. The create-campaign form asks for a title, description and resources. Aragon also uses the action builder to assemble campaigns for client-specific distributions; campaign authoring follows that client arrangement.

A campaign can be open-ended or scheduled. Scheduled times become fixed timestamps during preparation. When the author chooses a duration starting now, the end is calculated at preparation time, so time spent awaiting governance approval and execution reduces the remaining claim window. Review that window against the process's expected timing before proposing the campaign.

Pause temporarily prevents claims and Resume allows them again within the existing campaign schedule; neither action rewrites allocations or reverses completed claims. End permanently closes a campaign. Use Pause when the stop may need to be reversed. The Basic forms select active campaigns for Pause and End, and inactive campaigns for Resume.

Create Campaign has both a Basic form and a Basic proposal/transaction details view. Pause, Resume and End have Basic forms, while their details use Decoded or Raw. The [campaign action catalogue](../application/basic-action-views.md#distribution-campaigns) connects each action to its use and consequences.

## Gauge-informed rewards

A client-arranged campaign can use [Gauge voting](../governance/gauge-voting.md) outcomes as input to its off-chain reward calculation. The resulting allocation data then becomes campaign-preparation input for Capital Distributor. Gauge Voter does not automatically create the campaign, fund it, or pay its claims; the handoff is configured separately with Aragon.
