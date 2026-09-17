---
type: opportunity
title: Align Permission Viewer details with the selected account
tags: [access-control, permissions]
status: candidate
source: Permission Viewer source verification at app@16d34dc3 (2026-08-28, see log.md)
---

# Align Permission Viewer details with the selected account

This candidate addresses a context mismatch in [Permission Viewer](./permission-viewer.md) when someone inspects a cross-network [linked account](../accounts/linked-account.md). It is not a roadmap commitment.

## Opportunity

Selecting another account changes the permission query to that account's address and network. The detail presenters receive a mixture of contexts: list details use the selected network but retain the primary account ID, while graph details retain the primary account ID, network, and chain ID. For a linked account on another network, an explorer link or recognized-condition read can therefore use the wrong context even though the displayed permission row belongs to the selected account.

Pass the selected account's ID, network, and chain ID through both views' detail presenters. Keep primary-account context only where the interface deliberately describes the account hierarchy.

## Before ticketing

- Reproduce the mismatch with a linked account on another network in list and graph views, including a recognized condition.
- Define which details need selected-account context and which, if any, intentionally retain primary-account context.
- Add coverage for address links, condition presenters, and account changes in both views.
