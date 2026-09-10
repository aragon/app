---
type: capability
title: Token panel
tags: [governance, voting, onboarding]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app and app-backend verification (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Token panel

The token panel is the actionable participation surface for a token-based body. On the Members page it occupies the [datalist](../design/datalist-page.md) aside for the selected body; the member profile's balances, delegation totals, statement, featured-delegate context, and EFP context remain with [Aragon Profiles](../accounts/aragon-profiles.md).

## Available controls

The panel derives its controls from the selected token body's indexed settings:

- **Wrap** appears when the governance token wraps an underlying token and no voting escrow is configured. The holder enters an amount; when the wrapper's allowance is insufficient, approval precedes wrapping. In panel mode, the form also offers unwrapping for an existing wrapped balance; the onboarding-dialog version is wrap-only.
- **Lock** replaces Wrap when voting-escrow settings are present. It reuses the voting-escrow lock form, which also requires the escrow addresses to be available: the holder enters an amount, approves the escrow when needed, and then locks. The resulting voting power can then be delegated when the token supports delegation. Voting-escrow position, lock-list, withdrawal, and dynamic-delegation semantics belong to [veLocker](./velocker.md) rather than this general panel.
- **Delegate** appears only when the token is marked as supporting `delegate(address)`. A holder chooses themselves or another address, and the form prevents submission when the delegate has not changed.

If none of those controls applies, the panel is absent. The backend derives the delegation flag by detecting the `delegate(address)` selector in the token bytecode; the app uses that same flag to omit the Delegate tab, the connection-time delegation watcher, the Members-list delegation card and delegate pin, and the member-profile delegation section. The connected-wallet pin remains independent of delegation support. This applies the [control-availability pattern](../design/control-availability.md) consistently across those member surfaces.

These controls are the interface around existing token mechanics, not a second definition of them. [Choosing a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) owns the setup decision among a direct governance token, a wrapper, Lock to Vote, and a vote-escrow voting token. The protocol pages own [governance-token wrapping](../protocol-doc/plugins/token-voting-plugin/governance-tokens.md) and [snapshot voting power and delegation](../protocol-doc/plugins/token-voting-plugin/voting-power.md). Approval, wrapping, locking, and delegation each use the shared transaction dialog through wallet approval and chain confirmation; these inline transactions do not add the backend-indexing phase used by typed transactions such as proposal creation.

The [Gauge voting](./gauge-voting.md) page assembles a Gauge-specific Lock form and the shared Delegate form in its own aside instead of mounting the Members-page panel component. A third-party escrow configuration omits the in-app lock form there; the page retains its delegation control without applying the token panel's `hasDelegate` gate. Gauge voting owns the support disposition of those exceptions together with gauge selection and epoch mechanics.

## Participation nudges

The app reuses the panel's forms in three ways so a holder can resume an incomplete participation setup. Connection-time watchers select the first eligible body of each kind and respond to a manual wallet connection, not a silent page-load reconnection — which is why a returning holder is not re-prompted on every page load; a prompt fires again on the next deliberate connection while its condition still holds:

- After a wallet connects manually on a DAO page, a delegation-capable token body can open delegation onboarding when the connected wallet has a positive governance-token balance and `delegates(wallet)` is zero or returns no result. An introduction leads to the same Delegate form used by the panel.
- A separate connection-time check looks for zero current votes together with a positive underlying-token balance. It opens the voting-escrow Lock introduction when the eligible body has a supported in-app voting escrow, or the wrapper introduction for a wrapped Token Voting body. A third-party Gauge escrow receives neither branch. After a successful wrap or supported escrow lock, the flow offers delegation only when its delegate read succeeds with exactly the zero address.
- The Members list applies the same balance-and-participation checks as a persistent re-entry point. It shows at most one onboarding card: Delegate takes priority, then Lock for a voting escrow, then Wrap for a wrapper token. Delegate and Wrap open their form dialogs directly; Lock first explains lock time and then continues to its form.

When the Aragon Profiles feature is enabled, its onboarding takes precedence while the profile check or dialog is active, so these token nudges wait until the identity prompt has finished.

The separate Lock to Vote plugin has its own lock-on-connect nudge and member panel beside these; it is not a token-panel or veLocker variant — [choosing a token voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) owns that plugin distinction. Its nudge follows the same connection rule: when a deliberate connection finds a positive balance of the plugin's token and nothing locked with the body's lock manager, an introduction opens and continues to the lock form. That prompt never leads into delegation — the Lock to Vote model has no delegation concept, so a successful lock is by itself enough to participate.

## Member-list order

The member API defaults to voting power in descending order, with record ID as the descending tiebreaker. The Members page supplies no alternative sort or sort control, so this is the fixed order for that surface before client-side pinning. The rendered list then makes two contextual exceptions:

1. The connected wallet is first when its individually fetched member record has positive voting power.
2. A distinct, nonzero delegate is next when delegation is enabled for the token.

The client de-duplicates those addresses case-insensitively and preserves the backend order for every remaining member. If a live single-member read finds a pinned participant before that participant reaches the paginated index, the list keeps every indexed row and expands its displayed count rather than evicting someone from the page.

Delegate entry uses the shared [Address input](../design/address-input.md) pattern.
