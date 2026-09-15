---
type: pattern
title: Voting Terminal
tags: [design, components, governance]
status: draft
source: product-owner briefings (2026-07-28, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md)
---

# Voting Terminal

The **Voting Terminal** is the proposal page's decision surface. It uses gov-ui-kit's `ProposalVoting` pattern to show the proposal or current [stage](../governance/stage.md), its status and timing, the bodies involved, the decision evidence, and the action available to the connected participant. A simple process uses one voting card; a [staged process](../governance/staged-proposals.md) uses the same body pattern inside a stage accordion.

## Why it matters

The terminal makes the decision process legible instead of hiding it behind contract state. In a staged flow, participants in every stage — including a Safe acting as a governing [body](../governance/body.md) — use the same proposal page and can see how the current decision relates to earlier and later stages. The overall proposal [status](../governance/proposal-status.md) and each stage or sub-proposal's status remain distinct even though the terminal presents them together.

## Shared layout and states

The pattern has a stable hierarchy:

1. **Process status first.** A direct, non-staged terminal opens with the proposal status. A staged terminal shows every stage in a single-open accordion; each header carries the stage name, its status or timing, and its `Stage N` position.
2. **Body selection second.** A stage with one body opens that body directly. A stage with several bodies first shows a summary row for each body and the applicable body-count requirements. Selecting a row opens that body's detail, with a route back to the all-bodies summary.
3. **Decision detail third.** An assembly can provide **Breakdown**, **Votes**, and **Settings**. `ProposalVoting` supplies the tab shell; the assembly supplies each panel's threshold explanation, participation list, settings, and any action control. A tab may be omitted explicitly.

When a stage or sub-proposal is `PENDING` or `UNREACHED`, its body detail defaults to Settings and disables Breakdown and Votes. The disabled tabs communicate that this terminal has no breakdown or vote-list view in those states. An `ACTIVE` body opens on Breakdown; its containing proposal or stage status shows a live countdown when the app supplies an end date. Completed bodies remain inspectable, including their outcome, votes where available, and settings. The full proposal and stage vocabulary is owned by [Proposal status](../governance/proposal-status.md). `ProposalVoting` renders app-provided status inputs; the staged app assembly re-evaluates time-dependent stage status and timing before supplying them.

The four reference stories exercise the product shapes as follows:

| Story | Shape and state |
| --- | --- |
| `SimpleGovernance` | One active proposal card with a single Token Voting body, live status, token breakdown, vote action, votes, and settings. |
| `SingleStage` | One expired accordion stage with a single Multisig body; the completed decision remains available for inspection. |
| `MultiStage` | Three sequential stages in one controlled accordion: active Token Holders, pending Founders, then a pending branded Safe body. |
| `MultiBody` | One active stage opens on a two-row Token/Safe summary and an approval requirement; selecting a row drills into that body's own terminal, and the Safe body omits Votes. |

The summary text, body requirements, statuses, vote lists, settings, and action controls come from the app assembly. `ProposalVoting` supplies the interaction and presentation hierarchy; it does not calculate a combined stage result or advance a stage.

## Staged process rendering

The staged assembly lists all configured stages and follows the proposal's current stage when the proposal advances. Earlier and later stages stay visible as context, while the open stage contains either its body summary, its single body, or the bodyless timelock shape below.

The staged app can enter its `ADVANCEABLE` display branch before the minimum-advance time. The design-system treatment takes both the minimum and maximum advance times: before the minimum it counts down **until advanceable**; during the window it counts down **left to advance** when the end is within 90 days, otherwise it says **Proposal is advanceable**; after the maximum it shows no advanceable status. The app keeps **Advance proposal** disabled until the minimum is reached. This display branch does not change the product meaning that the timing floor is part of becoming actionable.

The terminal does not itself advance a proposal. Reports from app-created registered bodies request a best-effort advance in the same transaction; a manual external-body report does not, and a bodyless timelock has no report to carry one. For an `ADVANCEABLE` non-final stage that remains unadvanced, the explicit **Advance proposal** action moves it forward. Final stages have no such control; their lifecycle boundary settles or executes the proposal as described by [Staged proposals](../governance/staged-proposals.md).

## Rendering approving and vetoing bodies

Approval or veto is a role of each body, not a mode applied to the stage as a whole. The same stage may therefore contain both roles:

