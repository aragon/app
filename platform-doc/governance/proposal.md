---
type: concept
title: Proposal
tags: [governance, semantics]
source: aragon-knowledge-base first-slice brain dump, 2026-07-06 (assembled from mentions across pages; no dedicated source page) + product-owner briefings (2026-07-28, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md) + product-owner release-notes briefing and @aragon/app@1.38.0 verification (2026-09-08, see log.md) + tagged-source reconciliation (2026-09-09, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + product-owner Proposal review (2026-09-10, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) with locked gov-ui-kit@2.11.4 and @tiptap/extension-link@3.30.3 + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md); relocated section provenance in log.md (section-audit observations, 2026-09-13) (2026-09-13; no fresh source verification); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13) + product-owner briefings and staged-proposal consolidation (2026-09-15, see log.md)
---

# Proposal

A **proposal** submits an ordered array of [actions](./action.md) for approval through a [governance process](./process.md). Its human-readable metadata describes the proposed actions and the reasons for them. Each proposal belongs to one process, whose plugin applies the governance rules.

## Identifying a proposal

A proposal has an **onchain proposal ID**, the numeric identifier its plugin uses for votes, reported results, and execution, and a **friendly proposal slug** (for example, `PIP-3`). The slug combines the process key with the proposal's running index in the app. [Proposal identifiers](./proposal-identifiers.md) explains how both identifiers are derived and used.

## Proposal lifecycle

[Proposal creation](./proposal-creation.md) selects the process, checks who may propose, and collects the actions, metadata, and process-specific settings. [Members](./member.md) of the participating [bodies](./body.md) then vote or approve according to that process's rules.

The app derives the proposal's [status](./proposal-status.md) from onchain state and the process's governance rules. Status indicates whether voting is active, a stage can advance, the actions can be executed, or the proposal has ended. The process determines the requirements and timing for each transition.

