---
type: task
title: Reconcile product releases since the 1.35 documentation pass
tags: [maintenance, cross-cutting]
status: ready
next_actor: agent
source: product-owner product-updates commission (2026-08-28) + capture-the-product-updates-braindump close-out (2026-08-03, see log.md) + Permission Viewer launch pass (2026-08-28, see log.md)
---

# Reconcile product releases since the 1.35 documentation pass

Run one finite catch-up over every official `aragon/app` release after `@aragon/app@1.35.0`, fixing the upper bound to the newest release available when the task starts. Give every product-facing release item a documented disposition and fold current behavior into its canonical owner. This pass must finish before audit-page-purpose-and-repository-topology consumes the graph; a later release interval gets a fresh task.

Treat the completed Permission Viewer launch pass as already-mined coverage inside this interval, and preserve its full disposition: the [Permission Viewer](../access-control/permission-viewer.md), its navigation and graph links, its draft-inventory row, the retired `permissions-page-gate`, the [selected-account context](../access-control/align-permission-viewer-details-with-selected-account.md) and [overlapping-filter recovery](../access-control/let-overlapping-permission-filters-be-cleared.md) opportunities, and the launch, verification, and marketing close-outs in [log.md](../log.md). Reconcile all Permission Viewer release items—including the list and graph views, unresolved-plugin visibility, top-level route and entry points, flag removal, condition details, and graph actor handling—without duplicating that work.

## Work

- Inventory the official app releases after 1.35 through the fixed upper bound and give every release-note item one disposition: existing coverage, canonical-page change, new draft, task, opportunity, scope exclusion or owner ruling, or no documentation change with a reason.
- Verify product-facing claims against the tagged app source and the owning backend or CMS source where needed; do not treat unreleased code as live product behavior.
- Apply current-product changes to their canonical owners, updating provenance, links, area maps, and draft state where the meaning changes.
- Reconcile the backlog, questions, gaps, tasks, opportunities, and structural-audit prerequisite, then record the completed release window in `log.md`.

## Where to look

- `../app/apps/app/CHANGELOG.md`, [official `aragon/app` releases](https://github.com/aragon/app/releases), and the matching tags and changesets. At commission time the latest official app release is `@aragon/app@1.38.0`.
- `../app`, `../app-backend`, [App CMS](../app-cms.md), and [Source repositories](../repositories.md) where a release item crosses those surfaces.
- [Log](../log.md), especially the 2026-08-03 product-updates close-out and the 2026-08-28 Permission Viewer entries.

## Done when

- Every app release after 1.35 through the fixed upper bound and every release-note item has an explicit disposition.
- Every documentation change is source-grounded, filed with its canonical owner, linked into the graph, and returned to draft when owner review is needed.
- The complete Permission Viewer launch surface remains covered with no duplicate page or stale `permissions-page-gate` reference.
- The task is closed out in `log.md`, its board row and file are retired, and the composite wiki and submodule gate passes.
