---
type: reference
title: Product scope exclusions
tags: [maintenance, product-planning]
source: product-owner rulings (2026-08-05, see log.md)
---

# Product scope exclusions

This table is the source of truth for implemented source surfaces that are explicitly outside current product documentation because they are not live. It records present scope, not a roadmap or a catalogue of missing features. The publication process is defined in [WORKFLOW.md](./WORKFLOW.md).

| Source surface | Product state | Documentation disposition | Revisit trigger | Product opportunity |
|---|---|---|---|---|
| Automated capital flows, also called capital-flow policies — including routers, strategies, dispatch, the wizard, and account-specific controls | Not live | Excluded from canonical pages, guides, source-mining tasks, and opportunity intake as a feature | The product owner confirms launch | — |
| In-app support channel | In development; not live | Excluded from canonical pages, guides, and the live [reach-out pattern](./design/reach-out-to-the-team.md) | The product owner confirms launch | — |

An implementation finding about a live feature does not belong in this table merely because its code is unused or incomplete. Flag a candidate improvement with a `type: opportunity` entry and list it on [Product opportunities](./product-opportunities.md). If an excluded surface also has a distinct improvement candidate, link that entry in the final column without changing the surface's product state.
