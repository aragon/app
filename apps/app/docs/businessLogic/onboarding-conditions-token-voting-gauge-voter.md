# Onboarding Conditions: Token Voting & Gauge Voter Plugins

This document describes onboarding conditions that are checked for a connected user when a DAO uses the **Token Voting** or **Gauge Voter** plugins.

> NOTE: A more special-case variant of Token Voting with wrapped tokens and LockToVote is covered in a separate document, see [onboarding-conditions-lock-to-vote-token-wrap.md](./onboarding-conditions-lock-to-vote-token-wrap.md).

---

## Architecture Overview

Watcher components run inside the DAO layout for every page load. Each watches a specific condition and fires a dialog when the user connects their wallet and the condition is true.

| Watcher | File | Plugins |
|---|---|---|
| `TokenDelegationOnboardingWatcher` | `src/plugins/tokenPlugin/components/tokenDelegationOnboardingWatcher/` | TOKEN_VOTING, GAUGE_VOTER |
| `TokenLockAndWrapOnboardingWatcher` | `src/plugins/tokenPlugin/components/tokenLockAndWrapOnboardingWatcher/` | TOKEN_VOTING (with escrow or wrapped token), GAUGE_VOTER |

All watchers are mounted in `src/modules/application/components/layouts/layoutDao/layoutDao.tsx`.

---

## Plugin Variants

Before listing conditions, it is important to understand the two distinct Token Voting configurations and how Gauge Voter differs:

### Standard Token Voting
- `plugin.settings.token.underlying === null`
- `plugin.votingEscrow` is `undefined`
- The governance token itself is an ERC20Votes token; the user holds it directly.
- Delegation is possible when `token.hasDelegate === true`.

### Token Voting with Voting Escrow Adapter
- `plugin.settings.token.underlying !== null` (underlying ERC20 token address set)
- `plugin.votingEscrow !== null` (contains `escrowAddress`, `exitQueueAddress`, `curveAddress`, `clockAddress`, `nftLockAddress`, `underlying`)
- `plugin.settings.votingEscrow` (optional escrow settings: `minDeposit`, `minLockTime`, `cooldown`, `maxTime`, `slope`, `bias`)
- The "governance token" address is an **escrow adapter** contract (not a real ERC20). Voting power comes from locked positions (NFT-based VE locks), not from token balance.
- `token.hasDelegate` is **always `true`** — escrow adapters always implement `delegate(address)`.
- The same lock dialog flow used by Gauge Voter is used here.

### Gauge Voter
- Always has `plugin.votingEscrow` (required, not optional).
- `plugin.settings.token.type === 'escrowAdapter'` — the token is explicitly marked as an adapter, not a real ERC20.
- `plugin.settings.token.underlying` is always set (address of the real ERC20 that gets locked).
- `plugin.settings.token.hasDelegate` is **always `true`** — escrow adapter contracts always implement `delegate(address)`, so delegation onboarding always applies.
- Voting power comes from VE locks (NFT positions). The `ivotesAdapter` contract on the Gauge Voter plugin exposes `getVotes()` as the aggregated view.

---

## Condition 1: Delegation — Token Voting & Gauge Voter

**Hook:** `useTokenDelegationOnboardingCheck`
(`src/plugins/tokenPlugin/hooks/useTokenDelegationOnboardingCheck/`)

**Eligible plugins:** TOKEN_VOTING **or** GAUGE_VOTER where `token.hasDelegate === true`

### Contract calls (on the governance token address)

| Call | Returns | Semantics for standard TV | Semantics for escrow adapter (TV+escrow / Gauge Voter) |
|---|---|---|---|
| `delegates(userAddress)` | Delegated-to address | Address the user delegated ERC20Votes power to | Address the user delegated VE lock voting power to |
| `balanceOf(userAddress)` | `uint256` | ERC-20 token balance (amount held) | **Count of lock NFT positions** owned — positive only after at least one lock is created |

### Trigger condition

```
shouldTrigger = delegate === zeroAddress (or null)  AND  balance > 0
```

For **standard Token Voting**: user holds governance tokens but has never delegated. Without a delegation call, `getVotes()` returns 0 regardless of balance.

For **escrow adapter** (Gauge Voter / TV+escrow): user has at least one lock position (`balanceOf(adapter) > 0`) but has never delegated voting power from those locks. This check fires **after** the first lock is created, not before.

### What does NOT trigger it

- `delegate !== zeroAddress` — user has already delegated (to self or another address).
- `balance === 0` — for standard TV: no tokens held. For escrow adapter: no lock positions exist yet (user has not locked anything).

### Dialog flow

1. `DELEGATION_ONBOARDING_INTRO` — explains why delegation is needed.
2. `DELEGATION_ONBOARDING_FORM` — lets the user delegate to themselves or a chosen address.

---

## Condition 2: Token Locking — Token Voting with Escrow Adapter & Gauge Voter

**Hook:** `useTokenLockAndWrapOnboardingCheck`
(`src/plugins/tokenPlugin/hooks/useTokenLockAndWrapOnboardingCheck/`)

