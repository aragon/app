---
type: capability
title: Dashboard
tags: [accounts, presentation]
status: draft
source: codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md) + @aragon/app@1.38.0 Aragon Notifications verification (2026-09-08) + tagged-source reconciliation (2026-09-09, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + data-view verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e (2026-09-13, backend source snapshot; API-version limits in log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md)
---

# Dashboard

The Dashboard is the overview a visitor reaches for one specific [account](./account.md): a header, a fixed set of data sections beside a persistent aside column, and links out to each section's full collection. It is distinct from the global [explore page](../application/explore-page.md), which lists many accounts and is not scoped to any one of them.

## Fixed section order

Outside the onboarding state below, the dashboard shows a header followed by three main-column sections in one fixed order — **Proposals**, then [**Members**](../governance/body.md#members-page), then **Assets**. The order is the same for every account — an app decision, with no per-account configuration. A section disappears only through the visibility gate below.

## Visibility gate

Proposals and Members share a single visibility condition: both render only if the account has at least one supported, app-recognized plugin. The [plugin support filter](../application/plugin-compatibility.md#visibility) excludes unresolved interfaces and instances the backend explicitly flags as unsupported before checking app recognition. Assets always renders because treasury data comes from the account's address. An account with no qualifying plugin therefore shows its assets while Proposals and Members are hidden.

## Onboarding

While the account is in its admin bootstrap, a page-level state replaces the header and the main-column sections — the aside column remains; see [admin flow](../governance/admin-flow.md#onboarding-dashboard) for what a visitor sees instead.

## Header

The default header shows three metrics:

| Metric | Scope |
| --- | --- |
| Treasury value in USD | The primary account and its [linked accounts](./linked-account.md), combined. |
| Proposals | The primary account's proposals from currently installed plugins, excluding sub-proposals. |
| Members | Distinct members across the primary account's supported, installed governance plugins. Linked-account members are not added to this total. |

A specific account can have a bespoke header, or a one-off piece of functionality in one place, built by the Aragon team and shipped with the app in a release; no configuration path adds or changes one at runtime, unlike the visibility settings [App CMS](../application/app-cms.md) delivers. An account without one gets the same default header as any other account.

## Account details

Beside those sections, an account-details card is always present: the account's chain, its address with a route to the explorer, its optional ENS name, and its launch date linking to the creation transaction — joined by a links card when the account has configured resources of its own. The details card also opens the account's [Permissions page](../access-control/permission-viewer.md#permissions-page). The aside column offers an account-specific Telegram entry point for [Aragon Notifications](../governance/aragon-notifications.md).

## Preview sections

Each visible section shows a small, fixed-size preview — three proposals, six members, three assets — and ends in a link to that section's full collection page, where [collection pages](../application/collection-pages.md) own browsing, filtering, and pagination. The dashboard abstracts first and offers the route onward: the section links lead to the full surfaces, and the account-details card carries the link to the authoritative record — the explorer for the address, the creation transaction for the launch.

Linked accounts join the previews according to the collection: Proposals can combine active processes across accounts, the ordinary Members preview offers bodies from the primary and linked accounts, and Assets combines their holdings. Choosing a process or body narrows its preview without changing the default header's counts.
