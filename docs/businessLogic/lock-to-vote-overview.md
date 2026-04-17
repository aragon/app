# Lock-to-Vote Overview

## System Context

This document provides a comprehensive overview of the Lock-to-Vote (L2V) feature, which is part of the larger Aragon DAO governance system. Lock-to-Vote is a governance plugin designed as an alternative to traditional Token Voting, optimized for scenarios requiring high-stakes, low-frequency governance decisions.

### Core Concept

Lock-to-Vote is a governance mechanism where token holders **lock their ERC-20 tokens** in a dedicated LockManager contract to gain voting power. Unlike traditional snapshot-based voting, the LockManager contract directly determines voting power through locked token amounts, enabling the use of **any ERC-20 token** without requiring specialized governance capabilities (e.g., ERC20Votes) or token wrappers.

### Key Characteristics

- **No pre-locking requirement**: Tokens do not need to be locked prior to proposal creation, allowing **on-demand voting** participation
- **Direct voting power**: Voting power equals the amount of tokens locked (1:1 ratio)
- **Token immobilization**: Locked tokens are unavailable for transfer, preventing **double voting**
- **Flexible unlocking**: Tokens can be unlocked at any time, with voting power adjustments applied accordingly
- **No delegation**: The system operates without delegation concepts - voting power is automatically derived from locked amounts

## Typical User Journey

1. **Token Approval**: Before locking, users must approve the LockManager contract to spend their tokens (standard ERC20 approval)

2. **Initial Locking**: Users lock their ERC20 tokens to establish voting power. Voting power is calculated as the exact amount of tokens locked

3. **Proposal Voting**: Users can vote on active proposals using their available voting power

4. **Additional Locking**: Users can lock more tokens to increase their voting power. To apply new voting power to existing votes, they must vote again

5. **Proposal Execution**: When proposals are executed, users can unlock their tokens to regain transferability

6. **Mid-proposal Unlocking**: Users can unlock tokens while proposals are still active, but their voting power is immediately reduced across all active proposals where they have voted

## Benefits

### Liquidity Flexibility vs. Token Wrapping

Unlike snapshot-based voting which requires non-governance ERC20s to be wrapped in advance, the lock-to-vote mechanism keeps tokens liquid until voting is needed. This allows tokens to remain available for DeFi activities and other uses until the moment voting participation is desired.

### Optimized for High-Stakes Governance

Due to the liquidity trade-off (tokens become temporarily illiquid during voting), Lock-to-Vote is ideal for:
- Critical governance decisions
- Emergency protocol changes
- High-value treasury allocations
- Constitutional amendments

### Double Voting Prevention

The locking mechanism ensures tokens cannot be used simultaneously across multiple proposals or voting contexts, providing clean vote counting and preventing manipulation through token reuse.

## Similar Existing Features

### Token Wrapping (Token Voting Variant)

The existing token wrapping feature in standard Token Voting shares some conceptual overlap but differs significantly:

- **Timing**: Token wrapping requires pre-wrapping before voting, while Lock-to-Vote allows on-demand locking
- **Contract Architecture**: Token wrapping uses ERC20Wrapper contracts that mint governance tokens, while Lock-to-Vote uses a simple lock manager
- **Reversibility**: Both allow unwrapping/unlocking, but Lock-to-Vote includes proposal activity guards
- **Delegation**: Token wrapping may require delegation depending on token configuration, while Lock-to-Vote has no delegation

### Gauge Voter (with Voting Escrow)

While Gauge Voter also involves locking mechanisms, it differs in several key aspects:

- **NFT-based**: Gauge Voter uses NFTs representing locked positions with time-based multipliers
- **Time commitments**: Gauge Voter includes vesting periods and time-weighted voting power
- **Complexity**: Gauge Voter has more complex mechanics with multiple contract interactions
- **Use case**: Gauge Voter is designed for ongoing governance, while Lock-to-Vote targets discrete decisions

## Technical Architecture

### Core Components

- **LockManager Contract**: Holds locked tokens and tracks voting power per user
- **LockToVote Plugin**: Aragon plugin implementing the governance logic
- **Onboarding Flow**: Automated user guidance for initial token locking
- **Voting Interface**: Proposal creation and voting UI components

### Contract Interactions

```typescript
// Lock Manager Functions
getLockedBalance(account: address): uint256  // Query user's locked amount
lockAndVote(proposalId: uint256, voteOption: uint8, amount: uint256): void  // Lock and vote in one transaction
vote(proposalId: uint256, voteOption: uint8): void  // Vote with existing locked tokens
unlock(): void  // Unlock tokens (subject to proposal guards)
```

### Plugin Structure

The LockToVote plugin follows standard Aragon plugin architecture:

- **Settings**: Voting mode, token configuration, approval ratios
- **Actions**: Proposal creation, voting, settings updates
- **Components**: UI components for locking, voting, and member management
- **Hooks**: Data fetching, permission checks, onboarding logic

### Voting Modes

- **Standard**: Basic approval/rejection voting
- **Vote Replacement**: Allows voters to change their vote during the voting period

## Integration Points

### Onboarding Conditions

The system includes automated onboarding that triggers when:
- User has token balance but no locked tokens
- Guides through approval and locking process
- Includes educational dialogs explaining the mechanism

### Governance Workflow

Lock-to-Vote integrates with the standard Aragon governance flow:
- Proposal creation through the LockToVote plugin
- Voting period with locked token validation
- Execution phase allowing token unlocking
- Result enforcement based on approval thresholds

### Security Considerations

- **Unlock Guards**: Prevent unlocking during active voting periods where it would affect outcomes
- **Double-spend Prevention**: Locked tokens cannot be used elsewhere
- **Transparent Voting Power**: Voting power directly reflects locked amounts
- **Emergency Mechanisms**: Allow protocol recovery even with locked tokens

## Future Considerations

The Lock-to-Vote mechanism provides a foundation for more advanced governance patterns:

- **Quadratic Voting**: Could be extended with quadratic formulas on locked amounts
- **Conviction Voting**: Time-locked tokens could accumulate conviction weight
- **Liquid Democracy**: Could incorporate delegation while maintaining lock guarantees
- **Cross-chain**: Lock managers could be extended to support cross-chain voting

This overview supplements the detailed onboarding conditions document by providing the high-level context and user experience perspective of the Lock-to-Vote feature.