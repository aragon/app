---
type: task
title: Transfer the 25 product opportunities to Linear or close them
tags: [maintenance, product-planning, cross-cutting]
status: in-progress
next_actor: agent
source: product-owner request to move the cleaned product opportunities into Linear or close them as irrelevant (2026-09-14)
---

# Transfer the 25 product opportunities to Linear or close them

Resolve the fixed set of 25 entries below from [Product opportunities](../../product-opportunities/backlog.md), comprising 24 user stories and one technical task. Transfer each relevant item into Linear or close it with a concrete relevance ruling, then retire its local entry. This clears the documentation intake without waiting for implementation; delivery and prioritization belong in Linear. Newly captured opportunities are outside this batch.

## Work

- Compare each opportunity with current product behavior and existing Linear issues. Use its recorded sources and evidence limits to check whether the gap still matters and avoid duplicate tickets. Establish the appropriate Linear team or project from existing conventions; ask the owner only for a destination or product judgment the available context cannot settle.
- Transfer relevant work to a new or existing Linear issue. Preserve the user story or technical task, context and benefit, material constraints, provenance, and remaining product investigation. Make context links usable from Linear and verify the resulting issue contains the necessary information. Low priority alone is not a reason to declare an item irrelevant; it can remain in the Linear backlog.
- Close an irrelevant item with a specific reason and supporting evidence or owner ruling, such as already shipped, superseded, or no material product gap. Do not turn an unverified assumption into a closure decision.
- Record each outcome in the table below and in the pass's log entry: original opportunity path plus verified Linear URL, or closure reason and its basis. Use plain-text paths in the log so retiring entries does not strand links.
- After recording the outcome, remove the opportunity's product-board row, inspect and resolve its remaining backlinks, and delete its local file. A transferred issue's delivery status does not delay this retirement. Preserve established current-product knowledge in its canonical home; document shipped changes when verified.
- Leave the product board as temporary intake for future candidates, with an empty state when this batch clears it. Follow the transfer-or-close lifecycle in [WORKFLOW.md](../../../WORKFLOW.md#product-opportunities); future batches receive their own finite task.

## Cohort and outcomes

Each row must end with a verified Linear URL or an evidenced closure reason. Keep the original paths as plain text while their files are retired.

Pending entries now live in `internal/product-opportunities/` with their original basenames. The paths below remain the fixed cohort identifiers; use the [product backlog](../../product-opportunities/backlog.md) to find the current entries.

| Original opportunity | Linear issue or closure reason |
| --- | --- |
| `accounts/retire-or-wire-linked-account-display-helper.md` | Transferred to [APP-1159](https://linear.app/aragon/issue/APP-1159/retire-or-wire-the-unused-linked-account-display-helper); local entry retired. |
| `access-control/align-permission-viewer-details-with-selected-account.md` | Pending |
| `access-control/let-overlapping-permission-filters-be-cleared.md` | Pending |
| `access-control/recognize-safe-owner-conditions.md` | Pending |
| `treasury/inspect-reward-token-and-exact-amount.md` | Pending |
| `treasury/preserve-account-scope-in-transaction-categories.md` | Pending |
| `treasury/rebasing-token-balance-freshness.md` | Pending |
| `treasury/preserve-or-reject-over-precise-amounts.md` | Pending |
| `governance/allow-last-process-removal-with-warning.md` | Pending |
| `governance/match-uninstall-process-exclusions.md` | Pending |
| `governance/check-gauge-delegation-capability.md` | Pending |
| `governance/keep-destination-transfers-independent-of-source-account.md` | Pending |
| `governance/publish-a-process-with-no-selected-actions.md` | Pending |
| `governance/pre-empt-protocol-rejected-configuration.md` | Pending |
| `governance/explain-unsupported-cross-chain-destinations.md` | Pending |
| `governance/surface-unlock-eligibility-upfront.md` | Pending |
| `application/close-profile-introduction-on-disconnect.md` | Pending |
| `application/preserve-member-removal-in-basic-details.md` | Pending |
| `application/preserve-plugin-context-on-action-import.md` | Pending |
| `application/reveal-all-write-functions-for-known-contracts.md` | Pending |
| `application/use-revealable-address-output-consistently.md` | Pending |
| `design/coordinate-colliding-onboarding-prompts.md` | Pending |
| `design/inspect-inline-link-destinations.md` | Pending |
| `design/account-terminology-rollout.md` | Pending |
| `design/keep-the-wizard-exit-guard-armed.md` | Pending |

## Progress

- **2026-09-14** — Transferred the linked-account display helper to APP-1159 in the APP team (Platform), labeled FE Tech and set to To do, with no project. Verified the issue content and retired the local entry. The fixed cohort has 1 transferred item and 24 pending; remaining triage is parked for a later run.

## Done when

- All 25 original paths have a verified Linear URL or a concrete closure reason and its basis recorded in log.md; no outcome remains pending.
- Every transferred issue preserves the necessary story or technical task, context, constraints, evidence, and remaining investigation, including when an existing issue was reused.
- All 25 local opportunity files and their board rows have been retired, and remaining links are valid. No item from this cohort remains locally pending delivery.
- The task close-out and final outcome mapping are recorded in log.md, its backlog row and task file are removed, and the composite wiki check passes with no new unresolved links or orphans.
