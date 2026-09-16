---
type: note
title: Product opportunities
tags: [product-planning, maintenance, cross-cutting]
---

# Product opportunities

The product-planning intake for ideas surfaced while documenting current behavior. A `type: opportunity` entry listed here is the explicit flag for a product improvement. These are candidates for investigation or ticketing, not roadmap commitments and not a catalogue of unsupported features. Each candidate lives in this collection; its tags and links identify the product context it would improve.

This board is temporary intake. A finite task on the [documentation backlog](../maintenance/backlog.md) takes each candidate to a verified Linear issue or closes it with a concrete relevance ruling. Record the Linear URL or closure reason in the log, then retire the local entry and its board row. Linear owns ongoing planning and delivery; shipped outcomes enter the canonical product pages through the normal documentation workflow. See the [opportunity lifecycle](../../WORKFLOW.md#product-opportunities).

Each entry presents a **User story** or **Technical task**, followed by **Context + benefit**.

[Internal navigation](../index.md) links the other contributor collections.

## Candidates

**Access control**

- [Align Permission Viewer details with the selected account](./align-permission-viewer-details-with-selected-account.md) — inspect permission details on the account and network selected, so address links and condition information describe the authority being reviewed.
- [Let overlapping Permission Viewer filters be cleared](./let-overlapping-permission-filters-be-cleared.md) — clear filters that hide every permission, so an apparently empty view can be distinguished from an account with no indexed records.
- [Recognize Safe-owner conditions in Permission Viewer](./recognize-safe-owner-conditions.md) — understand a recognized Safe-owner restriction from a readable explanation while retaining the address fallback for unknown conditions.

**Treasury**

- [Inspect the reward token and exact amount before claiming](./inspect-reward-token-and-exact-amount.md) — verify the payout asset and precise allocation before submitting a reward claim.
- [Preserve account scope in transaction categories](./preserve-account-scope-in-transaction-categories.md) — filter treasury activity by category while retaining all accounts in the selected scope.
- [Rebasing-token balance freshness](./rebasing-token-balance-freshness.md) — assess treasury holdings using balances that reflect rebases, subject to confirming the impact and a reliable refresh approach.
- [Preserve or reject amounts the token cannot express](./preserve-or-reject-over-precise-amounts.md) — keep an expressible transfer amount or explain the token's decimal limit, so the author chooses any correction.

**Governance**

- [Allow last-process removal with a warning](./allow-last-process-removal-with-warning.md) — let an authorized operator choose removal after understanding its consequences, where a supported execution route exists.
- [Match uninstall exclusions to process identifiers](./match-uninstall-process-exclusions.md) — choose the intended process and review an accurate description of which governance route the uninstallation removes.
- [Check delegation support before offering Delegate in Gauge voting](./check-gauge-delegation-capability.md) — offer token holders a Delegate action that reflects the specific voting integration's verified support.
- [Keep destination transfers independent of the source account](./keep-destination-transfers-independent-of-source-account.md) — compose an allowed destination transfer using the account and network that will execute it.
- [Publish a process without touching the actions list](./publish-a-process-with-no-selected-actions.md) — publish an unrestricted process or an intentionally empty allowlist without an add-and-remove action detour.
- [Pre-empt configurations the protocol will reject](./pre-empt-protocol-rejected-configuration.md) — correct governance settings that violate known protocol constraints before attempting submission.
- [Explain unsupported cross-chain destinations](./explain-unsupported-cross-chain-destinations.md) — understand why a destination cannot be used in the composer and what support is missing.
- [Surface unlock eligibility before the attempt](./surface-unlock-eligibility-upfront.md) — see whether tokens can be unlocked before attempting withdrawal, with a reason the app can substantiate.

**Application**

- [Offer direct execution in shared action flows](./offer-direct-execution-in-shared-flows.md) — let an authorized actor use prepared actions through a direct route in flows that currently offer governance processes.
- [Close the profile introduction on wallet disconnect](./close-profile-introduction-on-disconnect.md) — keep profile prompts aligned with the connected wallet, so a person cannot continue for a disconnected identity.
- [Preserve member removal in Basic details](./preserve-member-removal-in-basic-details.md) — review the actual membership change through summaries that correctly distinguish additions and removals.
- [Preserve plugin context on action import](./preserve-plugin-context-on-action-import.md) — reuse and edit imported actions in usable forms when preparing proposals or direct transactions.
- [Reveal all write functions for known contracts](./reveal-all-write-functions-for-known-contracts.md) — find additional verified write functions without entering the same contract address again.
- [Use revealable address output consistently](./use-revealable-address-output-consistently.md) — verify complete addresses through the relevant inspection controls, including evaluating direct keyboard access in permission graphs.

**Design**

- [Coordinate colliding onboarding prompts](./coordinate-colliding-onboarding-prompts.md) — complete relevant participation steps in a deliberate order without one prompt unexpectedly replacing another.
- [Inspect labeled-link destinations before navigation](./inspect-inline-link-destinations.md) — inspect the full destination behind a link label before choosing to navigate, using keyboard, touch, or a pointer.
- [Complete the account-terminology rollout](./account-terminology-rollout.md) — recognize the same product entity across screens through consistent use of account terminology.
- [Keep the wizard exit guard armed](./keep-the-wizard-exit-guard-armed.md) — protect unfinished inputs after closing nested flows and keep Back navigation predictable.
