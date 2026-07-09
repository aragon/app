# Onboarding Conditions: Lock-to-Vote Plugin & Token Wrap (Token Voting)

This document covers two onboarding flows that are related to **standard Token Voting** but represent distinct
mechanisms for activating voting power:

- **Lock-to-Vote (L2V)** — a separate plugin where tokens are locked into a lock manager contract to gain voting power.
- **Token Wrap** — a variant of standard Token Voting where an underlying ERC20 must first be wrapped into an
  ERC20Votes-compatible governance token before voting is possible.

For the Gauge Voter and Token Voting with voting escrow adapter flows, see
[onboarding-conditions-token-voting-gauge-voter.md](./onboarding-conditions-token-voting-gauge-voter.md).

---

## How These Relate to Standard Token Voting

Standard Token Voting (`PluginInterfaceType.TOKEN_VOTING`) works with a plain ERC20Votes token that the user holds
directly. Voting power is activated via delegation (`delegate(address)`). No locking or wrapping is involved.

Both flows in this document extend or replace that baseline:

| Aspect | Standard TV | Token Wrap (TV variant) | Lock-to-Vote |
|---|---|---|---|
| Plugin type | `TOKEN_VOTING` | `TOKEN_VOTING` | `LOCK_TO_VOTE` |
| `token.underlying` | `null` | set (address of raw ERC20) | N/A (no underlying concept) |
| `plugin.votingEscrow` | absent | absent | N/A |
| `plugin.lockManagerAddress` | N/A | N/A | set |
| Voting power source | ERC20Votes balance | Wrapped ERC20Votes balance | Amount locked in lock manager |
| Voting power ratio | 1:1 with balance | 1:1 with wrapped balance | 1:1 with locked amount |
| Time-based multipliers | No | No | No |
| Delegation required | If `hasDelegate=true` | If `hasDelegate=true` (on wrapped token) | **Never** — no delegation concept |
| Token type in settings | plain `IToken` | `ITokenPluginSettingsToken` with `underlying` | plain `IToken` (no `hasDelegate`, no `underlying`) |

---

## Architecture Overview

### Token Wrap

The `TokenLockAndWrapOnboardingWatcher` (shared with Gauge Voter) handles the wrap path. It identifies the eligible
plugin as a `TOKEN_VOTING` where `token.underlying != null` **and** `plugin.votingEscrow == null`. In that case it
routes to the wrap dialog sequence rather than the lock dialog sequence.

The `TokenDelegationOnboardingWatcher` also runs independently and may fire after wrapping if `token.hasDelegate === true`.

### Lock-to-Vote

A dedicated `LockToVoteLockOnboardingWatcher` handles L2V. It only looks for `LOCK_TO_VOTE` plugins and uses the
`lockManagerAddress` from the plugin object (not present on Token Voting plugins).

All three watchers are mounted in `src/modules/application/components/layouts/layoutDao/layoutDao.tsx`.

---

## Token Wrap Onboarding

**Plugin type:** `TOKEN_VOTING` with `token.underlying != null` AND `plugin.votingEscrow == null`

**Watcher:** `TokenLockAndWrapOnboardingWatcher`
(`src/plugins/tokenPlugin/components/tokenLockAndWrapOnboardingWatcher/`)

**Hook:** `useTokenLockAndWrapOnboardingCheck`
(`src/plugins/tokenPlugin/hooks/useTokenLockAndWrapOnboardingCheck/`)

### What "wrapping" means

The governance token is an **ERC20Wrapper** contract (OpenZeppelin pattern). It wraps an underlying plain ERC20 and
exposes the ERC20Votes interface. Wrapping is 1:1: depositing N underlying tokens mints N wrapped tokens. Wrapped tokens
implement `getVotes` / `delegate` / `delegates`. The underlying token does not.

`token.address` = the wrapped governance token (ERC20Wrapper + ERC20Votes)
`token.underlying` = the raw ERC20 token the user actually holds

### Contract calls

| Call | Address | Returns |
|---|---|---|
| `getVotes(userAddress)` | `token.address` (wrapped governance token) | User's current voting power from wrapped tokens |
| `balanceOf(userAddress)` | `token.underlying` (raw ERC20) | User's unwrapped token balance |

### Trigger condition

```
shouldTrigger = getVotes(user) === 0  AND  balanceOf(underlying, user) > 0
```

User holds the raw underlying token but has zero wrapped balance (and therefore zero voting power). Note that
`getVotes === 0` will also be true if the user has wrapped tokens but not yet delegated — however, the delegation
watcher handles that case separately.

### What does NOT trigger it

