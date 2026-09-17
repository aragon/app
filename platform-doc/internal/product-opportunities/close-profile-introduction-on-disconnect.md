---
type: opportunity
title: Close the profile introduction on wallet disconnect
tags: [accounts, wallet, profiles]
status: candidate
source: classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md)
---

# Close the profile introduction on wallet disconnect

## User story

As a person creating or editing my profile, I want the introduction to close when I disconnect its wallet, so that I do not continue a profile flow for an identity that is no longer connected.

## Context + benefit

The [connected-wallet menu](../../application/wallet-connection.md#dialogs-that-need-a-wallet) closes when its wallet disconnects, but the profile introduction opened above it remains visible. Cancel still works; the create or edit action leads into a flow that needs the disconnected identity.

The candidate would apply the [wallet-readiness rule](../design/dialog-taxonomy.md#wallet-readiness) to the introduction, keeping the prompt aligned with the identity available to complete it. Verify both create and edit entry points, distinguish a settled disconnect from a temporary connector switch, and ensure reconnecting cannot resume the prompt for the wrong address.
