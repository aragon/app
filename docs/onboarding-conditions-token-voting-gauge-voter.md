# Onboarding Conditions: Token Voting & Gauge Voter Plugins

This document describes all onboarding conditions that are checked for a connected user when a DAO uses the **Token Voting** or **Gauge Voter** plugins. Onboarding is triggered automatically on wallet connection if conditions are met.

---

## Architecture Overview

Three independent watcher components run inside the DAO layout for every page load. Each watches a specific condition and fires a dialog when the user connects their wallet and the condition is true.

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

| Call | Returns |
|---|---|
| `delegates(userAddress)` | The address to which voting power is delegated |
| `balanceOf(userAddress)` | Current token balance of the user |

### Trigger condition

```
shouldTrigger = delegate === zeroAddress (or null)  AND  balance > 0
```

The user holds governance tokens but has never delegated (including self-delegation). Because the ERC20Votes standard requires an explicit delegation call to activate voting power, a non-zero balance without delegation results in **zero on-chain voting power**.

### What does NOT trigger it

- `delegate !== zeroAddress` — user has already delegated (to self or another address).
- `balance === 0` — user holds no tokens; delegation is irrelevant.

### Dialog flow

1. `DELEGATION_ONBOARDING_INTRO` — explains why delegation is needed.
2. `DELEGATION_ONBOARDING_FORM` — lets the user delegate to themselves or a chosen address.

### Notes for Gauge Voter with escrow adapter

The governance token address in the context of this check is the **escrow adapter** address. The adapter exposes `delegates()` and `balanceOf()`. Because escrow adapters always implement `delegate(address)`, `hasDelegate` is always `true` for Gauge Voter — delegation onboarding always applies.

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

**Important:** Both conditions are checked independently. If both apply, both dialogs can trigger on the same wallet connection (sequentially, not simultaneously, as each watcher fires its own dialog on the `onConnected` event).

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

```
User connects wallet
        │
        ├─► TokenDelegationOnboardingWatcher
        │       Find plugin: (TOKEN_VOTING or GAUGE_VOTER) with token.hasDelegate=true
        │       Check: delegates(user) === zeroAddress AND balanceOf(token, user) > 0
        │       → if true: open DELEGATION_ONBOARDING_INTRO dialog
        │
        └─► TokenLockAndWrapOnboardingWatcher
                Find plugin: GAUGE_VOTER  OR  TOKEN_VOTING with token.underlying != null
                Check: getVotes(escrowAdapter, user) === 0 AND balanceOf(underlying, user) > 0
                → if true (and plugin is GAUGE_VOTER or TOKEN_VOTING with votingEscrow):
                      open LOCK_ONBOARDING_INTRO dialog (gauge lock flow)
```
