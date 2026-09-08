---
type: capability
title: Explore page
tags: [accounts, discovery, onboarding]
status: draft
source: original product vision document (product-owner, mined 2026-07-14, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner release-notes briefing (2026-08-03; releases 1.0.0, 1.2.1, and 1.24) + app and app-backend source verification (2026-08-04, see log.md)
---

# Explore page

The app's landing page: any visitor, wallet connected or not, can browse and find [accounts](./account.md). It is also the self-serve entry point into [account creation](./account-creation.md).

Apart from the account-creation flow it launches, it is the only surface in the app not scoped to a specific account — every account-area page is.

## Surface

The current page is one continuous discovery and getting-started surface:

1. A hero introduces the organizations governed through Aragon.
2. A **Featured** carousel presents a list supplied by [App CMS](../app-cms.md#five-established-uses); the release notes describe that list as hand-picked by the Aragon team. An entry may point to an external destination instead of an account hosted in the app.
3. Three **Getting started** cards offer distinct routes: contact the Aragon team through the assistance form, open the self-serve [account-creation](./account-creation.md) wizard, or continue to the developer portal.
4. One registry-backed account list has two modes:
   - **All accounts** shows active, non-hidden accounts on supported mainnet networks. Its fixed order is descending total assets in USD. The search box is labelled **Search by name, address, or ENS**; its server-side query also matches implementation and creator addresses, description, subdomain, and transaction hash. The current surface exposes no interactive sort control or additional filter.
   - **Member** is available only for a connected wallet. It shows accounts across all supported networks where that address is represented through at least one installed, supported membership-bearing plugin; one qualifying token-voting, delegated ve-lock, lock-to-vote, multisig, or admin membership is enough. Its fixed order is newest account first, and it uses the same search query. Disconnecting returns the list to **All accounts**.

Testnet suppression therefore belongs specifically to **All accounts**. It is not a user-selectable filter and does not apply to **Member**.

## Dashboard wording boundary

The release 1.24 phrase **onboarding dashboard** does not name a redesign of this page. Current source implements it as an individual account's [admin-flow](./admin-flow.md#onboarding-dashboard) state; the Explore hero, featured carousel, Getting-started cards, and account list remain the global landing page.
