---
type: opportunity
title: Surface unlock eligibility before the attempt
tags: [governance, voting]
status: candidate
source: codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Surface unlock eligibility before the attempt

This is a product-discovery candidate, not a roadmap commitment or a statement of the current [choose a voting-power mechanism](../guides/choose-token-voting-power-mechanism.md) user promise.

## Opportunity

For a Lock to Vote body, the app already computes whether an unlock would succeed as soon as the member panel loads: it simulates the withdrawal before the holder does anything. The verdict is then discarded — the Unlock button renders enabled regardless, and a blocked holder learns their tokens are committed only from the after-the-fact "You can't unlock yet" dialog. The forewarning exists and is never shown; a disabled state or an inline notice while votes hold the lock would cost no new data source.

The dialog's copy compounds it: the message names one cause — an active proposal the holder created or voted on — while the guard treats any refusal the same way, so the stated reason can misattribute the actual one. Surfacing the computed result, and deriving or softening the message, would keep the abstraction honest about why the tokens are held.

## Before ticketing

- Decide the surface: a disabled Unlock button with a reason, an inline notice on the member panel, or both.
- Decide whether the blocked message should state the cause only when the app can establish it, and what it says otherwise.
