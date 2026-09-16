---
type: guide
title: Choose a voting-power mechanism for token governance
tags: [governance, voting]
status: draft
source: product-owner LockToVote marketing brief + "Token voting: importing & wrapping ERC-20s" and "Lock-to-vote plugin" categories (inbox/2026-08-03-release-notes-ordered.md), all 2026-08-03; app, protocol-doc, and developer-portal verification (2026-08-04, see log.md) + product-owner review (2026-08-05, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md) + token-setup verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + product-owner briefings (2026-09-14, see internal/maintenance/log.md) + https://blog.aragon.org/guardians-v2-strengthening-governance-in-morpho-vaults-v2/ (published 2025-09-30, consulted 2026-09-14)
---

# Choose a voting-power mechanism for token governance

Choose how your token gives holders voting power. [Token Voting](../protocol-doc/plugins/token-voting-plugin.md) is the usual route for token governance: it can create a new governance token or use an existing one. Lock to Vote suits specific participation needs, such as holders intervening only when a proposal puts their interests at risk. For Token Voting, veLocker is an optional way to make power depend on time spent locked.

Token Voting and Lock to Vote are self-service options in [Governance Designer](../governance/governance-designer.md#the-basic-flow) on networks where they are available. veLocker requires setup by the Aragon team.

## Does your token already exist?

### No: create and mint it with Token Voting

Choose **Token Voting → Create** in Governance Designer. Enter the token name and symbol, then specify the initial recipients and the amount to mint to each. The setup creates a [governance token](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md) with voting capabilities and mints that distribution.

**Minting creates new token units and assigns them to recipients.** The amounts you allocate form the initial supply and determine how many tokens each recipient starts with. Those tokens can supply voting power through Token Voting once that power is delegated.

The account receives mint permission, so governance can authorize further minting. New minting increases the supply and can change holders' relative voting shares. Decide how that permission should be used; the initial distribution does not fix the supply permanently.

If you plan to deploy a token separately, use the existing-token branch once it is deployed. Lock to Vote takes an existing token address and does not create or mint your token during setup.

### Yes: check its voting capabilities

Check whether the token supports `IVotes` / `ERC20Votes`: the ability to report current and historical delegated voting power.

**If it supports `IVotes`, use Token Voting directly.** Import the token address. Holders can keep the token in their wallets, and the existing token supplies voting power without a wrapper. Their power must be delegated before a proposal's creation snapshot to count in that proposal.

**If it is a plain ERC-20, Token Voting can wrap it.** Importing the token deploys a voting-enabled wrapper. Holders deposit the underlying token to receive wrapped tokens; delegated wrapper power must exist before a proposal's snapshot. Wrapping after a proposal opens cannot add power to it.

The Token Voting import flow checks the token's ERC-20 and voting interfaces to determine whether it can use the token directly or needs to wrap it. See [governance tokens](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md) for the mechanics.

If holders need to acquire voting power in response to a proposal, consider [when Lock to Vote makes sense](#when-lock-to-vote-makes-sense). A token lacking voting capabilities does not by itself make Lock to Vote the right fit.

If the asset is staked, supplied to DeFi, or held in a vault or LP position, first identify what should grant the vote: the underlying token or a receipt, share, or position token. Apply the checks above to that token. Wrapping or locking requires it to enter custody, which can affect its economic rights or availability. A non-ERC-20 position needs a different governance design.

## When Lock to Vote makes sense

For regular voting with a dedicated governance token, Token Voting lets holders participate using power already established at the proposal's snapshot. Lock to Vote adds locking and unlocking to participation. Choose it when the ability to commit tokens after seeing a proposal serves a specific purpose.

One such purpose is occasional oversight by people holding tokens such as vault shares. They may want to keep those tokens available for other uses and intervene only when a proposed change concerns them. Wrapping in advance would require them to prepare for proposals they have not yet seen. [Lock to Vote](../protocol-doc/plugins/lock-to-vote-plugin.md) lets them lock after a proposal opens and use that balance to vote.

[Guardians V2 in Morpho Vaults V2](https://blog.aragon.org/guardians-v2-strengthening-governance-in-morpho-vaults-v2/) illustrates this use case: vault depositors can veto curator actions they consider risky. Their vault shares were not designed as governance tokens. Lock to Vote lets depositors commit shares when they need to exercise oversight, without keeping them wrapped in advance.

This design requires holders to discover proposals and have enough time to respond. The tokens must also be available to lock; assets committed elsewhere may need to be retrieved first, and locked tokens cannot remain transferable. Review the [attention requirements of optimistic governance](../governance/optimistic-governance.md#the-attention-risk). If your design uses an advanced staged process, arrange that setup with Aragon.

Lock to Vote can use a voting-enabled ERC-20 as well as a plain one. In either case, check [token compatibility caveats](../protocol-doc/plugins/lock-to-vote-plugin.md#keep-in-mind); ERC-20 compatibility alone does not make every token safe to lock.

## Optional for Token Voting: veLocker

Consider [veLocker](../governance/velocker.md) if you want holders to lock tokens into positions whose voting power changes with time. It is an optional addition to a Token Voting setup: the locker supplies the voting-power token, and Token Voting still runs the vote. You can consider it for an existing token or when planning a new one.

Arrange the setup with Aragon before installing; veLocker has no self-service setup path and requires OSx v1.4 or later. The underlying token does not need `IVotes`, because the locker adapter provides it. Holders manually lock tokens and delegate the resulting power, which Token Voting reads at its proposal snapshot. Review the configured lock period, cooldown, and any withdrawal fees with the team.

veLocker and Lock to Vote use different custody and voting models. You cannot use the same escrowed position in both: tokens held by veLocker are unavailable to Lock to Vote's lock manager.

## Commitment and participation requirements

Both voting plugins prevent a holder from moving tokens to another address and counting the same tokens twice on a proposal. The consequences for holders differ:

| Requirement | Token Voting | Lock to Vote |
| --- | --- | --- |
| When voting power is measured | A historical snapshot immediately before proposal creation. | The holder's live locked balance. |
| Commitment after voting | Moving tokens after the snapshot does not change that proposal's weight. For wrappers, holders can unwrap and sell while that weight still counts. veLocker adds its own exit rules. | Standard mode keeps cast voting power locked until the relevant proposals end. Vote Replacement allows early unlock by withdrawing open votes first. Proposal creators cannot unlock while their proposals remain open in either mode. |
| Supply used for participation | Recorded for the proposal at creation; the required voting power stays fixed during that proposal. | The token's live total supply; minting or burning can change the required voting power while the proposal is open. |

Lock to Vote returns the entire locked balance when you unlock. For Token Voting with a wrapper, assess whether someone could acquire tokens, wrap them before creating a proposal, then exit while retaining voting weight on that proposal. Use [governance safeguards](./harden-token-governance-against-attacks.md) to address that exposure.

Set [participation thresholds](../protocol-doc/plugins/majority-voting.md#the-three-thresholds) with the token's supply policy and likely participation in mind. With Lock to Vote, a supply change can move the threshold even when no one casts another vote.

## Configure the selected route

Continue in [Governance Designer](../governance/governance-designer.md#configuring-token-based-governance), or give the chosen token and veLocker requirements to Aragon. For Token Voting, make sure the intended voters have [delegated voting power](../protocol-doc/plugins/token-voting-plugin/voting-power.md#delegation) before proposals are created.

Your choice is complete when you have identified the token to create or import, selected the voting plugin, and accounted for participation timing, custody, and supply changes in the configuration. If you choose Token Voting, also decide whether veLocker fits your intended commitment model.
