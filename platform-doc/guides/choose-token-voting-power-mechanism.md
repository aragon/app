---
type: guide
title: Choose a voting-power mechanism for token governance
tags: [governance, voting]
status: draft
source: product-owner LockToVote marketing brief + "Token voting: importing & wrapping ERC-20s" and "Lock-to-vote plugin" categories (inbox/2026-08-03-release-notes-ordered.md), all 2026-08-03; app, protocol-doc, and developer-portal verification (2026-08-04, see log.md) + product-owner review (2026-08-05, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Choose a voting-power mechanism for token governance

Choose the route that lets a governance process count each holder's economic claim once per proposal. Start by identifying the exact unit that grants voting power and where the economically valuable underlying asset needs to live: in holders' wallets, in an escrow, or in a DeFi, staking, vault, or LP position.

## Prevent reusing the same claim

Token governance must prevent a holder from voting with an economic claim, moving or reusing that claim, and voting again on the same proposal. [Token Voting](../protocol-doc/plugins/token-voting-plugin.md) prevents this with a historical checkpoint: each proposal weighs an address's voting power at the point immediately before proposal creation. That requires the voting-power token to implement the current and historical power interface used by `IVotes` / `ERC20Votes`-compatible tokens. Moving the token after the snapshot does not change that proposal's weight.

[Lock to Vote](../protocol-doc/plugins/lock-to-vote-plugin.md) prevents the same reuse through custody instead: tokens locked in its `LockManager` cannot be moved to another address to vote again. Voting power is the holder's live locked balance, not a historical checkpoint.

The same distinction decides what a participation threshold measures. Token Voting weighs a proposal against the token supply recorded with that proposal's own settings at creation, so the absolute voting power its participation threshold demands stays fixed for the proposal's life. Lock to Vote reads the token's live total supply each time a proposal is evaluated, so the same percentage can demand more power next week than it does today, and a proposal's standing against the bar can shift with no vote cast. For a fixed-supply token the two behave alike; for a mintable or burnable token, treat supply policy as part of choosing the threshold. The threshold definitions themselves are upstream — see [the three thresholds](../protocol-doc/plugins/majority-voting.md#the-three-thresholds).

## Routes by voting claim and custody

### A wallet-held `IVotes` token: use Token Voting directly

Use Token Voting directly when the token that represents the voting claim is already `IVotes` / `ERC20Votes` compatible and holders normally keep that unit in their wallets. The compatible token remains the voting token, and holders need delegated voting power for their balance to count. Historical checkpoints let the token remain transferable after proposal creation without reusing its voting weight for that proposal.

### A non-voting ERC-20: use Token Voting through its wrapper when that is the intended voting claim

When the desired voting claim is an existing ERC-20 that does not support historical voting power, Token Voting can deploy a `GovernanceWrappedERC20`. A holder deposits the underlying token to receive the voting-enabled wrapper token. To establish voting power for a proposal, the holder must hold delegated wrapper voting power before its creation snapshot. Wrapping after the snapshot cannot add power to that proposal.

This route has both participation and governance-risk consequences. It is a passive participation position: holders must already be wrapped before a proposal's checkpoint rather than responding after the proposal opens. Someone can acquire the underlying ERC-20, wrap it before creating a proposal, then unwrap after the snapshot and sell the underlying while the checkpointed voting power still counts for that proposal. Evaluate that liquidity and governance-attack exposure for the specific asset rather than assuming that wrapping creates a lasting economic commitment. See [governance tokens](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md) and [snapshot voting power](../protocol-doc/plugins/token-voting-plugin/voting-power.md#the-snapshot).

### An idle wallet token with reactive participation: use Lock to Vote

Use Lock to Vote when participants normally keep a well-behaved ERC-20 idle in their wallets and should be able to commit it only after a proposal is created. A holder can lock after the proposal opens, and that lock gives live voting power in that proposal. Unlocking returns the holder's entire locked balance. In Standard mode, cast voting power remains locked until the relevant proposal ends. Vote Replacement permits an early unlock by first withdrawing the holder's open votes, but a proposal creator cannot unlock in either mode while a proposal they created remains open.

Lock to Vote is available to everyone as a self-serve option in Governance Designer.

Its ERC-20 compatibility does not make every token behavior safe; assess the [Lock to Vote caveats](../protocol-doc/plugins/lock-to-vote-plugin.md#keep-in-mind) for the token you plan to lock.

### Value held in another position: identify the actual voting unit first

An underlying asset that is staked, supplied to DeFi, deposited in a vault, or used in an LP position is not itself enough to select a route. Identify the receipt token, vault share, LP token, or other position token that actually represents the voting claim, then determine whether that unit supports `IVotes`. An `IVotes`-compatible claim can support direct Token Voting. A plain ERC-20 claim may support wrapping or Lock to Vote if it can leave the economic position and enter the required custody model. A non-ERC-20 position needs a different governance design. Moving a position token into a wrapper or Lock to Vote can also change its economic rights or availability, so do not treat staking tokens, vault shares, or LP positions as automatic Lock-to-Vote fits.

### A veLocker voting token: use Token Voting after manual staking

Manual staking into Aragon's [veLocker](../governance/velocker.md) is another route when the desired voting unit is the locker output. The veLocker adapter exposes an `IVotes`-compatible token, so Token Voting can use it as the voting-power token even when the underlying token does not implement `IVotes`. This route requires contacting Aragon to arrange it; it is not a self-serve setup path.

## Configure the selected route

After you select Token Voting, its import flow checks the token's ERC-20 interface and its current and historical voting-power interfaces. Those checks decide whether the selected token is used directly or wrapped; they are not a reason to choose Token Voting before deciding what voting claim should count.

Configure the chosen route in the [Governance Designer](../governance/governance-designer.md#configuring-token-based-governance). You are done when the voting claim, its custody model, and the way it avoids reuse are explicit in the governance configuration.