- `getVotes > 0` — user has already wrapped (and delegated) some tokens.
- `balanceOf(underlying) === 0` — user holds no unwrapped tokens.
- `token.underlying === null` — standard Token Voting; no wrapping needed.
- `plugin.votingEscrow != null` — escrow adapter variant; the lock dialog is used instead.

### Dialog flow

1. `WRAP_ONBOARDING_INTRO` — explains why wrapping is needed.
2. `WRAP_ONBOARDING_FORM` — lets the user choose an amount to wrap.

### Wrap transaction sequence

1. `approve(wrappedTokenAddress, amount)` on the underlying ERC20 — grants the wrapped token contract permission to pull tokens.
2. `depositFor(userAddress, amount)` on the wrapped token (ERC20Wrapper) — pulls underlying tokens and mints wrapped tokens 1:1.

Unwrapping reverses this: `withdrawTo(userAddress, amount)` on the wrapped token burns wrapped tokens and returns underlying.

### Delegation after wrapping

After a successful wrap, the wrap form calls `openIfNeeded()` from `useOpenDelegationOnboardingIfNeeded`. This checks
`delegates(user)` on the wrapped token and opens the delegation dialog if the result is `zeroAddress`.

This only applies when `token.hasDelegate === true` on the wrapped token. If `hasDelegate === false`, wrapping alone
is sufficient to participate in governance (voting power is auto-delegated or delegation is not required by the contract).

The `TokenDelegationOnboardingWatcher` also acts as a safety net: on the next wallet connection, if the user has
wrapped tokens but `delegates(user) === zeroAddress`, the delegation dialog fires again.

### Summary flow for Token Wrap

```
User connects wallet (unwrapped tokens only, no wrapped balance)
        │
        └─► TokenLockAndWrapOnboardingWatcher
                getVotes(wrappedToken, user) === 0 AND balanceOf(underlying, user) > 0?
                → open WRAP_ONBOARDING_INTRO → WRAP_ONBOARDING_FORM
                        │
                        └─► on successful wrap (in-session, if token.hasDelegate=true):
                                openIfNeeded(): delegates(wrappedToken, user) === zeroAddress?
                                → open DELEGATION_ONBOARDING_INTRO → DELEGATION_ONBOARDING_FORM

User connects wallet (wrapped but not yet delegated, if token.hasDelegate=true)
        │
        └─► TokenDelegationOnboardingWatcher
                delegates(wrappedToken, user) === zeroAddress AND balanceOf(wrappedToken, user) > 0?
                → open DELEGATION_ONBOARDING_INTRO → DELEGATION_ONBOARDING_FORM
```

---

## Lock-to-Vote Onboarding

**Plugin type:** `LOCK_TO_VOTE`

**Watcher:** `LockToVoteLockOnboardingWatcher`
(`src/plugins/lockToVotePlugin/components/lockToVoteLockOnboardingWatcher/`)

**Hook:** `useLockToVoteLockOnboardingCheck`
(`src/plugins/lockToVotePlugin/hooks/useLockToVoteLockOnboardingCheck/`)

### What "locking" means in L2V

Unlike Gauge Voter, there is no NFT, no time commitment, no voting escrow, and no multiplier. The lock manager is a
simple contract that holds ERC20 tokens on behalf of the user. Voting power equals the locked amount exactly (1:1).
Tokens can be unlocked at any time (subject to proposal activity guards — see `useUnlockGuard`).

`plugin.lockManagerAddress` = the lock manager contract that holds tokens and tracks locked balances
`plugin.settings.token.address` = the plain ERC20 token to be locked (no `underlying`, no `hasDelegate`)

### Contract calls

| Call | Address | Returns |
|---|---|---|
| `getLockedBalance(userAddress)` | `plugin.lockManagerAddress` | User's currently locked token amount |
| `balanceOf(userAddress)` | `plugin.settings.token.address` | User's available (unlocked) token balance |

These are on **two different contracts**. `getLockedBalance` is a lock manager–specific function, not a standard ERC20
method.

### Trigger condition

```
shouldTrigger = getLockedBalance(user) === 0  AND  balanceOf(token, user) > 0
```

User holds tokens but has not locked any of them into the lock manager. Unlike Gauge Voter, there is no `getVotes`
check — the lock manager is the sole source of voting power and there is no separate voting power aggregation layer.

### What does NOT trigger it

- `getLockedBalance > 0` — user has already locked some tokens.
- `balanceOf(token) === 0` — user holds no tokens to lock.

### Dialog flow

1. `LOCK_ONBOARDING_INTRO_L2V` — explains the locking requirement.
2. `LOCK_ONBOARDING_FORM_L2V` — lets the user choose an amount to lock.

