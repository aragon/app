---
type: opportunity
title: Pre-empt process configurations the protocol will reject
tags: [governance, validation, plugins]
status: candidate
source: app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Pre-empt process configurations the protocol will reject

A candidate improvement, not current behavior or a roadmap commitment.

The app already [refuses configurations that can never hold](../design/invariant-validation.md), and that rule is drawn narrowly on purpose. But three configurations in the [governance designer](./governance-designer.md)'s advanced flow pass the app's own validation and are then rejected on-chain, so the user discovers the problem as a failed transaction rather than as feedback in the form. Closing the gap does not require widening the refusal rule: each case is a value the protocol documents as invalid, which is exactly what that rule already covers.

The three verified instances, all in [stage](./stage.md) configuration and token-based [process](./process.md) setup:

- **A zero-length stage expiration.** The expiration field carries no minimum, so a user who turns expiration on and clears its inputs produces a maximum-advance time equal to the stage's own voting duration ([the field](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupStageSettingsDialog/fields/setupStageExpirationField/setupStageExpirationField.tsx#L56-L69), [the arithmetic](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/sppPlugin/utils/sppTransactionUtils/sppTransactionUtils.ts#L339-L353)). The processor requires that maximum to be strictly greater than the voting duration when stages are set, so the call reverts — and with early advance disabled the minimum-advance inequality breaks too ([upstream rule](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md)). Leaving expiration switched off is safe, and the field defaults to seven days, so this is an unguarded edge rather than a default-path failure.
- **The same body address twice in one stage.** The protocol rejects a duplicate body, and the app has the error plumbing for that field already in place but never populates it — the sibling permissions field uses the same mechanism to reject duplicate target/selector pairs, so the fix has a working precedent in the same wizard.
- **No upper bound on a voting duration.** The app enforces the protocol's one-hour floor but nothing above it; its duration input has no notion of a maximum at all, while the protocol bounds a majority-voting duration to a year ([upstream bound](../protocol-doc/plugins/majority-voting.md)). This one affects Token Voting and Lock to Vote; the processor's own stage duration has no documented upstream cap to surface.

Value: each instance turns a wasted signature and an opaque revert into in-form feedback, and the first is the sharpest because the resulting transaction can never succeed. Cost is low and local — a minimum on one field, a validation rule on a second, a maximum on a third — with no change to the product's validation philosophy.
