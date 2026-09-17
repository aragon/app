---
type: decision
title: Removing the last governance process warns, never blocks
tags: [accounts, admin, governance]
source: product-owner briefing (2026-07-14) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md)
---

# Removing the last governance process warns, never blocks

Removing a [governance process](../governance/process.md) — including the last one the app knows about — is an ordinary operation. When a removal would leave no known process installed, the app **shows a warning and lets the user proceed**: the warning treatment for a permitted but consequential action, not an eligibility guard ([control availability](../design/control-availability.md)). There is no hard block, in the UI or in the protocol.

## Why

1. **The app only sees [known plugins](../governance/plugin.md).** Processes and [bodies](../governance/body.md) are product abstractions on top of plugins, and the app recognizes only the plugins it understands. An account may carry unknown plugins — intentionally installed, possibly holding permissions on the DAO — so "no known process remains" does not mean "the account can no longer act". Someone may legitimately use the app to uninstall every governance plugin it understands; the app has no grounds to stop them.
2. **Accounts are autonomous; the app never restricts them.** Whatever plugins hold permissions on an account are free to act, and the platform is unopinionated about which actions they take ([platform design principles](../principles.md)). Even removing *everything* is the account's right: like burning an EOA's keys and leaving the funds stranded, it may be unwise, but preventing it is not the platform's job. The protocol does not prevent the state either.

## Consequences

- The removal flow warns when the last known process is being removed; it never blocks. Removal runs through the process page's **uninstall** action — a two-step transaction flow ([governance designer](../governance/governance-designer.md)).
- The highest-risk case is removing the only process with an unconditional — **unrestricted** in the UI — Execute grant ([scoped authority](../access-control/scoped-authority.md)). Without another authorized route, the account loses its general-purpose governance path and becomes semi-immutable: not necessarily bricked, because an unknown or more narrowly authorized route may remain, but unable to make arbitrary changes through the removed process.
- An account can end up with no plugin the app recognizes — or with nothing holding execute permission at all. Both are legitimate states the platform tolerates.
- Warning copy states the fact — no known governance process would remain — and leaves the choice with the user.
- This warn-only rule concerns a valid action. It differs from [invariant validation](../design/invariant-validation.md), which refuses only a configuration that could never be satisfied.

## Open questions

- [ ] Is there any recovery path for an account where nothing holds execute permission anymore?
