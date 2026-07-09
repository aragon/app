# Lock-to-Vote Overview

Lock-to-Vote is a governance plugin designed as an alternative to traditional Token Voting, optimized for scenarios requiring high-stakes, low-frequency governance decisions.

### Key Characteristics

- **Direct Locking**: Token holders deposit (**lock**) tokens into a dedicated LockManager contract. Their locked balance directly determines their voting power.
- **Universal ERC-20 Support**: The LockManager itself tracks voting power over time. Because it does not rely on underlying token checkpoints, it enables the use of **any standard ERC-20 token** without needing specialized governance extensions (e.g., ERC20Votes) or wrapper contracts.
- **On-Demand Power**: Tokens do not need to be locked prior to proposal creation. Users can lock and participate in **voting on proposals** purely on an as-needed basis.
- **Double-Voting Prevention**: While tokens are locked in the manager, they cannot be transferred to other addresses. This prevents "double-voting" bypasses that might otherwise occur without a snapshot system.
- **Unlocking**: Standard operation allows users to **unlock** their tokens to regain transfer control. Doing so drops their voting power to 0.

## Typical User Journey

1. **Token Approval**: Before locking, users must approve the LockManager contract to spend their tokens (standard ERC20 approval)

2. **Initial Locking**: Users lock their ERC20 tokens to establish voting power. Voting power is calculated as the exact amount of tokens locked

3. **Proposal Voting**: Users can vote on active proposals using their available voting power

4. **Additional Locking**: Users can lock more tokens to increase their voting power. To apply new voting power to existing votes, they must vote again

5. **Proposal Execution**: When proposals are executed, users can safely unlock their tokens to regain full liquidity

6. **Mid-proposal Unlocking**: Users can unlock tokens while proposals are still active, but their voting power is immediately reduced across all active proposals where they have voted

## Benefits

- **No Governance Token Requirement (vs. Token Voting)**: Standard Token Voting requires an `ERC20Votes`-compatible token with built-in checkpointing and delegation. L2V works with **any plain ERC-20** — no governance extensions, no wrapper, no migration. DAOs can bolt governance onto an existing token without redeploying it.
- **Skin-in-the-Game Commitment (vs. Token Voting)**: Snapshot-based Token Voting lets holders vote and then immediately sell — their recorded power is unaffected because the snapshot is already locked in. L2V requires tokens to be actually held (locked) during the voting window, so voting power correlates with a real, ongoing economic position rather than a single-block balance.
- **Liquidity Flexibility (vs. Wrapping)**: In snapshot voting with non-governance tokens (Token Wrap), holders must wrap their tokens *prior* to a proposal's creation block to obtain voting power. The L2V "as-needed" locking mechanism avoids that pre-commitment. Tokens remain liquid and freely usable in DeFi up until the moment a user decides to vote.
- **Optimized for High-Stakes Governance**: Because locking removes liquidity during the voting period itself, the LockToVote plugin is especially ideal for critical, high-stakes, or emergency governance decisions where skin-in-the-game is paramount.

## Comparison with Existing Features

### Token Voting (Standard, non-wrapped)
- **Token Requirement**: Standard Token Voting requires an `ERC20Votes`-compatible token (built-in checkpoints and delegation). LockToVote works with **any ERC-20** — the LockManager provides the voting-power accounting externally.
- **Voting Power Source**: Token Voting reads balances at the proposal's **snapshot block** (creation block). LockToVote reads the **current locked balance** in the LockManager — there is no snapshot.
- **Liquidity During Voting**: Token Voting leaves tokens fully transferable throughout the voting window (a voter can sell immediately after casting and still have their recorded vote count). LockToVote requires the voter's tokens to remain **locked and non-transferable** while their vote is active.
- **Delegation**: Token Voting supports delegation via `ERC20Votes`. LockToVote has **no concept of delegation**.
- **Use Case Fit**: Token Voting suits ongoing, low-friction governance where liquidity matters. LockToVote suits discrete, high-stakes decisions where an active economic commitment from voters is desirable.

### Token Wrapping (Token Voting Variant)
- **Timing Constraint**: Token Wrapping requires users to wrap their tokens into an ERC20Votes-compatible wrapper *before* a proposal's snapshot block in order to vote on it.
- **Locking Flexibility**: With LockToVote, users can hold pure liquid ERC-20s when the proposal is created, lock them *during* the voting period, vote, and unlock them (subject to early unlock reductions).
- **Delegation**: Token Wrapping often utilizes the delegation features of ERC20Votes. LockToVote has **no concept of delegation**.

*For more technical comparisons on how these flows are routed in the application, see [onboarding-conditions-lock-to-vote-token-wrap.md](./onboarding-conditions-lock-to-vote-token-wrap.md).*