**Eligible plugins:**
- GAUGE_VOTER (always eligible)
- TOKEN_VOTING where `plugin.settings.token.underlying !== null` AND `plugin.votingEscrow != null`

This condition does **not** apply to standard Token Voting (no underlying token, no escrow).

### Contract calls

| Call | Address | Returns |
|---|---|---|
| `getVotes(userAddress)` | Governance token / escrow adapter address | User's current voting power |
| `balanceOf(userAddress)` | **Underlying** token address | User's balance of the raw ERC20 |

For Gauge Voter, `getVotes` is read from the **escrow adapter** (`ivotesAdapter`) which aggregates voting power across all of the user's active VE lock positions.

### Trigger condition

```
shouldTrigger = getVotes(user) === 0  AND  balanceOf(underlying, user) > 0
```

The user holds the raw underlying token but has not yet locked any of it into the voting escrow, so their voting power is zero.

### What does NOT trigger it

- `getVotes > 0` — user already has at least one active lock contributing voting power.
- `balanceOf(underlying) === 0` — user holds no underlying tokens to lock.
- Plugin has no `underlying` token configured (standard Token Voting).

### Dialog flow

Both Gauge Voter and Token Voting with escrow adapter use the **Gauge Voter lock dialog sequence**:

1. `LOCK_ONBOARDING_INTRO` — introduces the locking requirement.
2. `LOCK_ONBOARDING_LOCK_TIME_INFO` — shows the time constraints from `plugin.settings.votingEscrow`:
   - **Minimum lock time** (`minLockTime` in seconds → converted to days) — minimum period before the lock can be queued for exit.
   - **Cooldown** (`cooldown` in seconds → converted to days) — waiting period after queuing exit before withdrawal is possible.
   - **Total commitment** = `minLockTime days + cooldown days`.
3. `LOCK_ONBOARDING_FORM` — lets the user choose an amount and lock duration.

### Voting power formula (for reference)

Once locked, voting power is calculated as:

```
votingPower = (amount × slope × min(timeElapsed, maxTime) + amount × bias) / 1e18
```

Where `slope`, `bias`, and `maxTime` come from `plugin.settings.votingEscrow`. Voting power increases with time elapsed since the lock epoch start, capped at `maxTime`. A lock that has been queued for exit (`lockExit.status === true`) contributes **zero** voting power.

### Post-lock delegation trigger (in-session)

For escrow adapter plugins, the lock form itself also triggers the delegation dialog immediately after a successful lock transaction, without waiting for the next wallet connection. This is handled in `gaugeVoterLockForm.tsx`:

```typescript
onSuccess: () => {
    invalidateQueries();
    if (token.hasDelegate) {
        openIfNeeded(); // opens delegation dialog if not yet delegated
    }
},
```

This means the intended in-session flow for a new Gauge Voter user is:
1. Lock check triggers on connect → user opens lock dialog and locks tokens
2. Lock form calls `openIfNeeded()` on success → delegation dialog opens immediately
3. User delegates within the same session

The two watcher-based checks act as a **safety net** for users who locked in a previous session but never delegated.

### Lock status lifecycle

| Status | Condition |
|---|---|
| `active` | `lockExit.status === false` — lock is earning voting power |
| `cooldown` | `lockExit.status === true` AND `now < queuedAt + minCooldown` |
| `available` | `lockExit.status === true` AND `now >= queuedAt + minCooldown` |

Only `active` locks contribute to `getVotes()`.

---

## Decision Matrix: Which Conditions Apply

| Plugin type | `token.hasDelegate` | `token.underlying` | `votingEscrow` | Delegation check | Lock check |
|---|---|---|---|---|---|
| Standard TOKEN_VOTING | `true` | `null` | absent | YES | NO |
| Standard TOKEN_VOTING | `false` | `null` | absent | NO | NO |
| TOKEN_VOTING + escrow adapter | always `true` | set | present | YES (always) | YES |
| GAUGE_VOTER | always `true` | set (always) | present (always) | YES (always) | YES |

**Important:** Both conditions are checked independently by separate watchers on each wallet connection event.

For **standard Token Voting** both can fire simultaneously (user holds tokens but has no delegation).

For **escrow adapter** plugins (Gauge Voter / TV+escrow) they target **sequential stages** and cannot both fire for a fresh user:
- Lock check requires `getVotes === 0` — impossible once any active lock exists.
- Delegation check requires `balanceOf(adapter) > 0` — impossible before the first lock is created.

The only edge case where both fire together is a user whose existing locks are all in the exit queue (`lockExit.status === true`), giving `getVotes === 0` and `balanceOf(adapter) > 0` simultaneously.

---

## Token Flag Reference: `hasDelegate` and `isGovernance`

Both flags are set by the backend's `TokenDetector` helper, which fetches the token contract's **bytecode** and checks for the presence of specific function selectors (keccak256 hashes). They are stored in the `Token` database document and returned via the API as part of the plugin settings.

### `hasDelegate`

**Detected by:** presence of `delegate(address)` in bytecode.

`true` means the contract implements the ERC20Votes write-side delegation method. A token holder must call `delegate(address)` at least once — even to themselves — to activate their voting power. Without this call, `getVotes()` returns 0 regardless of balance. This is what the delegation onboarding flow resolves.

