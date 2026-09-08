---
type: pattern
title: Show validation when it can help
tags: [design, interaction, forms, validation]
status: draft
source: app interaction-principles inventory against app@122f1bd1 + product-owner review (2026-08-05, see log.md)
---

# Show validation when it can help

Show a validation message at the earliest moment the person can understand and act on it. Do not show an error merely because the app can detect one, and do not wait until submission when the person could have repaired it safely in the field or step where it began.

## Match the message to the decision point

- **Before interaction:** do not mark an untouched field as wrong. The person has not had a chance to provide a value.
- **After finishing a field:** show a local error when that field alone contains enough information to explain and repair it, such as a missing required value or invalid address.
- **After attempting to continue:** show every issue that blocks the current step, move attention to the first one, and keep the person's other entries intact.
- **After submission:** report failures that only the receiving service, wallet, simulation, or chain can determine. Keep these separate from field validation.
- **While editing:** use live feedback only when it helps the person make the current choice, such as showing a changing limit or clearing an error as soon as the value becomes valid.

This makes "touched" and "submitted" tools rather than competing global policies. Ordinary field errors usually become useful after the person leaves the field. Cross-field or step-level errors become useful after the required inputs exist or the person tries to continue. A submit-only check is appropriate when no earlier local message would be reliable.

## Keep repair local

A failed check keeps the person in the smallest part of the flow that can repair it. A wizard step shows its own blocking fields; it does not erase earlier steps or restart the [wizard](./wizard.md). Moving back preserves entered values, and returning to a corrected field removes an outdated error as soon as the new value passes.

For example, Create Proposal does not open with every required field marked critical. If the person selects **Next** without a title, the title field explains what is missing. After the title is entered, the error clears and the rest of the proposal remains intact.
