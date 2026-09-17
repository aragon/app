---
type: concept
title: Stage
tags: [governance, semantics]
source: verbal product-owner briefing on governance flows (2026-07-16, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + SPP and app source verification (2026-08-03, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + product-owner briefings (2026-09-11, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner stage review (2026-09-15, see log.md)
---

# Stage

A **stage** is one step of a [staged governance process](./process.md#staged-governance-processes). Each [staged proposal](./proposal.md#staged-proposals) follows the process's configured stages in order, with each stage's rules determining whether and when the proposal can proceed.

Every stage has **zero or more [bodies](./body.md)**, represented by Aragon governance plugins or other registered addresses. Its configuration specifies which bodies participate, how their decisions count, and the timing requirements for the proposal to proceed.

For contract-level parameters, see [stages and bodies](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md). For available setup options, see [process configuration](./process.md#configuration-options).

## Stage rules

- **Body and its role** — each body either approves or vetoes proposals. A stage can include bodies with differing roles, such as a Token Holder approval body and a Security Council veto body. A veto-only stage is the basis of [optimistic governance](./optimistic-governance.md).
- **Approval threshold** — the number of approving bodies whose approval is required for the proposal to proceed, subject to the stage's timing requirements.
- **Veto threshold** — the number of vetoing bodies whose veto blocks the proposal. Reaching this threshold blocks the proposal even if the approval threshold has been met.
- **Stage duration** — the time allocated for bodies to make their decisions. A stage with vetoing bodies can advance only after this period ends.
- **Expiration period** (optional) — additional time after the stage duration to advance the proposal. If the proposal has not advanced by the resulting deadline, it expires permanently.
- **Early advance** — allows a stage with approving bodies and no vetoing bodies to advance as soon as its approval threshold is met, before the stage duration ends.
- **A bodyless stage acts as a timelock** — it becomes advanceable after its configured duration.

## How the proposal page presents a stage

The Voting Terminal shows how many bodies are required to approve and how many are required to veto, for example **1 body required to approve** and **1 body required to veto**.

Within each body, participants vote or submit a decision to approve or veto the proposal according to that body's role. The voting options and action labels identify which decision they are making - either approving or vetoing.

Once the approval threshold is met and the veto threshold is not met, the stage summary shows the stage's status.

A stage with no bodies appears as a timelock with a timer and the amount of time remaining.
