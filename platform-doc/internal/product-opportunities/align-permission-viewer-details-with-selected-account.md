---
type: opportunity
title: Align Permission Viewer details with the selected account
tags: [access-control, permissions]
status: candidate
source: Permission Viewer source verification at app@16d34dc3 (2026-08-28, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Align Permission Viewer details with the selected account

## User story

As a person reviewing a linked account's permissions, I want permission details and address links to use the account and network I selected, so that I can assess that account's authority without inspecting a different account or chain by mistake.

## Context + benefit

Selecting a [linked account](../../accounts/linked-account.md) in [Permission Viewer](../../access-control/permission-viewer.md) changes the permission records being queried. Some details still use the primary account's context: list details retain its account identity, while graph details also retain its network. For a linked account on another network, explorer links and recognized-condition details can therefore refer to the wrong context.

The candidate would keep list and graph details aligned with the selected account, making their links and condition information useful for the permission being reviewed. Primary-account context would remain where the interface intentionally explains the account hierarchy.

Before ticketing, reproduce the mismatch in both views with a cross-network linked account and a recognized condition. Establish which details intentionally describe the hierarchy, and verify address links, condition details, and account switching against the selected account and network.