### Gauge Voter (with Voting Escrow)

While Gauge Voter also involves locking mechanisms, it differs in several key aspects:

- **NFT-based**: Gauge Voter uses NFTs representing locked positions with time-based multipliers
- **Time commitments**: Gauge Voter includes vesting periods and time-weighted voting power
- **Complexity**: Gauge Voter has more complex mechanics with multiple contract interactions
- **Use case**: Gauge Voter is designed for ongoing governance, while Lock-to-Vote targets discrete decisions

## Technical Architecture

### Frontend

Unlike Voting Escrow (VE) locks and Token Wrapping — which are both implemented inside the Token Voting plugin (`src/plugins/tokenPlugin`) — Lock-to-Vote lives in its own dedicated plugin at `src/plugins/lockToVotePlugin`.

### Smart Contracts

Lock-to-Vote is backed by two contracts with clearly separated responsibilities:

- **`LockManagerERC20`** — Custodies the locked ERC-20 tokens and tracks each account's locked balance. It is the single source of truth for voting power and is the only contract users interact with to lock, vote, or unlock.
- **`LockToVotePlugin`** — The Aragon governance plugin. It owns proposal state, voting settings (support threshold, min participation, min approval), and execution. It delegates voting-power lookups to the `LockManager` and is only called by the manager when relaying a vote.

At deploy time the two contracts are paired: the plugin references its manager via `lockManager()` and the manager is bound to its plugin via `setPluginAddress(...)`.

### Key Interfaces

#### `ILockManager` — user-facing entry point

```solidity
// Query
function token() external view returns (address);
function getLockedBalance(address account) external view returns (uint256);
function canVote(uint256 proposalId, address voter, IMajorityVoting.VoteOption voteOption) external view returns (bool);

// Lock
function lock() external;                       // Locks the full ERC-20 allowance granted to the manager
function lock(uint256 amount) external;         // Locks an explicit amount

// Lock + vote atomically
function lockAndVote(uint256 proposalId, IMajorityVoting.VoteOption vote) external;
function lockAndVote(uint256 proposalId, IMajorityVoting.VoteOption vote, uint256 amount) external;

// Vote with already-locked balance
function vote(uint256 proposalId, IMajorityVoting.VoteOption vote) external;

// Release locks (gated by active proposals depending on mode)
function unlock() external;

// Plugin → manager lifecycle hooks
function proposalCreated(uint256 proposalId) external;
function proposalEnded(uint256 proposalId) external;
function setPluginAddress(ILockToGovernBase plugin) external;
```

#### `ILockToVote` — plugin-side voting surface

```solidity
function canVote(uint256 proposalId, address voter, IMajorityVoting.VoteOption voteOption) external view returns (bool);

// Called by the LockManager to register / update a vote.
// `votingPower` replaces (not adds to) any prior allocation and can only grow.
function vote(uint256 proposalId, address voter, IMajorityVoting.VoteOption voteOption, uint256 votingPower) external;

// Wipes a voter's allocation from a proposal (used when unlocking mid-proposal).
function clearVote(uint256 proposalId, address voter) external;
```

`ILockToVote` extends `ILockToGovernBase`, which exposes shared read methods: `lockManager()`, `token()`, `usedVotingPower(proposalId, voter)`, `minProposerVotingPower()`, and `isProposalOpen(proposalId)`.

#### `IMajorityVoting` — tallying and execution

Vote options are `None | Abstain | Yes | No`. The plugin exposes the standard majority-voting settings and checks:

- `supportThresholdRatio()`, `minParticipationRatio()`, `minApprovalRatio()`
- `isSupportThresholdReached(id)` / `isSupportThresholdReachedEarly(id)` — worst-case support used for early execution
- `isMinVotingPowerReached(id)`, `isMinApprovalReached(id)`, `canExecute(id)`, `execute(id)`
- `getVote(proposalId, account)` returns a `VoteEntry { voteOption, votingPower }`

Every cast emits `VoteCast(proposalId, voter, voteOption, votingPower)`.

### Interaction Flow

1. User approves the `LockManager` for the ERC-20 (standard `approve`).
2. User calls `lock` / `lockAndVote` on the manager — tokens move into the manager, balance is recorded.
3. For a vote, the manager calls `ILockToVote.vote(proposalId, voter, option, votingPower)` on the plugin, which stores the allocation and emits `VoteCast`.
4. On proposal creation / end, the plugin notifies the manager via `proposalCreated` / `proposalEnded` so it can track which locks are still encumbered.
5. On `unlock`, the manager clears the user's allocations from any still-active proposals (via `clearVote`) before releasing the tokens.