### Lock transaction sequence

1. `approve(lockManagerAddress, amount)` on the ERC20 token — grants the lock manager permission to pull tokens.
2. The lock manager's `lockAndVote(proposalId, voteOption, amount)` or a standalone lock call — transfers tokens and records the locked balance.

### No delegation

`ILockToVotePluginSettingsToken` extends plain `IToken` with no additional fields — there is no `hasDelegate` and no
`underlying`. The `TokenDelegationOnboardingWatcher` does not look for `LOCK_TO_VOTE` plugins, so delegation
onboarding never fires for this plugin type.

### Summary flow for Lock-to-Vote

```
User connects wallet (tokens in wallet, nothing locked)
        │
        └─► LockToVoteLockOnboardingWatcher
                getLockedBalance(lockManager, user) === 0 AND balanceOf(token, user) > 0?
                → open LOCK_ONBOARDING_INTRO_L2V → LOCK_ONBOARDING_FORM_L2V
                        │
                        └─► on successful lock: user can vote immediately (no delegation needed)

User connects wallet (some tokens already locked)
        │
        └─► LockToVoteLockOnboardingWatcher
                getLockedBalance > 0 → does NOT trigger
```

---

## Key Differences Between the Two Flows

| | Token Wrap | Lock-to-Vote |
|---|---|---|
| **Plugin type** | `TOKEN_VOTING` | `LOCK_TO_VOTE` |
| **Distinguishing field** | `token.underlying != null` + `votingEscrow == null` | `plugin.lockManagerAddress` present |
| **Onboarding trigger** | `getVotes(wrapped) === 0 AND balanceOf(underlying) > 0` | `getLockedBalance === 0 AND balanceOf(token) > 0` |
| **Voting power check** | `getVotes()` on wrapped token | `getLockedBalance()` on lock manager |
| **Balance check** | `balanceOf()` on underlying raw ERC20 | `balanceOf()` on the token itself |
| **Two contracts involved** | Yes — wrapped token + underlying | Yes — lock manager + token |
| **Reversibility** | Unwrap anytime via `withdrawTo` | Unlock anytime (with activity guard) |
| **Delegation possible** | Yes — if `token.hasDelegate === true` | Never |
| **Post-action delegation prompt** | Yes — `openIfNeeded()` after wrap | No |
| **Voting power persistence** | Held until unwrapped | Held until unlocked |
| **Voting power formula** | 1:1 with wrapped balance (after delegation) | 1:1 with locked amount |
| **Dialog IDs** | `WRAP_ONBOARDING_INTRO`, `WRAP_ONBOARDING_FORM` | `LOCK_ONBOARDING_INTRO_L2V`, `LOCK_ONBOARDING_FORM_L2V` |

---

## Key Type Definitions

### `ILockToVotePlugin`
```typescript
interface ILockToVotePlugin extends IDaoPlugin<ILockToVotePluginSettings> {
    lockManagerAddress: string;   // Address of the lock manager contract
}
```

### `ILockToVotePluginSettings`
```typescript
interface ILockToVotePluginSettings extends Omit<ITokenPluginSettings, 'votingMode' | 'token' | 'votingEscrow'> {
    votingMode: DaoLockToVoteVotingMode;
    token: ILockToVotePluginSettingsToken;  // Plain IToken — no hasDelegate, no underlying
    minApprovalRatio: number;
}
```

### `ILockToVotePluginSettingsToken`
```typescript
// Extends plain IToken with no additional fields.
// No hasDelegate — delegation is not part of the L2V model.
// No underlying — only one token is involved.
interface ILockToVotePluginSettingsToken extends IToken {}
```

### Lock manager ABI (relevant functions)
```typescript
// Read
getLockedBalance(account: address): uint256   // User's locked amount

// Write (via lock manager)
lockAndVote(proposalId: uint256, voteOption: uint8, amount: uint256): void
vote(proposalId: uint256, voteOption: uint8): void
```

### `ITokenPluginSettingsToken` (for Token Wrap)
```typescript
interface ITokenPluginSettingsToken extends IToken {
    hasDelegate: boolean;        // Whether the wrapped token supports delegate(address)
    underlying: string | null;   // Non-null = wrapping required; this is the raw ERC20 address
}
```

### ERC20Wrapper ABI (wrap/unwrap)
```typescript
// Write (on the wrapped governance token)
depositFor(account: address, value: uint256): void   // Wrap: pull underlying, mint wrapped
withdrawTo(account: address, value: uint256): void   // Unwrap: burn wrapped, return underlying
```