- An **approving Token Voting or Lock-to-Vote body** pairs **Yes** with **to approve**, renders Yes with success treatment and No with critical treatment, and describes that option as **I approve** in the vote dialog. A multisig body instead renders its **Approval** threshold with the generic reached/not-reached treatment and offers **Approve proposal**, as does a manual external body; a completed manual result reads **Approved**.
- A **vetoing Token Voting or Lock-to-Vote body** makes the affirmative consequence explicit: the design-system breakdown pairs **Yes** with **to veto**, labels its threshold **Veto support**, and the vote dialog describes the option as **I veto**. Token Yes takes the critical treatment and No the success treatment because a successful affirmative result blocks the stage. A vetoing multisig or manual external body instead offers **Veto proposal**.
- In a mixed stage, the summary renders the approval and veto requirements independently — for example, **1 body required to approve** and **1 body required to veto**. Meeting approval does not hide the veto requirement or close a still-active veto window. A reached veto overrides approval, following the [stage model](../governance/stage.md).

A useful acceptance case is one Token Holder approval body and one Security Council veto body in the same stage. Both rows must retain their own role labels and result treatment; the summary must show both thresholds; and after the approval threshold lands, the veto body must remain actionable until its configured window closes. Treating that stage as globally "approval" or globally "veto" is incorrect.

For a manual external body, the role described here is the role the app is configured to render. The protocol's manual report is still the authoritative result; the terminal does not turn its label into an additional contract constraint.

## Rendering a bodyless timelock

A bodyless stage is a [timelock](../governance/stage.md), not an empty or failed voting state. It has no body, sub-proposal, vote breakdown, vote list, or vote action. The dedicated card, illustration, and named timelock states below belong to the staged app assembly; gov-ui-kit's contribution is the ordinary stage and advance-window status treatment. The active and ended states include the formatted date, while pending explains the predecessor-stage condition:

- **Timelock pending** — the stage is waiting to be reached; advancing the previous stage activates it.
- **Timelock active** — it shows when the delay ends.
- **Timelock ended** — it shows when the delay ended.

After the duration elapses the stage can be advanced; it does not advance itself.

## Rendering a Safe body

For a stage whose body is a [Safe](../governance/safe-as-a-body.md), the terminal renders the Safe as one branded external body. As the sole body it opens directly in detail; in a multi-body stage the summary can carry its avatar and selection opens its detail with the Safe label and avatar. The design-system assembly may hide Votes explicitly: the `MultiBody` reference does so, while `MultiStage` leaves the tab available. The current staged app hides Votes for external bodies, offers **Approve proposal** or **Veto proposal** according to the body's configured role, and gives Safe-specific connection guidance.

The Safe is a **single object** — there is no owner- or member-level granularity. A Safe typically collects its signatures off-chain in Safe's own infrastructure, and the app does not index that activity, so it has nothing per-owner to show. This differs from an Aragon Multisig body, whose indexed approvals can be listed per member.

## Implementation scope

These assembly identifiers ground the pattern in current source; they are not part of its public design-system API.

| Assembly | Place in the pattern |
| --- | --- |
| `sppVotingTerminal` | The staged assembly. It replaces the shared terminal and composes the accordion, stage statuses, body summaries, mixed approval/veto bodies, timelocks, and advance action. |
| `proposalVotingTerminal` | The shared non-staged, single-body fallback used by Token Voting, Multisig, and Lock to Vote. It composes one `ProposalVoting` card with the plugin's breakdown, vote action, vote list, and settings; unlike Storybook's `SingleStage` example, it does not render a `Stage` wrapper. |
| `adminVotingTerminal` | An intentional empty-state stub: **Automatic execution — Proposals created by admins pass automatically without any governance.** This agrees with the Admin exception that always produces `EXECUTED`; it is not another voting state. |
| `gaugeVoterVotingTerminal` | Excluded. Despite the similar code name, it is the sticky epoch-allocation control on the dedicated [Gauge voting](../governance/gauge-voting.md) page. Gauge Voter has no proposal lifecycle for this pattern to render. |

## Design-system reference

This page defines the product pattern, not the compound component's prop-level API. The canonical inventory is gov-ui-kit's `Modules/Components/Proposal/ProposalVoting` story, especially `SimpleGovernance`, `SingleStage`, `MultiStage`, and `MultiBody`; its corresponding [Figma component](https://www.figma.com/design/ISSDryshtEpB7SUSdNqAcw/Governance-UI-Kit?node-id=16752-20193&m=dev) carries the visual specification. Source verification used gov-ui-kit `9c106d8` and app `122f1bd1`; both checkouts are listed under [Source repositories](../repositories.md).