A proposal with an empty action array is a **signaling proposal**. Members vote on the position described in its metadata, and a successful signaling proposal ends as **ACCEPTED**. With [Admin](./admin-flow.md#admin-controls), proposal creation and action execution happen in a single transaction, and the app shows the proposal as **EXECUTED**.

### Staged proposals

A **staged proposal** follows the stages configured in its [governance process](./process.md#staged-governance-processes). The Staged Proposal Processor (SPP) coordinates its progress through those stages.

The author creates the main proposal on SPP with its metadata and actions. When a stage begins, SPP uses Aragon's [`IProposal` interface](../protocol-doc/common/proposal.md) to automatically create a **sub-proposal** on each participating governance plugin. Each body applies its own governance rules to that sub-proposal, deciding whether the main proposal should proceed or be vetoed.

The Aragon platform UI presents these sub-proposals together within the main proposal on one consolidated [proposal page](#voting). Participants can inspect the stages and bodies and vote there, keeping their focus on the actions proposed for execution on the account.

A [manual body](../protocol-doc/plugins/spp-plugin/composing-bodies.md#automatic-vs-manual-bodies) follows its own decision process and sends the result directly to SPP, allowing it to participate without implementing `IProposal`.

#### Reporting and advancement

Executing a governance plugin's sub-proposal sends that body's decision to SPP.

When the current stage meets its [thresholds and timing requirements](./stage.md#stage-rules) within its deadline, the proposal becomes **advanceable**. Under the default [SPP permissions](../protocol-doc/plugins/spp-plugin/lifecycle.md#advancing-and-executing), anyone can advance the proposal. Advancing to the next stage activates it and creates sub-proposals on its participating governance plugins.

For veto-only stages and bodyless timelocks, someone advances the proposal after the waiting period ends, provided the stage's requirements are met.

#### Final stage and execution

Once the final stage's requirements are met, anyone can execute the proposal under the default [SPP permissions](../protocol-doc/plugins/spp-plugin/lifecycle.md#advancing-and-executing). SPP submits the proposal's actions to the account for execution.

The app reflects final-stage readiness in the proposal's [status](./proposal-status.md). A proposal with actions can become **EXECUTABLE**, while a successful signaling proposal ends as **ACCEPTED**. The [execution controls](#actions-and-execution) check who may submit execution for a proposal with actions.

## Proposals page

The **Proposals page** lists proposals from [supported processes](./process.md#processes-in-the-app). Each visible process has its own tab, labeled in the app as a **proposal type**. When several processes are available, **All proposals** is the default aggregate tab. The process key in each proposal's slug identifies its process; selecting a process tab narrows the list to that process.

A plugin participating as a body within staged governance contributes to the staged process's proposals. The staged process has the proposal tab. Proposals from [linked accounts](../accounts/linked-account.md) appear in the same set of process tabs.

The page also offers [Aragon Notifications](./aragon-notifications.md) for updates about new proposals, proposals ending in 24 hours, and executed proposals through Telegram.

Selecting a proposal opens its [details](#proposal-details-page). **Create proposal** starts [execution routing](../application/execution-routing.md), then opens the [proposal-creation wizard](./proposal-creation.md#starting-a-proposal). The aside shows proposal statistics for **All proposals**, or information about the selected process. Its governance-settings link leads to [Settings](../accounts/settings.md#governance) or that process's [details](./process.md#process-details-page).

## Proposal details page

The **Proposal details page** brings together the proposal's description, actions, status, and participation controls. Members vote or approve directly on the page. The Voting Terminal presents the participating bodies and their decisions in both simple and staged governance, so participants can see how each decision contributes to the proposal's outcome.

### Description and resources

The [proposal metadata example](../application/metadata-input.md#proposal-metadata-example) shows how the title, summary, rich-text description, and resources are represented together.

Proposal resources appear with their label and the destination beneath it, so a reader can check where a link goes before opening it. Inline links in the description display the author’s chosen text. The app provides no destination preview on focus or tap; inspecting those destinations before navigation depends on the browser’s link controls.

#### Missing and non-standard metadata

When both the proposal's title and description are unavailable, the app shows a metadata warning:

- **Missing metadata** — the metadata value is empty, or its `ipfs://` reference provides no readable title or description.
- **Non-standard metadata** — the metadata uses a format other than `ipfs://`. The details page shows the raw string value for governance participants to inspect.

Warnings appear on the proposal details and in the proposal list.

### Voting

The **Voting Terminal** shows the overall proposal status and the decisions of its participating bodies. For staged proposals, participants can inspect each stage and its bodies from the same proposal page.

A body's detail offers **Breakdown**, **Votes**, and **Settings**. External bodies omit Votes because the app cannot supply their vote list. Completed bodies remain inspectable, including their outcome, votes where available, and settings.

For an [admin](./admin-flow.md#admin-controls) proposal there is no vote to show: the page reads **Automatic execution — Proposals created by admins pass automatically without any governance.**

#### Advancing

The current stage shows the time available to advance the proposal. Before its minimum advance time, the page counts down **until advanceable**. During the advance window, it shows the time **left to advance** when the window ends within 90 days; otherwise, it reads **Proposal is advanceable**.

**Advance proposal** stays disabled until the minimum advance time is reached. Once a non-final stage is advanceable, this action moves the proposal to the next stage. Once the final stage passes, it can be [executed](#final-stage-and-execution).

### Actions and execution

The ordered action list offers the available [Basic, Decoded, and Raw views](../application/action-builder.md#viewing-actions) and [JSON download](../application/action-builder.md#reusing-action-sets-as-json) for inspection and reuse. The details also identify the creator and creation transaction, with links to their onchain records.

[Action simulation](../application/action-simulation.md) lets authors and reviewers test the action array through its intended execution route. On this page it is available in non-terminal states — pending, active, advanceable, or executable. An executed proposal cannot be simulated again. The latest result is cached and displayed; another run is available once that result is ten minutes old, limiting repeated use of Tenderly credits.

The page offers **Execute** when a proposal with actions becomes executable under its process's rules. By default, everyone has permission to execute proposals, but this can be configured to only allow specific addresses or members of a particular body to call execute.
