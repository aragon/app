---
type: opportunity
title: Keep destination transfers independent of the source account
tags: [governance, cross-chain, actions, product-planning]
status: candidate
source: basic-action-view audit at app@f8bf9e87260190aefd7d8a0eb59f72844e6e4502 (2026-09-10, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Keep destination transfers independent of the source account

## User story

As an author composing a cross-chain proposal, I want to prepare an allowed transfer using the destination account's network and balances, so that I can enter the transfer for the account that will execute it.

## Context + benefit

An allowed native or ERC-20 transfer in a [cross-chain destination batch](../../governance/cross-chain-execution.md#building-and-reading-the-action) can select a form that requires source-account context the destination editor does not provide. The author may therefore be unable to enter the transfer. Supplying source-account data would describe a different account's network and balances.

The candidate would provide a transfer form with verified destination context or preserve a usable generic ABI or raw-calldata route. That would let authors compose the permitted destination action with the appropriate account information.

Verify native and ERC-20 allowances, destination changes, and reopening the nested editor before ticketing.
