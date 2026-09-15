---
type: capability
title: Assets
tags: [treasury, indexing]
status: draft
source: product-owner briefing, 2026-07-16 (treasury) + product-owner release-notes briefing (2026-08-03, see log.md) + app-backend source verification (2026-08-04, app-backend@107103b4; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Assets

**User promise:** see what the account holds, everywhere it matters — a dedicated Assets page, the treasury total on the dashboard, and the account's balances at hand when composing a proposal.

The Assets page is a [datalist page](../design/datalist-page.md), reached from the nav bar, that lists the ERC-20 assets currently held by the account ([the vault](./vault.md)). With [linked accounts](../accounts/linked-account.md) the page can partition holdings per account — one tab per linked account, since the list has no other partitioning dimension.

## How the app knows

The backend reconciles each account's holdings against chain data through the provider configured for that network: it reads native and token balances, removes stale holdings, and persists positive balances for the app to serve. The shared indexer performs per-network historical crawling and polling, while provider selection and related retrieval techniques vary by network. Prices and token imagery come from CoinGecko when available.

Explorer-backed contract data is chain-dependent too: the backend selects a configured explorer API for the network, using Etherscan, Routescan, zkSync, or Blockscout integrations as appropriate. One product consequence is whether the [action builder](../governance/action-builder.md#understanding-actions) can use a contract's published ABI for decoded and basic views.

This is one documented slice of the platform's chain-data delivery; the broader live-read, indexing, consistency, and freshness model remains the knowledge gap on the [backlog](../backlog.md).

## Asset coverage

- **Native assets and ERC-20 tokens** held by the account: shown.
- **DeFi positions**: shown only when the protocol represents the position as an ERC-20 — a Morpho LP token for a liquidity position, say. Protocols that don't tokenize positions that way don't appear.
- **Other holdings**: NFTs and positions not represented by ERC-20 tokens do not appear on the Assets page.

The product keeps that view deliberately bounded rather than presenting itself as a complete financial application. For deeper treasury analytics, the page offers an address-scoped drill-down to [Octav](https://pro.octav.fi/); that external route does not expand the app's own coverage promise.

## Spam filtering

The backend applies an automated, deliberately imperfect heuristic to likely spam tokens and excludes matches from the default holdings view. A reported-address list delivered through [App CMS](../app-cms.md) is a separate manual override, not part of the heuristic. False positives and negatives remain possible; a suspected misclassification is a reason to [reach out to the Aragon team](../design/reach-out-to-the-team.md).

## Where the knowledge surfaces

Because holdings are indexed, the app uses them beyond the Assets page:

- The **dashboard** shows the total treasury size. With [linked accounts](../accounts/linked-account.md) the total sums their treasuries too.
- **Transfer composition**: composing a transfer — inside a [proposal](../governance/proposal.md) or in a [direct transaction](./create-transaction.md), which share the same transfer action — offers the held ERC-20s as the default route, each row carrying the asset's symbol, the amount held, and its fiat value.

That offer is a default, not a boundary. An **Add address** route sits above the holdings list, is the empty state's action, and appears on its own when a pasted address matches nothing the account holds; the address must resolve as an ERC-20 — otherwise the selector reports "Not a recognized token" — but is never checked against the holdings, and enters the form showing a balance of zero.

The amount is not capped by the balance either. A **Max** button fills in the amount held as a convenience, while the field's own rules require only a value greater than zero ([the amount rules](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/finance/components/assetInput/assetInput.tsx#L128-L145)), and the transfer path surfaces no balance error at all. The uncapped amount is deliberate rather than missing — the same input keeps the balance cap for token locking and wrapping, and the treasury transfer form is what switches that validation off ([the opt-out](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/finance/components/transferAssetForm/transferAssetForm.tsx#L77-L82)).
