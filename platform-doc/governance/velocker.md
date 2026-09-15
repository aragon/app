---
type: capability
title: veLocker
tags: [governance, voting, delegation]
status: draft
source: product-owner veLocker marketing brief (raw/marketing_briefs.md) + "veLockers (vote escrow lockers)" release-note category (inbox/2026-08-03-release-notes-ordered.md; 1.7.0, 1.11, 1.14, and 1.20.22 as dictated—likely 1.22), both 2026-08-03; app, app-backend, and aragon/ve-governance verification + product-owner scope answer (2026-08-04, see log.md)
---

# veLocker

A **veLocker** lets a holder lock an underlying token into independent vote-escrow positions whose voting power changes with time. In the app it is a participation capability of a token-based body, not a separately installable governance plugin: the locker exposes an `IVotes`-compatible token to [Token Voting](../protocol-doc/plugins/token-voting-plugin.md), while the app adds the lock and delegation experience around that token. The underlying token need not itself implement `IVotes`; the vote-escrow adapter supplies the voting interface used by Token Voting.

Current frontend and backend source contain the inspected recognition and interaction paths. The backend recognizes a compatible vote-escrow shape behind the Token Voting token and indexes its escrow settings; the frontend then renders the supported controls on the DAO's Members page. This verifies the capability in the current app code, but not a live production deployment.

## Participation through the Token panel

For a Token Voting body backed by a recognized veLocker, the Members-page [Token panel](./token-panel.md) exposes **Lock** when indexed voting-escrow settings exist and **Delegate** when the token advertises `delegate(address)`. That page owns the panel's placement, allowance-dependent approval, shared form behavior, onboarding prompts, and member-list order. The veLocker-specific journey is:

1. **Lock.** Enter an amount of the underlying token, approve the escrow when needed, and create the lock. When the deployment has a rising curve, the form previews how that amount's voting power changes over time; it hides the chart when the curve's slope is flat.
2. **View locks.** Open the locks dialog to see each independent position and its current state. Every listed lock shows its own current voting power in real time.
3. **Unlock and withdraw.** An eligible lock can enter its exit process. When a cooldown is configured, the position moves from active to cooldown and becomes withdrawable only after the applicable waiting condition; the holder then claims the remaining underlying balance, less any applicable exit fee.
4. **Delegate and vote.** Delegating to oneself or another address activates the corresponding voting power. The holder or delegate can then vote on Token Voting proposals through the same application, just as with another Token Voting token.

The minimum time before a lock may enter its exit process is deployment-configurable.

## Voting power and dynamic delegation

The adapter presents an `IVotes` interface for governance. The app-verified pairing is [Token Voting](../protocol-doc/plugins/token-voting-plugin.md), which can also serve as a body in a [staged process](./staged-proposals.md). Another governance plugin can consume the adapter only when it is compatible with the interface operations and timestamp clock the adapter supplies. Token Voting supports that timestamp clock.

Like ordinary `IVotes`, a holder must assign a delegate—even when voting for themselves—to activate voting power; the protocol's [voting-power page](../protocol-doc/plugins/token-voting-plugin/voting-power.md#delegation) owns that general rule. In the app-supported default path, the veLocker adds **dynamic delegation**: after an account chooses a delegate, the delegate's weight tracks the holder's changing time-varying power—including changes over time, new locks, and unlocks—without requiring the holder to repeat the address-level delegation.

## Withdrawal fees and position state

A deployment may charge a dynamic fee for early withdrawal. Release 1.14 defines the fee's economic destination as the DAO and records the policy as client-configured rather than configured by Aragon in the app. The lock list and withdrawal dialog show the applicable position state and fee before the transaction; they do not provide a self-service fee-policy editor.

This page deliberately stops at app-visible behavior. Multiplier curves, escrow checkpointing, exit-queue calculations, the adapter's delegation hooks, and the fee curve are contract mechanisms. They belong to the upstream protocol layer, and the public [`aragon/ve-governance`](https://github.com/aragon/ve-governance) repository is their authoritative source.

## Availability and deployment boundary

veLocker is [partially supported](../partially-supported-plugins.md): the app supports participation in a compatible installed deployment, but the Governance Designer has no self-service veLocker setup or no-code deployer. A team can arrange an Aragon services engagement. The public repository supplies the contracts and a deployment factory, making self-deployment technically possible; this is not a promise of a supported self-deployment runbook. The source brief specifies OSx v1.4 or later as the compatibility boundary.

## Different from Lock to Vote

Both capabilities involve locking tokens, but they feed governance differently. A veLocker escrows positions, derives time-weighted power, and exposes that power through `IVotes` to Token Voting. [Lock to Vote](../protocol-doc/plugins/lock-to-vote-plugin.md) is a separate governance plugin in which tokens are locked directly for live voting power. The two are not compatible for the same escrowed position because the holder no longer possesses the underlying tokens that Lock to Vote would take into custody. See [choosing a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) for the setup decision.

## Scope: gauges are separate

Gauges are sometimes grouped with veLockers under "ve-governance," but they are not part of the veLocker capability. [Gauge voting](./gauge-voting.md) owns gauge selection, epochs, and allocation.