**When is it true:**
- Any standard ERC20Votes token (e.g. OpenZeppelin `ERC20Votes`)
- All escrow adapter contracts (always implement `delegate(address)`)

**When is it false:**
- Plain ERC20 tokens with no governance extension
- Any token contract that does not include `delegate(address)`

### `isGovernance`

**Detected by:** presence of `getVotes(address)`, `getPastVotes(address,uint256)`, `getPastTotalSupply(uint256)` in bytecode.

`true` means the contract implements the ERC20Votes read interface — it can report voting power for an account at a given point in time. This is required for a token to be usable as a governance token in the plugin.

**When is it true:**
- Standard ERC20Votes tokens
- Escrow adapter contracts (they expose `getVotes` as an aggregated view over VE lock positions)

**When is it false:**
- Plain ERC20 tokens with no governance extension

### Relationship between the two

| `isGovernance` | `hasDelegate` | Meaning |
|---|---|---|
| `true` | `true` | Full ERC20Votes token — can read voting power and write delegations. Standard case. |
| `true` | `false` | Can report voting power but has no delegation mechanism (unusual; not used in practice by these plugins). |
| `false` | `false` | Plain ERC20 — no voting power, no delegation. |

In practice, for all tokens used by Token Voting and Gauge Voter, both flags are `true`. The `isGovernance` flag is not surfaced directly in the frontend plugin settings but determines whether the backend treats the token as a governance token at all. `hasDelegate` is the one the frontend uses to gate onboarding and UI features.

---

## Key Type Definitions

### `ITokenPluginSettingsToken`
```typescript
interface ITokenPluginSettingsToken extends IToken {
    hasDelegate: boolean;        // Whether ERC20Votes delegation is supported
    underlying: string | null;   // Set when tokens need locking/wrapping; null for plain ERC20Votes
}
```

### `ITokenPlugin`
```typescript
interface ITokenPlugin extends IDaoPlugin<ITokenPluginSettings> {
    votingEscrow?: {             // Present only when plugin uses a VE adapter
        curveAddress: string;
        exitQueueAddress: string;
        escrowAddress: string;
        clockAddress: string;
        nftLockAddress: string;
        underlying: string;
    };
}
```

### `IGaugeVoterPluginSettingsToken`
```typescript
interface IGaugeVoterPluginSettingsToken extends IToken {
    type: 'escrowAdapter';       // Always escrowAdapter — this is not a real ERC20
    underlying: string;          // Always set
    hasDelegate: boolean;        // Always true — escrow adapters always implement delegate(address)
}
```

### `ITokenPluginSettingsEscrowSettings` / `IGaugeVoterPluginSettingsEscrowSettings`
```typescript
interface ITokenPluginSettingsEscrowSettings {
    minDeposit: string;          // Minimum lock amount (wei)
    minLockTime: number;         // Seconds before exit can be queued
    cooldown: number;            // Seconds between queue and withdrawal
    maxTime: number;             // Cap on voting power accrual (seconds)
    slope: number;               // Linear voting power coefficient
    bias: number;                // Constant voting power coefficient
    feePercent?: number;         // Max exit fee (basis points) — dynamic exit queue
    minFeePercent?: number;      // Min exit fee (basis points) — dynamic exit queue
    minCooldown?: number;        // Min early withdrawal cooldown (seconds) — dynamic exit queue
}
```

---

## Summary Flow for a Newly Connected User

### Standard Token Voting

```
User connects wallet
        │
        ├─► TokenDelegationOnboardingWatcher
        │       token.hasDelegate === true?
        │       delegates(user) === zeroAddress AND balanceOf(token, user) > 0?
        │       → open DELEGATION_ONBOARDING_INTRO
        │
        └─► (lock/wrap check does not apply — no underlying token)
```

### Gauge Voter / Token Voting with Escrow Adapter

Two separate stages. The watchers act as safety nets; the primary in-session path goes through the lock form.

```
User connects wallet (first time — no locks yet)
        │
        ├─► TokenDelegationOnboardingWatcher
        │       balanceOf(adapter, user) === 0  →  does NOT trigger (no locks yet)
        │
        └─► TokenLockAndWrapOnboardingWatcher
                getVotes(adapter, user) === 0 AND balanceOf(underlying, user) > 0?
                → open LOCK_ONBOARDING_INTRO → LOCK_ONBOARDING_LOCK_TIME_INFO → LOCK_ONBOARDING_FORM
                        │
                        └─► on successful lock (in-session):
                                token.hasDelegate === true → openIfNeeded()
                                → open DELEGATION_ONBOARDING_INTRO → DELEGATION_ONBOARDING_FORM

User connects wallet (locked previously, never delegated)
        │
        ├─► TokenDelegationOnboardingWatcher
        │       balanceOf(adapter, user) > 0 AND delegates(user) === zeroAddress?
        │       → open DELEGATION_ONBOARDING_INTRO → DELEGATION_ONBOARDING_FORM
        │
        └─► TokenLockAndWrapOnboardingWatcher
                getVotes(adapter, user) > 0  →  does NOT trigger
```
