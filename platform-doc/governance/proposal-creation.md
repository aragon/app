---
type: capability
title: Proposal creation
tags: [governance, proposals, access-control]
status: draft
source: product-owner briefing (2026-07-20, wizard system) + product-owner briefings (2026-07-28, see log.md) + product-owner briefing (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + app process-selector verification and create-proposal flow verification (2026-08-04, app@122f1bd1; see log.md) + product-owner action-builder briefing (2026-08-05, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md)
---

# Proposal creation

The capability for turning an author's intent into a [proposal](./proposal.md) owned by a selected [process](./process.md). It combines process selection, creation eligibility, the shared proposal wizard, and transaction submission; the proposal object and its later lifecycle remain separate from the flow that creates it.

## Entering creation and choosing a process

The **Create Proposal** action lives at the top of the Proposals page. With one available process it goes directly to that process's creation wizard; with several it first opens the process selector and asks which **proposal type** to create — that is, which process will own the proposal. The selector preflights each process by simulating proposal creation. Processes whose checks succeed are enabled and ordered first; a concrete simulated revert leaves a process visible but disabled at the bottom. An unavailable, failed, or otherwise inconclusive preflight fails open rather than claiming the user is ineligible, and the final creation guard remains the enforcement backstop. For a known failure, **View requirements** links from the eligibility help to that process's details page, where the user can inspect its proposal-creation requirements.

Other product flows may create a proposal under the hood, such as applying a governance installation or changing Admin members, without sending the user through this general-purpose wizard.

## Creation eligibility

Who can create a proposal is configured per process in the [governance designer](./governance-designer.md) (its worked example's step "specify who can create proposals"). This is separate from who *decides* — the [bodies](./body.md) governing the process's [stages](./stage.md) — and the two are configured independently.

### The supported pattern: open to all, narrowed by conditions

On a **staged process**, the app opens proposal creation to all addresses and narrows it with conditions, rather than listing eligible addresses directly. The gate is the SPP's own [rule condition](../protocol-doc/plugins/spp-plugin.md#who-can-create-proposals-the-rule-condition) (`SPPRuleCondition`), deployed with the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) itself — configuring who can create proposals is configuring its rules.

The rule condition is **open by default at the protocol level** (no rules configured, anyone can propose), but the app updates it the moment a process is designed, driven by which [bodies](./body.md) are part of it. The [governance designer](./governance-designer.md) shows each of the process's bodies as an on/off toggle; toggling a body on adds its proposal-creation condition — really a **membership condition**, since what it checks is membership in that body — into the rule condition, which **composes these membership conditions with boolean logic**.

The designer's proposal-creation step arrives pre-answered. Its eligibility choice is [preselected on **Members**](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createProcessForm/createProcessFormProposalCreation/createProcessFormProposalCreation.tsx#L101-L120) rather than **Anyone**, and every body the step lists comes with its toggle already on — each plugin body of the process, in every stage, plus a Safe; a manual body that is not a Safe never appears in the step. A staged process installed on those defaults therefore starts with a rule condition that **ORs together one membership condition per listed body**: creation open to the members of any of those bodies, and to no one else. Picking **Anyone** instead sends no rules at all, leaving the protocol-level open condition in place.

A single-plugin (basic) process has no SPP; its creation gate ships with the [plugin](./plugin.md) itself ([governance designer](./governance-designer.md)). The **Members** default carries over, but it lands in the plugin's own settings, and what it means differs by plugin type: a multisig is installed [restricted to its listed members](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/multisigPlugin/components/multisigProposalCreationSettings/multisigProposalCreationSettings.tsx#L37-L55); a Token Voting or Lock to Vote body is installed with a [minimum proposer requirement of one whole token](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/components/tokenProposalCreationSettings/tokenProposalCreationSettings.tsx#L66-L97), so any address holding at least one whole token — not only a listed member — can propose; for Lock to Vote, the address must have *locked* at least that much. This page's composition pattern is the staged case.

### Existing conditions: composing an already-deployed condition

Beyond the body toggles, the **advanced** designer has an **existing conditions** field: the address of any already-deployed condition contract can be pasted in and composed into the rule condition alongside the body membership conditions — for example, the above-a-token-threshold [`VotingPowerCondition`](../protocol-doc/plugins/token-voting-plugin/voting-power.md#who-may-propose) that a Token Voting body's own plugin setup deploys: composed this way, it gates creation on token balance.

Existing conditions are an implementation-facing mechanism. The basic flow neither displays the field nor advertises that it exists in advanced mode. A basic-flow user has no referent for the concept, so such a message would expose an architectural consequence rather than help with the task ([every element makes a claim](../design/every-element-makes-a-claim.md)).

What the designer does not offer: authoring or deploying a new bespoke condition (if a condition isn't already deployed somewhere, there is nothing to paste into the field), and granting creation directly to a bare address — no such flow exists in the designer, though a direct grant can still be made outside it after the fact (see [stages over direct permission grants](./stages-over-direct-permissions.md)).

### The `SafeOwnerCondition`: a Safe's owners as eligible creators

A [`SafeOwnerCondition`](../protocol-doc/helpers/condition-library/safe-owner-condition.md) is one such condition. Whenever a [Safe serves as a governing body](./safe-as-a-body.md) in a governance process, the app deploys this condition in the background — via the protocol's [`ConditionFactory`](../protocol-doc/helpers/condition-library.md#the-conditionfactory) — and offers it as that body's creation condition, the only option available for a Safe body, letting a Safe owner create a proposal the same way a member of an Aragon multisig or Token Voting [body](./body.md) can (on the two kinds of "multisig," see [Safe vs Aragon multisig](../guides/safe-vs-aragon-multisig.md)).

### Eligibility is independent per body

A staged process can allow creation through one body's members and not another's — e.g. a multisig's members but not a Token Voting body's token holders (see [multisig gates](./multisig-gates.md) for this pattern worked through end to end).

### Editing eligibility on a live process

[Advanced processes are not editable in the app at all](./governance-designer.md#editing-across-the-lifecycle), so there is no designer flow for creation eligibility on a live advanced process. Narrowing the composed rules themselves means updating the rule condition directly, outside the app; replacing the gate wholesale — revoking an open grant and granting creation to a specific address — is possible while the account still has admin ([stages over direct permission grants](./stages-over-direct-permissions.md)). What the app does do is show the process's current creation eligibility on its [process details page](./process.md).

## Creating a proposal

The full-screen wizard collects:

1. **Metadata** — a required title; an optional summary for quick understanding at the top of the proposal; an optional rich-text body for the rationale, detail, and what voters are deciding; and resources. The screen also lets the author choose whether the proposal carries actions.
2. **Actions** — the shared [action builder](./action-builder.md) when actions are enabled. If the author opts out, this step is skipped and the proposal is published with zero actions as a [signaling proposal](./proposal.md).
3. **Settings, when required** — this step exists only when the selected plugin registers additional parameters for its create-proposal function. Current plugin integrations use it mainly for timing:
   - **Admin** has no settings step.
   - **Multisig** asks for start and end, and recommends at least five days between them.
   - **Token Voting** asks for start and end, enforcing the plugin's configured minimum duration.
   - **Lock to Vote** asks for start; the plugin's configured duration determines the end.
   - **Staged Proposal Processor** asks for start; its configured stages determine the later timing.

Continuing from the last applicable step opens the shared [transaction submission dialog](../design/transaction-submission.md), which pins the metadata and submits one create-proposal transaction.

Before that dialog opens, the wizard checks whether another proposal creation for the same account and process is still in flight — handed to the wallet awaiting signature, or broadcast and not yet confirmed. Resubmitting an unchanged proposal is not a conflict: it keeps the same submission identity and resumes, per the [stepper](../design/transaction-submission.md)'s resumption rule. Editing the proposal's content after closing the dialog — title, summary, body, resources, or actions — gives the submission a new identity, so continuing would publish a second proposal; that is the case the check catches, stopping the flow at a warning: *This may create another proposal*. The identity covers the proposal's content, not its schedule: changing only the timing settings resumes the earlier attempt as it was. The warning's forward action, **New transaction**, publishes the edited proposal anyway and deliberately supersedes the pending creation, so the warning stops reappearing. The alternative, **Resume existing transaction**, reopens the pending creation's own submission dialog instead; it is offered only while the app still holds that dialog's inputs, which it keeps for the current page load — after a reload the alternative degrades to a plain **Go back** that only dismisses the warning.

The rule belongs to this general-purpose wizard: flows that create a proposal under the hood do not run it. The pending records it consults live only in this browser tab — in memory while a signature is outstanding, mirrored to the tab's session storage once broadcast — so the check covers a single tab: a creation started in another tab or window is invisible to it.
