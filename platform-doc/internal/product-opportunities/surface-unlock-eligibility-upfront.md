---
type: opportunity
title: Surface unlock eligibility before the attempt
tags: [governance, voting]
status: candidate
source: codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Surface unlock eligibility before the attempt

## User story

As a holder using Lock to Vote, I want to see whether I can unlock my tokens before attempting it, with a reason the app can substantiate, so that I can decide when to act and understand what is preventing withdrawal.

## Context + benefit

For a Lock to Vote body, the app simulates withdrawal when the member panel loads but does not show the result. Unlock remains enabled, and a refused attempt opens the “You can't unlock yet” dialog. The fixed explanation attributes the refusal to an active proposal the holder created or voted on, even though the check can reject for other reasons. For participation context, see [voting-power mechanisms](../../guides/choose-token-voting-power-mechanism.md).

The candidate would use the available simulation result to show eligibility before the attempt. A disabled control with a reason, an inline notice, or both could help holders understand the restriction without discovering it through a failed attempt. A specific cause would be stated only when established; otherwise the explanation would acknowledge that the cause is unknown.

Before ticketing, choose the presentation and define the wording for known and unestablished causes of refusal.
