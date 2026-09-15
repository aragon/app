---
type: task
title: Audit every section against its page's purpose
tags: [maintenance, cross-cutting]
status: blocked
next_actor: none
source: product-owner repository-ontology commission + semantic-anchor review sequencing (2026-08-05)
---

# Audit every section against its page's purpose

Run one finite macro-structure audit across the retained platform pages after audit-page-purpose-and-repository-topology has settled what each page is for. Test whether every section helps realize its page's stated purpose and whether that content has the right canonical home; then apply the supported keep, move, merge, split, reframe, or retire dispositions. This is a section-level information-architecture pass, not a granular prose edit or factual re-verification.

**Trigger:** audit-page-purpose-and-repository-topology is complete, including its page splits, merges, moves, purpose statements, owner decisions, and reconciliation into the draft inventory of every page it returned to draft status.

## Work

- Honor the owner-approved semantic anchors and the page-purpose audit's settled roles. Reopen either only when the section inventory supplies concrete contradictory evidence; if moving, consolidating, or reframing material substantively changes a previously approved page, return that page to `status: draft` for the remaining-draft review.
- Build a working section inventory from `wiki outline` for every retained, durable platform-owned page identified by the page-purpose audit, including canonical entries, guides, indexes, boards, and operating documents. Exclude transient task entries, the chronological log, ignored working material, and the read-only upstream submodule.
- Test each section against the page's stated purpose: what job it performs, whether that job is necessary, whether the section is at the right level of detail, and whether another page already owns or should own it. Give every section a disposition: keep, reframe, merge within the page, move to another page, split into an atomic page, replace with a link, or retire.
- Compare the section inventory across pages before editing. Find content that is locally plausible but globally mislocated, repeated explanations that should have one canonical home, and section clusters that reveal a page is still carrying more than one purpose.
- Apply the dispositions at section granularity. Preserve every unique claim when moving material, replace removed duplication with a useful link where readers still need the connection, update affected introductions and navigation, and use the wiki graph before moving or retiring any load-bearing content.
- Resolve placement calls from the settled page purposes and graph evidence first. If a material disposition still depends on product intent, park the task as `in-progress`, record the finding under `## Progress`, and move its single board row to **Ready for your input** with a bounded ask. Put a page-local genuine question on its page as well; do not scatter speculative questions across otherwise-settled pages.

## Where to look

- The page-purpose audit's close-out in [log.md](../log.md) — the settled inventory, page roles, and topology decisions this pass must honor.
- `wiki --root . outline`, `links`, and `backlinks` for every in-scope page — the section map and its graph context.
- The root [index](../index.md), area indexes, and [WORKFLOW.md](../WORKFLOW.md) — the navigation, type, guide, and layer boundaries that determine the right home.

## Scope boundary

Do not reopen settled page-purpose or repository-taxonomy decisions merely because another arrangement is possible; reopen one only when the section inventory provides concrete contradictory evidence. Do not perform sentence-level editing, style normalization, source-code mining, factual verification, or the guide-use-case portfolio work owned by rethink-the-guide-layer. Do not audit transient tasks, log.md, `inbox/`, `raw/`, `research/`, or the read-only `protocol-doc/` content.

## Done when

- Every in-scope page and every substantive section in it appears in the working inventory with a purpose relationship and a disposition.
- Every disposition is applied, each unique claim has one canonical home, deliberate summaries link to that home, and no retained section is irrelevant to its page's purpose.
- Page openings, indexes, and links remain accurate after section moves and splits; the topology settled by the first pass is either preserved or explicitly corrected from concrete evidence.
- Every substantively changed approved page is present in the authoritative draft inventory, and the backlog's remaining-draft review is ready to move to **Ready for your input**.
- Every material owner decision raised by the pass has been surfaced on the board, answered, and applied; no unresolved ask exists only in Progress or a session message.
- The close-out records the aggregate section-location decisions in log.md, then removes the board row and task file and runs the composite wiki gate.
