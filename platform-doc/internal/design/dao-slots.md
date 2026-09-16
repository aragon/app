---
type: pattern
title: DAO slots
tags: [design, components]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + product-owner briefings (2026-09-11, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# DAO slots

A DAO slot gives a particular account a custom part of the Aragon experience, such as branded presentation or a specialized governance interaction. It keeps that account's needs separate from the shared flows used by every account.

DAO slots support custom branding and functionality commissioned for a specific client. They are built and shipped by Aragon; account owners do not configure new slots in the app.

Alchemix's custom voting plugins illustrate this extension point: account-specific slots integrate its delegation override and objection controls. Its governance account has not launched, and the integration is currently exclusive to Alchemix.

## DAO slots vs plugin slots

A [plugin slot](./plugin-slots.md) adapts the experience to a governance plugin. A DAO slot adapts it to the account being viewed. Both keep bespoke behavior within a defined boundary so the shared product journey remains reusable.
