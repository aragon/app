---
type: capability
title: Assets
tags: [treasury, indexing]
status: draft
source: product-owner briefing, 2026-07-16 (treasury) + product-owner release-notes briefing (2026-08-03, see log.md) + app-backend source verification (2026-08-04, app-backend@107103b4; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + data-view verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e (2026-09-13, backend source snapshot; API-version limits in log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Assets

The app shows what an account holds on its dedicated Assets page, summarizes the treasury total on the dashboard, and makes balances available when composing a proposal.

The Assets page is a [collection page](../application/collection-pages.md), reached from the nav bar, that lists the native assets and ERC-20 tokens currently held by the account ([the vault](./vault.md)).

With [linked accounts](../accounts/linked-account.md), the page defaults to **All assets**, combining holdings across the primary and linked accounts. Holdings of the same token appear as one row with their amounts and fiat values added together. Account tabs let the reader inspect the primary or a linked account individually; selecting the primary excludes its linked accounts.

Reloading the page or opening a shared link restores the account selection. With no linked accounts, the page shows the account's holdings without account tabs.

Selecting an ERC-20 row opens the token's record in the block explorer for its network. To reconcile a holding, use the selected account's address from [Settings](../accounts/settings.md#account-information) together with that token contract. The explorer record identifies the token; the app's fiat value also depends on its price source.

## How the app knows

The backend reconciles each account's holdings against chain data through the provider configured for that network: it reads native and token balances, removes stale holdings, and persists positive balances for the app to serve. The shared indexer performs per-network historical crawling and polling, while provider selection and related retrieval techniques vary by network. Prices and token imagery come from CoinGecko when available.

## Asset coverage

- **Native assets and ERC-20 tokens** held by the account: shown.
- **DeFi positions**: shown only when the protocol represents the position as an ERC-20 — a Morpho LP token for a liquidity position, say. Protocols that don't tokenize positions that way don't appear.
- **Other holdings**: NFTs and positions not represented by ERC-20 tokens do not appear on the Assets page.

The product keeps that view deliberately bounded rather than presenting itself as a complete financial application. For deeper treasury analytics, the page offers an address-scoped drill-down to [Octav](https://pro.octav.fi/); that external route does not expand the app's own coverage promise.

## Spam filtering

The backend applies an automated, deliberately imperfect heuristic to likely spam tokens and excludes matches from the default holdings view. A reported-address list delivered through [App CMS](../application/app-cms.md) is a separate manual override, not part of the heuristic. False positives and negatives remain possible; a suspected misclassification is a reason to contact the Aragon team ([getting help](../application/getting-help.md)).

## Where the knowledge surfaces

Because holdings are indexed, the app uses them beyond the Assets page:

- The **dashboard** shows the total treasury size. With [linked accounts](../accounts/linked-account.md) the total sums their treasuries too.
- **Transfer composition** uses indexed holdings to offer assets and balances in the [Action builder](../application/action-builder.md#transferring-assets), for proposals and direct transactions.
