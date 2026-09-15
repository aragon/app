---
type: capability
title: Dashboard
tags: [accounts, presentation]
status: draft
source: codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md)
---

# Dashboard

The account-scoped overview a visitor reaches for one specific [account](./account.md): a header, a fixed set of data sections beside a persistent details aside, and links out to each section's full collection. It is distinct from the global [explore page](./explore-page.md), which lists many accounts and is not scoped to any one of them.

## Fixed section order

Outside the onboarding state below, the dashboard shows a header followed by three main-column sections in one fixed order — **Proposals**, then **Members**, then **Assets**. The order is the same for every account — an app decision, with no per-account configuration. A section disappears only through the visibility gate below.

Beside those sections, a details aside is always present: the account's chain, its address with a route to the explorer, its optional ENS name, and its launch date linking to the creation transaction — joined by a links card when the account has configured resources of its own.

## Visibility gate

Proposals and Members share a single visibility condition: both render only if the account has at least one supported, app-recognized plugin. Assets carries no such gate and always renders, because treasury data is read from the account's own address rather than from any plugin. The consequence a visitor sees: an account none of whose plugins this app recognizes still shows its assets, but shows no proposals section and no members section at all — the sections are hidden, not shown empty ([control availability](../design/control-availability.md)). Both the shared gate and its asymmetry against Assets are app decisions.

## Onboarding

While the account is in its admin bootstrap, a page-level state replaces the header and the main-column sections — the details aside remains; see [admin flow](./admin-flow.md#onboarding-dashboard) for what a visitor sees instead.

## Header slot

The header is one of the app's per-account [DAO slots](../design/dao-slots.md): a specific account can ship a bespoke header, and an account without one gets the same default header as any other account.

## Preview sections

Each visible section shows a small, fixed-size preview — three proposals, six members, three assets — and ends in a link to that section's full collection page, where [datalist pages](../design/datalist-page.md) own browsing, filtering, and pagination. The dashboard abstracts first and offers the route onward: the section links lead to the full surfaces, and the details aside carries the [drill-down](../design/abstract-then-drill-down.md) to the authoritative record — the explorer for the address, the creation transaction for the launch.
