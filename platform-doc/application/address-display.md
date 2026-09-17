---
type: pattern
title: Address display
tags: [accounts, design, interaction, identity]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app verification (2026-08-04, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md); user-facing behavior split from design/address-input.md and design/abstract-then-drill-down.md in the product/internal content separation (2026-09-10, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Address display

Addresses shown outside a form, on member cards and member details, identity surfaces, permission views, finance details, and transaction views, offer a copy control when the surface supplies a value to copy; the control copies the supplied value exactly.

Compact displays in governance-body summaries, settings, and the [Permission Viewer](../access-control/permission-viewer.md) can reveal the full checksummed address behind a shortened value or a name.

A standalone display reveals on hover, keyboard focus, and tap, and offers copying; inside an interactive row or graph node, the display keeps its hover reveal while the surrounding control owns focus and clicks, and a linked label follows its destination on tap.

Copying never reinterprets or authorizes the value. The [address input](./address-input.md#controls) uses the same exact-copy rule while editing. Compact reveals preserve access to the full address without making it the default presentation.
