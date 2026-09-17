---
type: concept
title: Proposal status
tags: [governance, semantics, proposals]
status: draft
source: Universal Proposal Status flowchart + app repo proposalStatusUtils + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Proposal status

Every proposal — in the proposals [datalist](../design/datalist-page.md) and on the [proposal](./proposal.md) page — carries a status: active, executable, rejected, and so on. Nothing on chain stores this status. The app computes it, per render, from on-chain state, so a status can change as a deadline passes with no new transaction sent. This is how [the app serves the chain](../principles.md) for status: the inputs are chain state, but the derivation itself happens off-chain, in the app.

## Two layers

**Layer 1 — per-process-type inputs.** Each process type (token voting, multisig, lock to vote, a staged process) derives its own set of inputs from its own on-chain state: whether its governance parameters are met, whether the proposal has actions, whether early execution is possible, whether any stage has been vetoed, when its execution window expires, and — for staged processes — whether any stage is advanceable or expired.

**Layer 2 — one shared decision tree.** Every process type's inputs feed the same ordered set of rules, evaluated top to bottom, first match wins:

1. Executed → **EXECUTED**
2. Vetoed → **VETOED**
3. Starts in the future → **PENDING**
4. Any stage *other than the last* advanceable → **ADVANCEABLE** (the final stage becoming advanceable is not advancement — it is the proposal being ready to settle, via the rules below)
5. Any stage expired → **EXPIRED**
6. Voting window still running — or the proposal has no end date yet, true of a staged proposal still in flight before its final stage (a stage the proposal simply has not started yet is *pending*; a stage made unreachable by an earlier failure is a different thing — see the per-type consequences below):
   - Governance parameters not yet met → **ACTIVE**
   - Met, but no actions to execute → **ACTIVE**
   - Met, has actions, early execution unavailable → **ACTIVE**
   - Met, has actions, early execution available → **EXECUTABLE**
7. Voting window ended:
   - Parameters not met → **REJECTED**
   - Met, no actions → **ACCEPTED**
   - Met, has actions, execution window lapsed → **EXPIRED**
   - Met, has actions, execution window still open → **EXECUTABLE**

## Admin proposals are the exception

[Admin](../accounts/admin-management.md) proposals bypass this tree entirely: they always read **EXECUTED**, consistent with executing instantly in a single transaction rather than going through a deliberation step.

## The vocabulary

The app's shared status vocabulary defines 12 named statuses. The tree above produces 9 of them: EXECUTED, VETOED, PENDING, ADVANCEABLE, EXPIRED, REJECTED, ACCEPTED, ACTIVE, EXECUTABLE. Two more appear outside the tree:

- **DRAFT** is a pre-indexing fallback — what a just-published proposal shows before it has been indexed and a real status can be computed.
- **UNREACHED** is a per-[stage](./stage.md) status, not a proposal status: it marks a stage the proposal can never reach because an earlier stage failed — see below.

The twelfth name is **FAILED**, and no derivation in the app produces it — not the shared tree, not any process type's inputs, not the stage-level tree — so no proposal and no stage ever reads FAILED. The vocabulary gives it a label and a color, so it is a status the app is equipped to display but can never arrive at: a latent defect in the code rather than a product behavior, and one no user ever sees.

## Per-type consequences

The shared tree is the same for every process type, but which branches a given type can ever reach depends on the inputs that type derives:

- **VETOED** only ever comes from a staged process — token voting, multisig, and lock to vote never veto.
- A **multisig** proposal is EXECUTABLE only within its execution window — its execution expiry is its end date — and EXPIRED once that window passes.
- **Token voting** shows EXECUTABLE before the voting window ends only when the process is configured for early execution — and in that mid-window judgment the parameters are checked pessimistically, with every vote not yet cast in favour counting against. Token voting defines no execution deadline, so a passed token voting proposal never reads EXPIRED — it stays EXECUTABLE indefinitely.
- **Lock to vote** additionally never shows early EXECUTABLE (early execution is unsupported) or VETOED, and like token voting it defines no execution deadline, so it never reads EXPIRED either.
- A **signaling proposal** (one with no actions) ends at ACCEPTED and can never become EXECUTABLE, whatever process produced it. In a staged process, a signaling proposal's final stage also produces neither ADVANCEABLE nor EXPIRED, so nothing pulls it out of the ACTIVE → ACCEPTED path.
- A **staged** proposal still in flight has no end date, so until it reaches its final stage it cannot be REJECTED, ACCEPTED, or execution-EXPIRED — it stays ACTIVE or ADVANCEABLE. Once a stage *fails*, though, every stage behind it becomes unreachable, and that unreachability is what ends the proposal: it reads as ended with its parameters unmet, and settles on REJECTED rather than lingering.

## Stage-level status

A staged process's sub-proposals — the ones shown per stage on the [Voting Terminal](../design/voting-terminal.md) — carry their own status, derived by a separate decision tree evaluated in this order: vetoed, unreached, pending, active, advanceable, rejected, expired, accepted. This is where **UNREACHED** comes from: a stage behind a vetoed, rejected, or expired stage can never be reached, and reads as such. Stage statuses feed back into the proposal-level tree above — a proposal reads ADVANCEABLE or EXPIRED when a stage does — but the two trees are distinct; see [stage](./stage.md) and [staged proposals](./staged-proposals.md).
