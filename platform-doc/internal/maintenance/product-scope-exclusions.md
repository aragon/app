---
type: reference
title: Product scope exclusions
tags: [maintenance, product-planning]
source: product-owner rulings (2026-08-05, see log.md) + product-owner briefings (2026-09-11, see log.md) + product-owner BENQI scope clarification (2026-09-13, see log.md)
---

# Product scope exclusions

This table is the source of truth for implemented source surfaces that are explicitly outside current product documentation because they are not live. It records present scope, not a roadmap or a catalogue of missing features. The publication process is defined in [WORKFLOW.md](../../WORKFLOW.md).

[Client-specific integrations](./client-specific-integrations.md) records the separate audience boundary. A client-specific scope alone does not put an integration in this exclusion table, and launch does not broaden its supported audience.

| Source surface | Product state | Documentation disposition | Revisit trigger | Product opportunity |
|---|---|---|---|---|
| Automated capital flows, also called capital-flow policies — including routers, strategies, dispatch, the wizard, and account-specific controls | Not live | Excluded from canonical pages, guides, source-mining tasks, and opportunity intake as a feature | The product owner confirms launch | — |
| In-app support channel | In development; not live | Excluded from canonical pages, guides, and the live [reach-out pattern](../../application/getting-help.md#when-the-app-needs-the-aragon-team) | The product owner confirms launch | — |
| Alchemix delegation override and objection integration | Alchemix's governance account has not launched; capabilities are currently exclusive to that client | Owner-authorized brief example in [DAO slots](../design/dao-slots.md); excluded from general availability claims, promotion, and standalone capability or guide expansion | The product owner confirms launch or changes the supported client scope | — |

An implementation finding about a live feature does not belong in this table merely because its code is unused or incomplete. Flag a candidate improvement with a `type: opportunity` entry and list it on [Product opportunities](../product-opportunities/backlog.md). If an excluded surface also has a distinct improvement candidate, link that entry in the final column without changing the surface's product state.
