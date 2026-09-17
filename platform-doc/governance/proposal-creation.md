---
type: capability
title: Proposal creation
tags: [governance, proposals, access-control]
status: draft
source: product-owner briefing (2026-07-20, wizard system) + product-owner briefings (2026-07-28, see log.md) + product-owner briefing (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app process-selector verification and create-proposal flow verification (2026-08-04, app@122f1bd1; see log.md) + product-owner action-builder briefing (2026-08-05, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + @aragon/app@1.36.0 tagged-source reconciliation (2026-09-09, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner briefings (2026-09-11, see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner briefings (2026-09-15, see log.md)
---

# Proposal creation

Proposal creation turns an author's intent into a [proposal](./proposal.md) owned by a selected [process](./process.md). After [execution routing](../application/execution-routing.md), the author composes the proposal and submits it through the shared transaction flow.

## Starting a proposal

The **Create Proposal** action at the top of the Proposals page starts the shared [process selection and eligibility check](../application/execution-routing.md#choosing-a-process), then opens that process's creation wizard.

Other product flows may create a proposal under the hood, such as applying a governance installation or changing Admin members, without sending the user through this general-purpose wizard.

## Creation eligibility

Who can create a proposal is configured per process: users set it during Basic setup in the [governance designer](./governance-designer.md), and Aragon configures it for an advanced process. This is separate from who decides — the [bodies](./body.md) governing the process's [stages](./stage.md) — and the two are configured independently.

### The supported pattern: open to all, narrowed by conditions

During Aragon-assisted setup of a **staged process**, the configuration opens proposal creation to all addresses and narrows it with conditions, rather than listing eligible addresses directly. The gate is the SPP's own [rule condition](../protocol-doc/plugins/spp-plugin.md#who-can-create-proposals-the-rule-condition) (`SPPRuleCondition`), deployed with the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) itself — configuring who can create proposals is configuring its rules.

The rule condition is **open by default at the protocol level** (no rules configured, anyone can propose), but Aragon configures it when setting up the process, driven by which [bodies](./body.md) are part of it. The team's [configuration flow](./governance-designer.md#the-advanced-flow) shows each of the process's bodies as an on/off toggle; toggling a body on adds its proposal-creation condition — really a **membership condition**, since what it checks is [membership](./member.md#membership-and-participation) in that body — into the rule condition, which **composes these membership conditions with boolean logic**.

The designer defaults to **Members**, allowing members of any selected body to propose. All listed plugin bodies and Safe bodies are selected initially; a manually configured body that is not a Safe is not offered as a membership choice. For a staged process, satisfying any one selected body's membership condition is enough. Choosing **Anyone** opens proposal creation to all addresses.

With **Members** selected, the designer does not advance unless at least one listed body is toggled on or, where the advanced flow offers existing conditions, a condition is attached. This verifies a configured source of creation eligibility across the process. It does not establish that a current holder meets a voting-power requirement or that an attached condition will accept a caller. In Basic setup, the check requires the single body to be enabled for proposing; the intended proposers must still meet its requirements.

In a single-plugin Basic process, proposal eligibility follows that [plugin's](./plugin.md) own rules. The **Members** default limits a multisig to its listed members. Token Voting defaults to a minimum of one whole token, and Lock to Vote requires at least one whole token to be locked. These thresholds apply to the proposing address; choosing a membership-based default does not ensure that someone currently meets it.

### Existing conditions: composing an already-deployed condition

For an Aragon-assisted advanced setup, the team's configuration flow has an **existing conditions** field: the address of any already-deployed condition contract can be pasted in and composed into the rule condition alongside the body membership conditions — for example, the above-a-token-threshold [`VotingPowerCondition`](../protocol-doc/plugins/token-voting-plugin/voting-power.md#who-may-propose) that a Token Voting body's own plugin setup deploys: composed this way, it gates creation on token balance.

Existing conditions are an implementation-facing mechanism. The basic flow neither displays the field nor advertises that it exists in advanced mode.

What the designer does not offer: authoring or deploying a new bespoke condition (if a condition isn't already deployed somewhere, there is nothing to paste into the field), and granting creation directly to a bare address — no such flow exists in the designer, though a direct grant can still be made outside it after the fact (see [direct creation grant to a Safe](./multisig-gates.md#direct-creation-grant-to-a-safe)).

### The `SafeOwnerCondition`: a Safe's owners as eligible creators

A [`SafeOwnerCondition`](../protocol-doc/helpers/condition-library/safe-owner-condition.md) is one such condition. Whenever a [Safe serves as a governing body](./safe-as-a-body.md) in a governance process, the app deploys this condition in the background — via the protocol's [`ConditionFactory`](../protocol-doc/helpers/condition-library.md#the-conditionfactory) — and offers it as that body's creation condition, the only option available for a Safe body, letting a Safe owner create a proposal the same way a member of an Aragon multisig or Token Voting [body](./body.md) can (on the two kinds of "multisig," see [Safe vs Aragon multisig](../guides/safe-vs-aragon-multisig.md)). Where the proposal-creation eligibility details display that Safe's address, the address links to the block explorer for the account's network.

### Eligibility is independent per body

A staged process can allow creation through one body's members and not another's — e.g. a multisig's members but not a Token Voting body's token holders (see [multisig gates](./multisig-gates.md) for this pattern worked through end to end).

### Editing eligibility on a live process

[Advanced processes are not editable in the app at all](./governance-designer.md#editing-across-the-lifecycle), so there is no designer flow for creation eligibility on a live advanced process. Narrowing the composed rules themselves means updating the rule condition directly, outside the app; replacing the gate wholesale — revoking an open grant and granting creation to a specific address — is possible while the account still has admin ([direct creation grant to a Safe](./multisig-gates.md#direct-creation-grant-to-a-safe)). What the app does do is show the process's current creation eligibility on its [Process details page](./process.md#process-details-page).

## Create proposal page

### Creating a proposal

The full-screen wizard collects:

1. **Metadata** — a required title; an optional summary for quick understanding at the top of the proposal; an optional rich-text body for the rationale, detail, and what voters are deciding; and resources, each a URL with an optional label. Surrounding spaces are removed from the title when the author leaves the field. The screen does not open with its required fields marked as errors: selecting **Next** without a title makes the title field explain what is missing, and the error clears once a title is entered while the rest of the proposal stays intact. The screen also lets the author choose whether the proposal carries actions.
2. **Actions** — the shared [action builder](../application/action-builder.md) when actions are enabled. The [action catalogue](../application/basic-action-views.md) explains each specialized action's purpose and consequences. If the author opts out, this step is skipped and the proposal is published with zero actions as a [signaling proposal](./proposal.md).
3. **Settings, when required** — this step exists only when the selected plugin registers additional parameters for its create-proposal function. Current plugin integrations use it mainly for timing:
   - **Admin** has no settings step.
   - **Multisig** asks for start and end, and recommends at least five days between them.
   - **Token Voting** asks for start and end, enforcing the plugin's configured minimum duration.
   - **Lock to Vote** asks for start; the plugin's configured duration determines the end.
   - **Staged Proposal Processor** asks for start; its configured stages determine the later timing.

Continuing from the last applicable step opens the shared [transaction dialog](../application/submitting-a-transaction.md), which pins the metadata and submits one create-proposal transaction.

Before that dialog opens, the wizard checks whether another proposal creation for the same account and process is still in flight — handed to the wallet awaiting signature, or broadcast and not yet confirmed. Resubmitting an unchanged proposal is not a conflict: it keeps the same submission identity and resumes, per the transaction dialog's [resumption rule](../application/submitting-a-transaction.md#resuming-an-interrupted-submission). Editing the proposal's content after closing the dialog — title, summary, body, resources, or actions — gives the submission a new identity, so continuing would publish a second proposal; that is the case the check catches, stopping the flow at a warning: *This may create another proposal*. The identity covers the proposal's content, not its schedule: changing only the timing settings resumes the earlier attempt as it was. The warning's forward action, **New transaction**, publishes the edited proposal anyway and deliberately supersedes the pending creation, so the warning stops reappearing. The alternative, **Resume existing transaction**, reopens the pending creation's own submission dialog instead; it is offered only while the app still holds that dialog's inputs, which it keeps for the current page load — after a reload the alternative degrades to a plain **Go back** that only dismisses the warning.

The rule belongs to this general-purpose wizard: flows that create a proposal under the hood do not run it. The pending records it consults live only in this browser tab — in memory while a signature is outstanding, mirrored to the tab's session storage once broadcast — so the check covers a single tab: a creation started in another tab or window is invisible to it.
