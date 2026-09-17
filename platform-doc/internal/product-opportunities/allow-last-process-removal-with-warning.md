---
type: opportunity
title: Allow last-process removal with a warning
tags: [accounts, governance, product-planning]
status: candidate
source: removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Allow last-process removal with a warning

## User story

As an authorized account operator, I want to continue removing the last recognized governance process after reviewing a clear warning, so that I can choose the account's governance arrangement with an understanding of the authority being removed.

## Context + benefit

The ordinary **Uninstall process** control opens confirmation only when the app lists more than one process with unrestricted execution. Below that threshold it offers **Create governance process** with no removal continuation, preventing the [warn-and-continue removal rule](../../governance/process-removal.md#removing-the-last-recognized-process) from being used.

The app's process list does not establish all independently usable authority an account may have. The candidate would explain which recognized route will disappear and allow an authorized operator to proceed where a supported execution route exists. Removing every usable execution route can leave the account unable to act; the warning and confirmation need to make that consequence clear.

Before ticketing, define preparation, execution, and subsequent navigation when a process must publish its own uninstallation proposal. Assess linked-account scope and conditioned or unknown authority, preserve onchain permission checks and the separate [Admin bootstrap requirement](../../governance/admin-flow.md#removal-boundary), and explain when no supported execution route is available.
