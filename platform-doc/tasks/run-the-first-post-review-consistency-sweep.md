---
type: task
title: Run the first post-review consistency sweep
tags: [maintenance, cross-cutting]
status: blocked
next_actor: none
source: imported pattern from a sibling base's backlog (2026-07-28 refinement) — process idea only, no content carried over — pause after the first real usage cycle to consolidate drift
---

# Run the first post-review consistency sweep

One finite consolidation pass after the owner's first full draft-review cycle. Corrections land page by page (the loop's step 2, backlinks included); what that per-correction step can't catch is the aggregate view — terminology drift between pages that never linked to each other, and conventions the cycle's volume of corrections proved wrong. This task takes that one aggregate look, makes the vocabulary calls it exposes, and is a one-time catch-up for corrections that landed before Grooming's tag-vocabulary sweep existed; a later cycle should be caught by routine grooming, not a fresh task by default.

**Trigger:** the drafts section empty (`wiki list --where status=draft` returns nothing) — or the owner declares the first review cycle done.

## Work

- Build the finding list: sweep the pages the cycle removed `status: draft` from (find them via git log over the cycle's date range) for terminology the corrections changed, links whose meaning shifted, and `source:` style drift.
- Resolve every finding on its pages.
- Make the calls the cycle exposes: the declared-but-unused types (`risk`, `example`) stay or go — align wiki.toml and WORKFLOW with the call — and align any WORKFLOW convention the cycle's practice contradicted.

## Done when

- The finding list exists and is run to zero — every terminology, link-meaning, and `source:`-style finding resolved on its pages, not judged by a subjective re-read.
- The `risk`/`example` stay-or-go call is made, and wiki.toml and WORKFLOW reflect it.
- Any convention the cycle disproved is aligned in WORKFLOW.
- The task is closed out in log.md, its board row removed, and its file deleted.
