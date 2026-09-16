---
type: opportunity
title: Preserve or reject amounts the token cannot express
tags: [treasury, design, forms]
status: candidate
source: app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Preserve or reject amounts the token cannot express

## User story

As a person preparing a token transfer, I want the amount field to preserve my value when the token supports it and explain excess decimal precision when it does not, so that I can choose an expressible amount without the app silently changing my intent.

## Context + benefit

The [transfer amount field](../../application/action-builder.md#transferring-assets) rounds excess precision half-up and replaces the entered value without a message. The [input-normalization rule](../design/input-normalization.md) instead requires the amount to be preserved or refused with an explanation.

The candidate would retain expressible values and explain the token's decimal limit for values it cannot represent. This would make the required correction explicit and leave the choice of transfer amount with the person preparing it.
