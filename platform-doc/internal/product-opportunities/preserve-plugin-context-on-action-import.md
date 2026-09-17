---
type: opportunity
title: Preserve plugin context on action import
tags: [governance, actions, product-planning]
status: candidate
source: basic-action-view audit at app@f8bf9e87260190aefd7d8a0eb59f72844e6e4502 (2026-09-10, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Preserve plugin context on action import

## User story

As an author reusing an action set, I want imported actions to open in usable editing forms, so that I can adapt a previous proposal or direct transaction without rebuilding its actions.

## Context + benefit

[Uploading an action set](../../application/action-builder.md#reusing-action-sets-as-json) can discard plugin information required by the Basic forms for multisig settings, Token Voting settings, and Mint actions. The app recognizes an action but may fail to display the form needed to edit it. Proposal composition and direct transactions are both affected.

The candidate would retain the plugin context required by the selected form or provide a usable generic form when that context is unavailable. This would make reuse a workable starting point for editing. Verify all three action families, missing-plugin cases, and actions received through WalletConnect.
