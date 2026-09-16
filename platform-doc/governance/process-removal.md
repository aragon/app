---
type: capability
title: Removing a governance process
tags: [governance, accounts]
status: draft
source: product-owner briefing (2026-07-14) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + completed recovery verification (protocol-doc@800da8d9b347200dda8362e7b68cfe74c08c79a5, osx@4100bcf0bc0cefecdedac2ca292f6b32b4796c49, locked OpenZeppelin@2d081f24cac1a867f6f73d512f2022e1fa987854; 2026-09-13, see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + product-owner disposition on the page's home and type (2026-09-15, see log.md); Uninstall process explanation consolidated from Governance designer (2026-09-15, see log.md)
---

# Removing a governance process

Removing a [governance process](./process.md) takes away its authority over the [account](../accounts/account.md). **Uninstall process** on the [Process details page](./process.md#process-details-page) prepares the removal and submits it as a proposal through a [selected process](../application/execution-routing.md). The process loses its governance authority when that proposal executes.

## What the app requires

Removal requires more than one app-listed process with unrestricted execution, counting linked-account processes when that support is enabled. Below that threshold, the app directs the user to create governance instead. Removing Admin has its own requirement and confirmation ([Admin flow](./admin-flow.md#removal-boundary)).

## Removing the last recognized process

The product rule is to warn about removing the last recognized governance process while preserving the account's choice. The account retains authority over its governance configuration.

The app recognizes a supported set of governance plugins. An account may also have authority through other plugins or direct permissions, so the absence of a recognized process does not establish that the account can no longer act.

Removing a process still has a real consequence: its governance route disappears. The warning should make that loss understandable so the account can decide whether the remaining authority serves its needs. Recovery depends on authority that remains usable; removing every execution route can leave the account unable to act.

The current app does not yet offer this warn-and-continue route for the last process; the requirement above applies instead.
