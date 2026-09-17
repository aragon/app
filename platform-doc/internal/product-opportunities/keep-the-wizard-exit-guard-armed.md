---
type: opportunity
title: Keep the wizard exit guard armed
tags: [design, interaction, wizard]
status: candidate
source: interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md)
---

# Keep the wizard exit guard armed

## User story

As a person completing a wizard, I want the app to keep warning me before I leave unfinished work after closing a nested flow, so that I can avoid losing my inputs and navigate back predictably.

## Context + benefit

The shared [wizard](../../application/wizard.md) exit protection has two issues identified from code inspection; they have not yet been reproduced in a browser.

Closing a nested dialog wizard can disable the parent wizard's warning for its close control and in-app links for the rest of that unfinished session. Opening and closing an Add body flow in the governance designer is one example. The parent's browser-Back and reload protections remain active. Separately, arming the protection adds a browser-history entry that is never removed, which can disrupt Back navigation after a nested flow.

The candidate would preserve the parent's exit protection for as long as it has unfinished work and keep browser history consistent when nested flows close. This would reduce accidental input loss and unexpected navigation across wizards that share the protection.

Before ticketing, reproduce both behaviors in a browser and choose how nested flows should maintain and release protection. Decide whether programmatic navigation and redirects should also be covered; current warnings cover clicked links, browser Back, and reload or close. Add coverage for both the shared exit protection and guarded links, which currently lack tests.
