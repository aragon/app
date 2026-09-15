---
type: decision
title: Refuse unsatisfiable configuration
tags: [design, interaction, access-control]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + protocol-doc/plugins/multisig-plugin/membership.md + app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Refuse unsatisfiable configuration

The app refuses a configuration only when the proposed state can never hold. This is invalid-input validation, not a restriction on an account's actions: consequential but valid actions are warned about and remain the account's choice.

For example, an approval or support ratio that can never be reached would create an impossible configuration rather than express user autonomy. The protocol has the same shape for multisig membership: `minApprovals` must stay between one and the current member count ([membership invariant](../protocol-doc/plugins/multisig-plugin/membership.md)).

This boundary is narrower than actor eligibility. An eligibility guard explains why the connected actor cannot take an otherwise valid action; an invariant refusal rejects a value that cannot describe a workable configuration for anyone.

## What the app refuses on its own

Most numeric refusals in the [governance designer](../governance/governance-designer.md) are the app *surfacing* a protocol bound rather than inventing one. The support threshold stops just below 100% while minimum participation reaches it, because the protocol compares support strictly and participation loosely — so a support threshold of exactly 100% could never be met, while full participation can ([support threshold](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/components/tokenSetupGovernance/fields/supportThresholdField/supportThresholdField.tsx#L44-L75), [minimum participation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/components/tokenSetupGovernance/fields/minParticipationField/minParticipationField.tsx#L46-L66), [upstream comparison rule](../protocol-doc/plugins/majority-voting.md)). A [stage](../governance/stage.md)'s approval or veto threshold cannot exceed the number of bodies of that type, and the multisig member-count rule is reused unchanged inside the plugin's own update-settings [action](../governance/action.md), so editing a live multisig is bounded exactly as configuring a new one is.

One refusal is the app's own, and it is not a bound on a single field. **A process must have at least one live way for a proposal to be created.** When a process restricts proposal creation to listed bodies rather than any wallet, the designer refuses to advance unless at least one of its bodies can propose — or, where that option is available, an already-deployed condition is attached ([the check](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createProcessForm/createProcessFormProposalCreation/createProcessFormProposalCreation.tsx#L89-L125)). The rule reads the whole design — every body across every stage, plus the attached conditions — rather than one input's range. What it refuses is not one actor's ineligibility but a process into which nobody could ever propose anything: the protocol has no notion of a process being reachable and would deploy that dead end happily. The condition escape hatch belongs to the advanced flow and is itself gated there, so in the basic flow the requirement reduces to needing a body that can propose.

The other half of the rule holds in the same place. A support threshold below half, or a multisig approving on a minority of its members, is consequential but perfectly satisfiable — so the app marks it as a minority configuration and lets it through ([the advisory, alongside the refusal](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/components/tokenSetupGovernance/fields/supportThresholdField/supportThresholdField.tsx#L34-L41)). The impossible region is refused; the merely risky region is named and left to the account.

## Open questions

- [ ] Does the Gauge setup flow refuse any configuration that the governance designer and the four governance plugins' setup dialogs do not?
