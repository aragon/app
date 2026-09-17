---
type: concept
title: Proposal status
tags: [governance, semantics, proposals]
source: Universal Proposal Status flowchart + app repo proposalStatusUtils + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + product-owner status review and verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-15, see log.md)
---

# Proposal status

The Aragon platform calculates each proposal's status from its onchain state, governance rules, and the current time. The status appears in the [Proposals list](./proposal.md#proposals-page) and on the [proposal page](./proposal.md#proposal-details-page), and can change as a voting period or deadline passes.

Proposal statuses are **PENDING**, **ACTIVE**, **ADVANCEABLE**, **EXECUTABLE**, **EXECUTED**, **ACCEPTED**, **REJECTED**, **VETOED**, and **EXPIRED**.

## How status is calculated

The app evaluates the following rules in order and uses the first match. Each process supplies its approval requirements and timing rules.

1. Already executed → **EXECUTED**.
2. Vetoed → **VETOED**.
3. Scheduled to start in the future → **PENDING**.
4. An intermediate stage is ready to advance → **ADVANCEABLE**.
5. A stage has expired → **EXPIRED**.
6. The voting window is open, or the proposal's end date is yet to be determined:
   - Approval requirements met, actions present, and early execution enabled → **EXECUTABLE**.
   - All other proposals → **ACTIVE**.
7. The voting window has ended:
   - Approval requirements unmet → **REJECTED**.
   - Requirements met, with an empty action array → **ACCEPTED**.
   - Requirements met, actions present, and execution deadline passed → **EXPIRED**.
   - Requirements met, actions present, and execution still available → **EXECUTABLE**.

During publication, the proposal preview shows **DRAFT** while the proposal is being prepared and until the app has loaded its indexed data after submission. It then displays the calculated status.

## Stage-level status

Each [stage](./stage.md) of a staged proposal has its own status in the [Voting Terminal](./proposal.md#voting). The app evaluates stage statuses in this order: **VETOED**, **UNREACHED**, **PENDING**, **ACTIVE**, **ADVANCEABLE**, **REJECTED**, **EXPIRED**, **ACCEPTED**.

**UNREACHED** marks a stage made unreachable by an earlier veto, rejection, or expiration. A stage awaiting its turn in an ongoing proposal is **PENDING**.

The app uses these stage results to calculate the overall proposal status through the rules above. [Staged proposals](./proposal.md#staged-proposals) explains how the proposal progresses through its stages.
