---
type: opportunity
title: Keep the wizard exit guard armed
tags: [design, interaction, wizard]
status: candidate
source: interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md)
---

# Keep the wizard exit guard armed

This is a product-discovery candidate, not a roadmap commitment or a statement of the current [wizard](./wizard.md) exit-guard promise.

## Opportunity

The [wizard](./wizard.md) exit guard is one shared mechanism, which is its strength — every flow inherits it — and also means one leak reaches every flow. Two leaks exist, established by code reading rather than a browser run:

- **A nested dialog wizard disarms its parent's guard.** The guard's in-app-link half is an app-wide flag; when a nested dialog wizard closes, its own guard clears that flag unconditionally, and the still-dirty parent never re-arms it. After opening and closing a nested sub-flow (adding a body inside the governance designer, say), the parent full-screen wizard's close control and in-app links stop challenging for the rest of that dirty session. The browser-Back and reload halves stay armed, because the parent's own listeners persist.
- **Each arming pushes a sentinel history entry that is never removed**, so back-button behavior after a dirty nested sub-flow is left subtly off.

Both halves of the guard — the hook and the guarded link — are untested, which is worth weighing for a mechanism whose only job is preventing data loss.

## Before ticketing

- Reproduce the nested-flow disarm in a browser; the code path is unambiguous but the fix shape (re-arm on parent re-focus, or reference-count the flag) depends on how the flows compose in practice.
- Decide whether programmatic navigation (router pushes, redirects) should be covered at all — today only clicked links, browser Back, and reload/close are challenged — since any fix touches the same seam.
- Add tests for both halves while in there.
