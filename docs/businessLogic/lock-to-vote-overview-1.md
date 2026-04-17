# Lock-to-Vote Plugin Overview

## System Context
The **LockToVote** plugin is a governance module conceptually similar to standard Token Voting, but structurally designed around *locking* tokens instead of *snapshotting* a token balance.

- **Direct Locking**: Token holders deposit (**lock**) tokens into a dedicated LockManager contract. Their locked balance directly determines their voting power.
- **Universal ERC-20 Support**: The LockManager itself tracks voting power over time. Because it does not rely on underlying token checkpoints, it enables the use of **any standard ERC-20 token** without needing specialized governance extensions (e.g., ERC20Votes) or wrapper contracts.
- **On-Demand Power**: Tokens do not need to be locked prior to proposal creation. Users can lock and participate in **voting on proposals** purely on an as-needed basis.
- **Double-Voting Prevention**: While tokens are locked in the manager, they cannot be transferred to other addresses. This prevents "double-voting" bypasses that might otherwise occur without a snapshot system.
- **Unlocking**: Standard operation allows users to **unlock** their tokens to regain transfer control. Doing so drops their voting power to 0.

---

## Typical User Journey
1. **Approval**: The user approves the LockManager contract to spend their ERC-20 tokens via the standard `approve()` mechanism.
2. **Locking**: The user locks their ERC-20 tokens. Voting power instantly becomes available, calculated 1:1 based on the amount of tokens locked.
3. **Voting**: The user casts a vote on an active proposal using their available voting power.
4. **Increasing Power**: The user can lock additional tokens at any time to increase their voting power. (Note: To apply this new voting power to a proposal they already voted on, they may need to recast their vote, depending on contract logic).
5. **Standard Unlocking**: Once the proposal is executed, the user can safely unlock their tokens to regain full liquidity.
6. **Early Unlocking**: The user can choose to unlock their tokens while a proposal is still active. Doing so will proportionally reduce their contributed voting power from all active proposals where they have voted.

---

## Benefits

- **Liquidity Flexibility (vs. Wrapping)**: In traditional snapshot voting (like Token Wrap), non-governance ERC-20s must be wrapped *prior* to a proposal's creation block to obtain voting power. The L2V "as-needed" locking mechanism avoids this commitment. Tokens remain liquid and freely usable in DeFi up until the very moment a user decides they want to vote.
- **Optimized for High-Stakes Governance**: Because locking removes liquidity during the voting period itself, the LockToVote plugin is especially ideal for critical, high-stakes, or emergency governance decisions where skin-in-the-game is paramount.

---

## Comparison with Existing Features

### Token Wrapping (Token Voting Variant)
- **Timing Constraint**: Token Wrapping requires users to wrap their tokens into an ERC20Votes-compatible wrapper *before* a proposal's snapshot block in order to vote on it.
- **Locking Flexibility**: With LockToVote, users can hold pure liquid ERC-20s when the proposal is created, lock them *during* the voting period, vote, and unlock them (subject to early unlock reductions).
- **Delegation**: Token Wrapping often utilizes the delegation features of ERC20Votes. LockToVote has **no concept of delegation**.

*For more technical comparisons on how these flows are routed in the application, see [onboarding-conditions-lock-to-vote-token-wrap.md](./onboarding-conditions-lock-to-vote-token-wrap.md).*

---

## Smart Contract Interaction Overview
The LockToVote architecture splits responsibilities between the Plugin and the LockManager.

### LockManager Core
- Holds the raw ERC-20 tokens.
- Exposes `getLockedBalance(account)` to query current voting power.
- Includes locking mechanisms that can bundle locking with voting (e.g., `lockAndVote(proposalId, voteOption, amount)`).

### Plugin Core
- Validates the active proposals and current voting power state.
- Exposes state inquiries like `getVote(proposalId, account)` to read the cast vote and used voting power.
- Exposes `execute(proposalId)` for enacting passed proposals.
