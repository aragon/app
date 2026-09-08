---
type: pattern
title: Control availability
tags: [design, interaction, access-control]
status: draft
source: product-owner briefings (2026-07-29, see log.md)
---

# Control availability

Hiding a control, showing it disabled, or showing it enabled and responding at activation are different product messages, not interchangeable implementation choices. Each treatment makes a different promise about whether a capability exists, belongs in the current context, and can succeed. Choose the treatment from the user's reasonable expectation, following [every element makes a claim](./every-element-makes-a-claim.md).

| Treatment | What it communicates | Use it when | What the interface owes the user |
| --- | --- | --- | --- |
| **Hide** | No relevant control is offered here. | The user has no reasonable expectation of the capability in this context, or knowing it exists would not help with the current goal. | This surface owes nothing about the hidden capability. Do not create an expectation merely to deny it. |
| **Show disabled** | The control belongs here, but the option or action itself is unavailable in the current object, configuration, or state. | The user reasonably expects it as part of a stable set, and seeing its position helps explain the workflow, compare options, or anticipate a later state. | A user-facing reason, and a remedy when one exists, available without trying the disabled control. |
| **Show enabled, then guard** | The action is valid at this point in the object's lifecycle, but the connected actor may not be eligible to perform it. | The action is reasonably expected in the current task and the actor-specific restriction deserves explanation, or definitive eligibility can only be established at activation. | On activation, stop before commitment and explain the user-facing reason and next step. Do not use a guard to advertise a contextually irrelevant action or to represent an action that is unavailable in the current state. |
| **Show enabled, then warn or confirm** | The action is available, but its consequences deserve deliberate attention. | The user is allowed to proceed and the issue is risk, irreversibility, or likely harm rather than ineligibility. | Explain the consequence at the commitment boundary and preserve the user's choice. Use the platform's [alert severity](./alert-severity.md) consistently. |
| **Show enabled** | The action is relevant and available. | The action belongs in the context and no additional eligibility or consequence treatment is needed. | Let activation advance the task as promised. |
| **Refuse invalid configuration** | The proposed value cannot describe a configuration that could ever work. | The input violates an invariant, such as a ratio above 100%; this is not an otherwise valid action the product dislikes. | Identify the impossible value and require a satisfiable one. See [invariant validation](./invariant-validation.md). |

## Decision sequence

1. **Would the user reasonably expect this control or need it for the current goal?** If no, hide it.
2. **Is the option or action itself unavailable in the current object, configuration, or state?** If yes, show it disabled when its visible position resolves the user's expectation; give the reason and any path to availability.
3. **Is the action valid now, but unavailable to the connected actor?** If the action is reasonably expected, keep it actionable and use an eligibility guard to explain the actor-specific restriction. If the user has no reason to expect the capability, hide it.
4. **Is the actor eligible?** Show the control enabled. Add a warning only when the permitted action has significant consequences.
5. **Can the proposed configuration ever hold?** If no, refuse it as invalid input; do not characterize that refusal as a restriction on the account's actions.

When a disabled control cannot itself expose an explanation accessibly, put the reason in adjacent content or provide a separate information affordance. Do not make a control appear enabled solely to work around an inaccessible disabled state.

## Keep the distinctions honest

**Communication is not enforcement.** Hidden and disabled controls only describe the interface's current understanding. Authorization must still be enforced by the authoritative backend or on-chain [permission system](../protocol-doc/core/permissions.md); hiding a control is never a security boundary.

**A guard is not a warning.** A guard says the action cannot proceed for this actor or state. A warning says the action can proceed, but the user should understand its consequences. A warning must not become a disguised block, and a guard must not imply that a forbidden action merely needs confirmation.

**An invariant refusal is not a guard.** An eligibility guard is about who may perform an otherwise valid action. A refusal is about a value that no actor could make workable; [invariant validation](./invariant-validation.md) defines that narrow hard-stop boundary.

**A disabled control is not neutral.** It announces that a capability exists and may be relevant or available in another state. Do not use disabled controls to advertise advanced features to users who have no reason to expect them.

## Worked instances

- **Hidden:** the direct [create-transaction](../treasury/create-transaction.md) control is absent without execute permission because the product defines no direct-control expectation for an actor outside that context.
- **Disabled:** unsupported levels in the [action viewer](../governance/action-builder.md) remain visible because the fixed basic/decoded/raw model orients the reader, while the disabled state says which representations this action supports.
- **Guarded:** [executing a passed proposal](../governance/proposal.md) remains part of the proposal lifecycle even when execution is actor-restricted; activation gives an ineligible user the reason.
- **Warned:** [removing the last known governance process](../accounts/last-process-removal.md) is permitted but dangerous, so the app warns at commitment and lets the user proceed.
