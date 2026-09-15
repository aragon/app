---
type: pattern
title: DAO slots
tags: [design, components]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# DAO slots

The second slot kind in the app, alongside [plugin slots](./plugin-slots.md).

Every account-area page in the app is scoped to a specific account — the [explore page](../accounts/explore-page.md) and the creation flow it launches are the exceptions. A **DAO slot** is populated with a component unique to that specific account, kept in a folder of its own and injected wherever the slot sits on the page.

DAO slots are used for:

- **Custom branding** — a team wants something distinctive in the UI, such as a small branded header.
- **Unique, one-place functionality** — occasionally a client of Aragon wants one specific piece of functionality handled its own way, in one specific place.

The value is a defensive boundary: client-specific code is quarantined so the generic application skeleton stays reusable and modular. A bespoke addition belongs in its slot rather than spreading special cases through the flows every account uses.

Slot content ships with the app: each account's components are imported and registered in source when the app boots, so a bespoke slot is Aragon-team work delivered in a release — no configuration path adds or changes one at runtime.

## DAO slots vs plugin slots

A [plugin slot](./plugin-slots.md) populates from the *plugin* relevant to it. A DAO slot populates from the *account* the page is scoped to. Both let the generic app host bespoke, isolated logic without the generic flow needing to know about it.

The two are the **same mechanism under two conventions**: a client's account registers its slot content into the same registration table a plugin does, keyed by the account instead of the plugin, and generic screens resolve both the same way ([slot contract](./plugin-slots.md#the-slot-contract), [an account's registration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/daos/cryptex/index.ts#L10-L29)). What separates them is the naming and folder discipline — which is what makes the quarantine above a convention the team upholds rather than a boundary the machinery enforces.
