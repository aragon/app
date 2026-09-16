---
type: opportunity
title: Coordinate colliding onboarding prompts
tags: [design, governance, onboarding]
status: candidate
source: combined watcher/dialog-provider test at app@122f1bd1 (2026-08-05, see log.md)
---

# Coordinate colliding onboarding prompts

## User story

As a token holder connecting to participate in governance, I want relevant onboarding prompts to follow a deliberate order and remain available while I respond, so that I can complete the steps I need without a prompt unexpectedly replacing another.

## Context + benefit

Several [Token panel](../../governance/token-panel.md) prompts can qualify on the same deliberate wallet connection. A combined test confirms that delegation and lock-or-wrap prompts can replace one another, including while a holder is reading. Which prompt survives depends on loading order and timing. A replaced prompt does not return until the next deliberate connection.

This can happen when a holder has wrapped some tokens without delegating and still holds underlying tokens, or when a voting-escrow holder has all locks in the exit queue and retains an underlying balance. Finishing Aragon Profiles onboarding can release multiple waiting prompts together. The Members-list onboarding card already applies a priority order of Delegate, then Lock, then Wrap; connection-time dialogs have no equivalent rule.

The candidate would coordinate eligible prompts so holders can make one participation decision at a time without losing another relevant step. Before ticketing, choose sequencing, a queue, or the Members-card priority rule; decide whether an open prompt may ever be replaced; and include the independent Lock to Vote prompt in the collision checks.
