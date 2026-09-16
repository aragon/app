---
type: capability
title: Token panel
tags: [governance, voting, onboarding]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app and app-backend verification (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Token panel

The token panel is the actionable participation surface for a token-based body. On the Members page it occupies the [collection page](../application/collection-pages.md) aside for the selected body; the [Member page](./member.md#member-page) shows participant identity, governance activity, delegation information, and statements.

## Available controls

The panel derives its controls from the selected token body's indexed settings:

- **Wrap** appears when the governance token wraps an underlying token and no voting escrow is configured. The holder enters an amount; when the wrapper's allowance is insufficient, approval precedes wrapping. In panel mode, the form also offers unwrapping for an existing wrapped balance; the onboarding-dialog version is wrap-only.
- **Lock** replaces Wrap when voting-escrow settings are present. It reuses the voting-escrow lock form, which also requires the escrow addresses to be available: the holder enters an amount, approves the escrow when needed, and then locks. The resulting voting power can then be delegated when the token supports delegation. Voting-escrow position, lock-list, withdrawal, and dynamic-delegation semantics belong to [veLocker](./velocker.md) rather than this general panel.
- **Delegate** appears only when the token is marked as supporting `delegate(address)`. A holder chooses themselves or another address, and the form prevents submission when the delegate has not changed. The delegate address is entered through the app's standard [address field](../application/address-input.md).

If none of those controls applies, the panel is absent. The backend derives the delegation flag by detecting the `delegate(address)` selector in the token bytecode; the app uses that same flag to omit the Delegate tab, the connection-time delegation watcher, the Members-list delegation card and delegate pin, and the member-profile delegation section. The connected-wallet pin remains independent of delegation support.

To select a voting setup based on whether your token exists and what it supports, use [Choose a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md). For the underlying mechanics, see [governance-token wrapping](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md) and [snapshot voting power and delegation](../protocol-doc/plugins/token-voting-plugin/voting-power.md). Approval, wrapping, locking, and delegation each use the shared transaction dialog through wallet approval and chain confirmation; these inline transactions do not add the backend-indexing phase used by typed transactions such as proposal creation.

The [Gauge voting](./gauge-voting.md) page offers its own Lock and Delegate forms in its aside; a third-party escrow configuration omits the in-app lock form there. For the availability limits, gauge selection, and epoch behavior, see [Gauge voting](./gauge-voting.md).

## Participation nudges

The app reuses the panel's forms in three ways so a holder can resume an incomplete participation setup. Connection-time watchers select the first eligible body of each kind and respond to a manual wallet connection, not a silent page-load reconnection — which is why a returning holder is not re-prompted on every page load; a prompt fires again on the next deliberate connection while its condition still holds:

- After a wallet connects manually on a DAO page, a delegation-capable token body can open delegation onboarding when the connected wallet has a positive governance-token balance and `delegates(wallet)` is zero or returns no result. An introduction leads to the same Delegate form used by the panel.
- A separate connection-time check looks for zero current votes together with a positive underlying-token balance. It opens the voting-escrow Lock introduction when the eligible body has a supported in-app voting escrow, or the wrapper introduction for a wrapped Token Voting body. A third-party Gauge escrow receives neither branch. After a successful wrap or supported escrow lock, the flow offers delegation only when its delegate read succeeds with exactly the zero address.
- The Members list applies the same balance-and-participation checks as a persistent re-entry point. It shows at most one onboarding card: Delegate takes priority, then Lock for a voting escrow, then Wrap for a wrapper token. Delegate and Wrap open their form dialogs directly; Lock first explains lock time and then continues to its form.

When the Aragon Profiles feature is enabled, its onboarding takes precedence while the profile check or dialog is active, so these token nudges wait until the identity prompt has finished.

The separate Lock to Vote plugin has its own lock-on-connect nudge and member panel beside these; it is not a token-panel or veLocker variant — see [Choose a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) for that plugin distinction. Its nudge follows the same connection rule: when a deliberate connection finds a positive balance of the plugin's token and nothing locked with the body's lock manager, an introduction opens and continues to the lock form. That prompt never leads into delegation — the Lock to Vote model has no delegation concept, so a successful lock is by itself enough to participate.
