---
type: note
title: Product opportunities
tags: [product-planning, maintenance, cross-cutting]
---

# Product opportunities

The product-planning intake for ideas surfaced while documenting current behavior. A `type: opportunity` entry listed here is the explicit flag for a product improvement. These are candidates for investigation or ticketing, not roadmap commitments and not a catalogue of unsupported features. Canonical concept, capability, pattern, and decision pages describe the current product; each candidate lives in an area-filed opportunity entry and links back to that context.

Each opportunity owns its status. `candidate` means it has not yet become delivery work. When an external product-backlog ticket is created, add its URL to the entry as `ticket:`, change its status to `ticketed`, and move its link to a **Ticketed** section (create it when first needed). When the change ships, update the canonical product pages and retire the opportunity entry; Git and the external ticket retain the planning history.

## Candidates

**Accounts**

- [Retire or wire the unused linked-account display helper](./accounts/retire-or-wire-linked-account-display-helper.md) — linked accounts are live and their current selectors label accounts through another hook; this tested helper has never had a production caller, so verify no fallback is missing and then remove it or wire a concrete gap.

**Access control**

- [Align Permission Viewer details with the selected account](./access-control/align-permission-viewer-details-with-selected-account.md) — switching to a linked account changes the permission query, but detail presenters retain some primary-account context, so cross-network address links and condition reads can use the wrong DAO or network.
- [Let overlapping Permission Viewer filters be cleared](./access-control/let-overlapping-permission-filters-be-cleared.md) — when every permission matches both default hide filters, each filter hides the rows that would enable the other switch, so both views can appear empty with no way to reveal the indexed records.

**Treasury**

- [Rebasing-token balance freshness](./treasury/rebasing-token-balance-freshness.md) — investigate keeping balances current when a token's balance can change without a `Transfer` event.
- [Preserve or reject amounts the token cannot express](./treasury/preserve-or-reject-over-precise-amounts.md) — the transfer amount field silently rounds excess precision, where the normalization pattern says preserve or explain.

**Governance**

- [Publish a process without touching the actions list](./governance/publish-a-process-with-no-selected-actions.md) — the designer's Permissions step currently depends on the author having opened the actions list; Publish fails silently otherwise, on either radio choice.
- [Pre-empt process configurations the protocol will reject](./governance/pre-empt-protocol-rejected-configuration.md) — three advanced-flow values the app accepts and the chain refuses, so the user learns from a reverted transaction rather than the form.
- [Reveal all write functions for known contracts](./governance/reveal-all-write-functions-for-known-contracts.md) — replace the add-the-same-address detour with an in-place way to expand a curated contract group to its remaining verified write functions.
- [Surface unlock eligibility before the attempt](./governance/surface-unlock-eligibility-upfront.md) — the app simulates a Lock to Vote unlock on load but discards the verdict, so a blocked holder learns only from an after-the-fact dialog whose fixed message can misattribute the cause.
- [Coordinate colliding onboarding prompts](./governance/coordinate-colliding-onboarding-prompts.md) — when two connection-time prompts qualify at once, a combined test confirms one silently replaces the other with no priority rule, mid-interaction and unrecoverably for that connection.

**Design**

- [Complete the account-terminology rollout](./design/account-terminology-rollout.md) — audit product copy and apply the settled `account` versus `DAO` rule consistently.
- [Keep the wizard exit guard armed](./design/keep-the-wizard-exit-guard-armed.md) — one shared exit guard protects every wizard, and one leak reaches all of them: a nested dialog wizard silently disarms its parent's in-app-exit half for the rest of the dirty session.
