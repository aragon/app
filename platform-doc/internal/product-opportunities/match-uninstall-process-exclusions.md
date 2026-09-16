---
type: opportunity
title: Match uninstall exclusions to process identifiers
tags: [governance, plugins, product-planning]
status: candidate
source: removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Match uninstall exclusions to process identifiers

## User story

As an operator preparing a process uninstallation, I want process selection and the proposal summary to agree about which process will be removed, so that I can choose the intended governance route and understand the proposal's effect.

## Context + benefit

The uninstall flow asks for another process but can still offer the removal target, including [Admin](../../governance/admin-flow.md#removal-boundary). Its summary then says the selected process will remain unaffected even when that process is also being removed.

The candidate would align the selectable processes and summary with the actual removal. This would prevent operators and reviewers from relying on a contradictory description of which governance route remains. Any intentional self-removal route adopted for [last-process removal](../../governance/process-removal.md#removing-the-last-recognized-process) would need to state that consequence explicitly.

Before ticketing, verify distinct processes, processes with matching names on linked accounts, and any deliberately supported self-removal route.
