---
type: opportunity
title: Use revealable address output consistently
tags: [design, security, addresses]
status: candidate
source: product-owner release-notes briefing + @aragon/app@1.38.0 and gov-ui-kit v2.10-v2.11 tagged-source reconciliation (2026-09-09, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Use revealable address output consistently

## User story

As a person inspecting an address, including with a keyboard or touch, I want to reveal and copy its complete checksummed value from the context I am reviewing, so that I can verify the exact account or contract behind a shortened label.

## Context + benefit

[Address display](../../application/address-display.md) keeps addresses compact and supports full-value inspection. Standalone displays offer keyboard focus, tap, and copy controls. Within an interactive row or graph node, the surrounding control owns activation: the compact label retains hover reveal, and linked labels navigate on tap.

Permission rows already open details with full addresses, copy controls, and explorer links; mobile list cards expose those details directly. Governance-body summaries and Settings also offer address or explorer controls. Permission graph nodes open details by pointer or touch, but nodes and edges cannot receive keyboard focus. Keyboard users can switch to List to inspect the filtered permission records.

The candidate would address remaining inspection gaps, including evaluating direct keyboard access within the graph. It would preserve existing details and explorer routes and add access where needed, helping people verify addresses while retaining the context of their review.

Before ticketing, determine which shortened addresses need reveal, copy, explorer access, or a combination. Verify pointer, keyboard, and touch behavior across lists, cards, graphs, and transaction surfaces, including that revealed and copied values are complete and checksummed.
