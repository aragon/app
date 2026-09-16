---
type: task
title: Review the remaining drafts
tags: [maintenance, cross-cutting]
status: ready
next_actor: owner
source: existing post-structure draft review commission (2026-08-05), converted from its backlog row under the product-owner task-ownership rule (2026-09-10)
---

# Review the remaining drafts

Complete the remaining owner review for the current documentation cycle after the structural audits have settled the pages. Use the live draft query rather than a fixed count; the cohort includes pages created, split, or substantively changed by those audits and any previously approved anchor returned to draft.

The owner completed the eight-page foundational cohort on 2026-09-15: Plugin compatibility, Aragon-deployed plugins, Contract upgrades, Target, Safe, Stage, Proposal, and Proposal status. Their corrections are applied and all eight are cleared from draft. Consume these outcomes without repeating their reviews unless subsequent substantive changes reopen them. The close-out is recorded in [log.md](../log.md).

[Optimistic governance](../../../governance/optimistic-governance.md) remains draft under `review-governance-safeguards-page-boundaries`, which owns its outstanding review and resulting follow-up. Consume that disposition here without a duplicate review.

**Next action — owner:** Review the remaining pages in the live draft query, using the completed [post-merge section recheck](../section-fit-and-location.md#post-merge-section-recheck) and the applied foundational outcomes.

The remaining scope includes [Action simulation](../../../application/action-simulation.md), [Scoped authority](../../../access-control/scoped-authority.md), [Authorization and execution](../../../access-control/authorization-and-execution.md), [Plugin](../../../governance/plugin.md), [Governance process](../../../governance/process.md), [Alerts and advisories](../../../application/alerts.md), and the [Voting Terminal design reference](../../design/voting-terminal-reference.md). Plugin compatibility owns the reviewed support categories and unknown-plugin explanation. Governance process owns staged composition and configuration; Proposal owns the reviewed staged lifecycle.

[Execution routing](../../../application/execution-routing.md) remains in this broader review alongside [Proposal creation](../../../governance/proposal-creation.md). Review their shared process selection, creation checks, action assembly, and current direct-execution entry point together. These pages were outside the completed foundational cohort.

## Work

- Review every page returned by `wiki --root . list --where status=draft` for product meaning, terminology, boundaries, and relationships.
- Check the application-page crosswalk and its finite coverage/evidence follow-up before approving an affected page. Resolve that work or apply an explicit relevance or scope disposition first; a still-material unsupported claim keeps the page in draft. Other pages can progress independently, and already applied foundational reviews are not repeated unless a substantive change reopens them.
- Have the agent apply each supplied correction, reconcile consequential backlinks and the draft inventory, and run the voice preflight before clearing settled pages from draft. Keep unresolved review decisions in this task or a distinct finite task when the outcome warrants it.

## Done when

- The authoritative draft query is empty for this review cycle and every correction is applied across its affected pages.
- The coverage crosswalk records resolved or explicit scope/relevance dispositions for material follow-up affecting the reviewed cohort; no page was approved merely by moving its unresolved claim into another task.
- The close-out is recorded in log.md, its board row and task file are removed, and the composite wiki gate passes; re-evaluate run-the-first-post-review-consistency-sweep against its trigger.
