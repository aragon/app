---
type: opportunity
title: Coordinate colliding onboarding prompts
tags: [governance, onboarding]
status: candidate
source: combined watcher/dialog-provider test at app@122f1bd1 (2026-08-05, see log.md)
---

# Coordinate colliding onboarding prompts

This is a product-discovery candidate, not a statement of the [Token panel](./token-panel.md) participation-nudge promise.

## Opportunity

The connection-time onboarding watchers open their dialogs independently, and the dialog surface replaces rather than stacks: when more than one prompt qualifies on the same deliberate connection, exactly one is shown and the rest are silently lost. A combined test of the delegation and lock-or-wrap watchers under one dialog provider confirms there is no priority rule — the survivor is decided by mount order and data-arrival timing, a later prompt can replace one the holder is already reading, and the lost prompt does not return until the next deliberate connection, because each watcher clears its own pending state when it fires.

The collision is reachable in ordinary states. A wrapped Token Voting body reaches it whenever a holder has wrapped part of a balance without delegating and still holds the underlying token. A vote-escrow body reaches it when every lock sits in the exit queue while the holder also retains a positive underlying balance. The pause that defers these prompts while Aragon Profiles onboarding runs releases the watchers at the same moment, which makes simultaneous firing more likely. The Members-list onboarding card already has the missing rule — Delegate takes priority, then Lock, then Wrap — and shows one card at a time by design; the connection-time dialogs have no equivalent.

## Before ticketing

- Decide the rule: sequence the prompts, queue them, or apply the Members-card priority order to the connection-time dialogs.
- Decide whether an open onboarding dialog should ever be replaceable mid-interaction.
- Check the collision class beyond these two watchers: the Lock to Vote nudge is a third independent caller of the same dialog surface.
