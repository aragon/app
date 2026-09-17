---
type: reference
title: App CMS
tags: [repositories, cross-cutting, content, curation]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app and app-backend source verification (2026-08-04, see log.md) + product-owner briefing (2026-08-05, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md)
---

# App CMS

**App CMS** is the platform's off-chain source for selected content, curation, and presentation configuration. Its Git-backed data can reach the product independently of a main app release: the frontend reads current configuration for featured content and account-specific visibility, while the backend separately synchronizes the reported-spam-token list.

Its frontend-facing uses configure presentation rather than acting as a competing source of account state. Its spam feed is an off-chain safety classification synchronized by the backend. Neither path creates or changes the underlying onchain fact.

## Five established uses

1. **Featured accounts on Explore.** The Aragon team chooses the accounts in the [Explore page](./explore-page.md)'s featured carousel, and App CMS supplies that selection independently of an app deployment.
2. **Plugin visibility in datalists.** A per-account list of plugin addresses can hide installed plugins from plugin-backed [collection pages](./collection-pages.md). One reason is to avoid duplicate-looking member lists when two plugin instances represent the same stakeholder group or token census with different governance parameters. Those instances remain separate [bodies](../governance/body.md#bodies-that-span-multiple-processes), and hiding one is presentation-only: it neither uninstalls the plugin nor prevents existing proposals or details from resolving it.
3. **Navigation visibility.** Per-account configuration can hide links to specific default or plugin pages. Hiding the [gauge-voting](../governance/gauge-voting.md) link is the source's example; that page additionally redirects direct visits when its navigation link is configured as hidden. Current app behavior controls visibility, not labels, ordering, or arbitrary navigation behavior.
4. **Featured-delegate selection.** App CMS supplies delegate addresses for a specific account, network, and token-voting plugin. The list controls who is featured; it does not grant voting power, perform delegation, or define the participant profile. Featured-delegate lookup does not apply the plugin-visibility filter, and a featured address need not currently hold voting power. See the [Member page](../governance/member.md#member-page) for participant profiles and the [Members page](../governance/body.md#members-page) for the featured list.
5. **Reported-spam-token filtering.** App CMS carries the manual list of specifically reported token addresses. The backend synchronizes that list into its token records, marks entries as CMS-origin spam, and excludes them from the default [asset](../treasury/assets.md) and [transaction](../treasury/transactions.md) results. This manual override is distinct from general spam-detection heuristics.

## Delivery boundary

The frontend currently reads the featured-account, featured-delegate, and per-account visibility files from the `app-cms` repository's current `main` branch, using cached reads that revalidate in the background. Spam-token configuration takes a different path: `app-backend` fetches the CMS list and applies it to the data it serves, and that sync belongs to one backend service rather than the backend generally.

The frontend also reads a sanctioned-address list and a feature-flag file. The [governance designer](../governance/governance-designer.md)'s body-type picker offers the setup types deployed on the selected network without an address allowlist.

## Curation decisions

The `app-cms` repository is public, so anyone can propose a change. Only Aragon contributors can approve and merge changes; in practice, Aragon has authored and managed them. Aragon decides case by case, with the affected client, what the CMS hides. Hiding is the intended presentation result: the configured item is absent from the applicable UI, with no general policy requiring another app route to expose it. The underlying onchain state remains unchanged.

The boundary is clearest for [linked-account signaling](../accounts/linked-account.md#establishing-the-relationship). App CMS may configure whether a product feature is visible, but it deliberately does **not** maintain the linked-account relationship. That relationship is a mutually acknowledged onchain signal indexed by the backend.

CMS curation can select or suppress presentation. It leaves chain state, plugin installation, voting power, and linked-account relationships unchanged.
