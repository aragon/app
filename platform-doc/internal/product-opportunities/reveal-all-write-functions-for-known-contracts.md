---
type: opportunity
title: Reveal all write functions for known contracts
tags: [governance, actions, discoverability]
status: candidate
source: product-owner action-builder briefing (2026-08-05, see log.md) + app source verification at app@122f1bd1
---

# Reveal all write functions for known contracts

## User story

As a proposal author, I want to reveal the additional verified write functions of a contract already in the Action picker, so that I can compose the action I need without entering the same contract address again.

## Context + benefit

The [Action picker](../../application/action-builder.md#adding-actions) initially shows curated functions for known contracts. Other verified write functions are reachable through **Add contract address**, but the author must submit an address already shown in the picker before those functions join the contract's group.

The candidate would offer **Show all** when a known contract's verified ABI contains additional write functions. This would make the existing capability discoverable while preserving the curated first view. Functions with Basic forms would keep them, and other functions would use the ABI-derived Decoded composer.

Before ticketing, establish which contract groups can expand and whether ABI availability is sufficient. Keep read-only functions out of the composing list, preserve the process allowlist when **Only show allowed actions** is enabled, and decide whether Raw calldata remains a separate item at the end of an expanded group.
