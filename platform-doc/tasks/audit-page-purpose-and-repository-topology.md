---
type: task
title: Audit every page's purpose and the repository topology
tags: [maintenance, cross-cutting]
status: blocked
next_actor: none
source: product-owner repository-ontology commission + semantic-anchor review sequencing (2026-08-05)
---

# Audit every page's purpose and the repository topology

Run one finite, repo-wide purpose (telos) and information-architecture audit after the currently queued source-mining tasks and terminology review have settled their page claims and the owner has reviewed the fixed semantic-anchor cohort on the backlog. Account for why every Markdown page exists, what role it plays, and how the pages work as a set; then apply the supported structural dispositions and make each retained platform page's opening state its purpose clearly. This task owns page boundaries and the aggregate topology and taxonomy, not the fit of individual sections or sentence-level and factual review.

**Trigger:** review-dao-terminology-violations and reconcile-product-releases-since-1-35 are complete, and every page in the backlog's fixed semantic-anchor cohort has been reviewed, corrected, and cleared of draft status. The Permission Viewer mining slice is already complete.

## What this unblocks

- The owner's remaining-draft review — each page will say what it is for before its unsettled claims are reviewed.
- The root [index](../index.md) and every area index — their navigation will reflect deliberate page roles and boundaries rather than accumulated filenames.
- The later guide-layer portfolio decision — it can start from a clarified capability and concept graph instead of inferring page roles again.

## Work

- Treat the owner-approved meaning, vocabulary, and distinctions on [Value proposition](../value-proposition.md), [Platform design principles](../principles.md), [Account](../accounts/account.md), [Plugin](../governance/plugin.md), [Governance process](../governance/process.md), [Body](../governance/body.md), [Action](../governance/action.md), [Proposal](../governance/proposal.md), and [Action builder](../governance/action-builder.md) as semantic input rather than hypotheses to silently re-derive. Still test their page boundaries, types, filing, and place in the topology; preserve their approved claims through any structural disposition, and return a page to `status: draft` if the pass changes its meaning or boundary materially.
- Build a complete working inventory from the composite wiki graph and the repository's tracked Markdown files. For every file, record its path, current `type` or structural role, one-sentence purpose, intended reader or use, unique responsibility, and a disposition: keep, reframe, retype, refile, split, merge, or retire. Include ignored operating documents and boards so their repository role is explicit; treat transient task entries as a class and verify their bounded outcome and board fit rather than forcing them into the product-page shape.
- Account for every `protocol-doc/` entry as read-only upstream context. Compare its purpose and scope with platform pages closely enough to find duplicated protocol mechanisms or a confused layer boundary, but never edit, move, merge, or manufacture backlinks into the submodule.
- Compare the inventory in aggregate against the area structure, type vocabulary, indexes, links, and backlinks. Identify overloaded pages, duplicated ownership, one idea accidentally split across pages, related-but-distinct ideas accidentally merged, mismatches between purpose and `type`, misfiled pages, and navigation surfaces that imply the wrong topology.
- Apply every evidence-supported disposition. Preserve the define-once-link-everywhere rule, keep related but distinct concepts separate and linked, use `wiki move` for any relocation, update all affected indexes and backlinks, and leave no retired or merged page stranded in navigation.
- Rewrite or confirm the opening of every retained, durable platform-owned page so it states what the page is for, the scope it owns, and—where confusion is likely—what nearby page or layer owns the adjacent concern. Keep the language native to the page; do not add repetitive template boilerplate to already-clear openings.
- Resolve classification calls from repository evidence first. If a material split, merge, retirement, or purpose call genuinely depends on product intent, park the task as `in-progress`, record the finding under `## Progress`, and move its single board row to **Ready for your input** with the bounded decision or decisions. Put a page-local genuine question on its page as well; do not leave an ask only in a session message.

## Where to look

- `wiki --root . list --format json`, `wiki --root . property type --counts`, every folder index, and the root [index](../index.md) — the declared inventory and navigation model.
- `wiki --root . outline`, `links`, and `backlinks` for each substantive entry — its current shape, dependencies, and consumers.
- `git ls-files '*.md'` — tracked operating and planning documents that the wiki intentionally ignores.
- [WORKFLOW.md](../WORKFLOW.md) and [AGENTS.md](../AGENTS.md) — the intended roles, layer boundary, type vocabulary, and one-thing-per-entry rule.

## Scope boundary

Do not audit whether each section supports its page; audit-section-fit-and-location owns that second pass. Do not line-edit prose, re-verify product claims against source code, redesign the guide portfolio, or absorb the correction-driven terminology and `source:`-style work owned by run-the-first-post-review-consistency-sweep. Do not read or process `inbox/`, `raw/`, or `research/`, and do not mutate `protocol-doc/`.

## Done when

- The working inventory accounts for every tracked platform Markdown file and every indexed upstream entry, with a stated role or purpose and an explicit disposition.
- Every evidence-supported split, merge, retype, refile, reframe, or retirement is applied safely; all resulting pages are atomic, linked, and reachable through the right navigation surface.
- Every retained, durable platform-owned page has an accurate opening that makes its purpose and scope clear, and the root and area indexes describe the resulting topology.
- Every previously approved semantic anchor that received a substantive purpose, boundary, or content change has returned to `status: draft`; graph-safe moves and link-only repairs do not reopen review by themselves.
- Every material owner decision raised by the pass has been surfaced on the board, answered, and applied; no unresolved ask exists only in Progress or a session message.
- The close-out records the aggregate topology and taxonomy decisions in log.md, then removes the board row and task file and runs the composite wiki gate.
