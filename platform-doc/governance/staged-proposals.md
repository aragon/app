---
type: concept
title: Staged proposals
tags: [governance, semantics]
status: draft
source: original product vision document (product-owner, mined 2026-07-14, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Staged proposals

How a [proposal](./proposal.md) moves through a multi-stage [process](./process.md) in the product. The mechanism is the protocol's [staged proposal processor](../protocol-doc/plugins/spp-plugin.md), which orchestrates the participating plugins into one pipeline; this page holds the product semantics on top. Installing a staged process is the [governance designer](./governance-designer.md)'s advanced flow.

## When the model reaches an edge case

The staged model makes the ordinary pipeline legible, but it does not turn every low-level configuration into a broadly self-serve concept. Existing conditions and unusual interactions between a sub-plugin and the staged proposal processor can exceed what the app can present faithfully. Those cases follow the [reach-out-to-the-team pattern](../design/reach-out-to-the-team.md): get the necessary context from Aragon rather than applying a misleading simplified configuration.

## One proposal, one page

A staged process presents as **a single consolidated proposal**, not a series of disconnected votes:

- The user creates one proposal on the staged process, with metadata and actions, like on any other process.
- Each stage runs as a **sub-proposal** on the [bodies](./body.md) governing that stage; users vote on sub-proposals from the one consolidated proposal page.
- The pipeline is displayed transparently end to end — which stage the proposal is in, which bodies govern each stage, and how the decision translates into on-chain actions — on the **[Voting Terminal](../design/voting-terminal.md)**, the proposal page's surface for this.

## Advancing through stages

- When a stage meets its thresholds and timing floor within its deadline, the proposal becomes **advanceable**; advancing it creates the sub-proposals of the following stage. What governs a single stage — its duration and optional expiration, approval-only early advance, each body's approval or veto role, and the two body thresholds — is the [stage](./stage.md) page; how advancement and expiration show up as the proposal's displayed status is [proposal status](./proposal-status.md).
- Advancing an advanceable proposal is open to **anyone** in the app — whoever casts the deciding vote, the proposal creator, or anyone else — because the protocol grants the advance permission to anyone by default ([SPP lifecycle](../protocol-doc/plugins/spp-plugin/lifecycle.md#advancing-and-executing)). The contracts also let a result report carry the advance attempt in the same transaction ([reporting a result](../protocol-doc/plugins/spp-plugin/lifecycle.md#reporting-a-result)); the app does not expose this as a control, and what it does with the flag depends on which report it is. What the app **configures** at install time sets that flag for every body ([body configuration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/sppPlugin/utils/sppTransactionUtils/sppTransactionUtils.ts#L286-L295)), and it is a plugin body's report that carries it — so a plugin body's report can bring the advance along with it. The one report transaction the app **constructs** itself — the one a body that is not a plugin sends to record its own verdict, an external address or a [Safe](./safe-as-a-body.md) — never requests it ([report transaction](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultDialogUtils.ts#L23-L32)): once that report lands the stage does not advance by itself, even when the report makes it advanceable, and someone still has to trigger the advance.
- **Pure optimistic stages and timelocks need no approval vote.** The protocol names approval, optimistic, and timelock [stage shapes](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md); the product model configures approval or veto as a role on each body, and both roles may appear in one stage. A veto-only stage becomes advanceable after its protected objection window unless the veto threshold is met; that passive, challenge-based default is [optimistic governance](./optimistic-governance.md). A bodyless timelock likewise becomes advanceable after its duration. Neither advances by itself — someone still triggers the advance (above).
- A **multisig stage** commonly gates the pipeline this way — before or after a token vote, or elsewhere in a longer process — turning "the multisig approves" into an explicit, visible stage rather than a hidden step; see [multisig gates](./multisig-gates.md).

## Execution is separate from advancement

Advancing between stages is not the execution step: on the final stage, the same advance call is what executes the proposal, under its own permission ([SPP lifecycle](../protocol-doc/plugins/spp-plugin/lifecycle.md#advancing-and-executing)) — which is why a final stage becoming advanceable reads as ready to settle rather than advanceable ([proposal status](./proposal-status.md)). Who may execute, and what ineligible users see, is on [proposal](./proposal.md); a final multisig stage — e.g. a security council — gates execution rather than performing it ([multisig gates](./multisig-gates.md)).
