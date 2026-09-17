---
type: concept
title: Admin flow
tags: [accounts, admin, onboarding, governance]
status: draft
source: aragon-knowledge-base/product/concepts/admin-flow.md (first-slice brain dump, 2026-07-06) + product-owner release-notes briefing (2026-08-03; releases 1.0.0, 1.2.0, and 1.24) + app source verification (2026-08-04, app@122f1bd1; see log.md) + removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + product-owner editorial feedback (2026-09-13, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13) + product-owner briefings (2026-09-15, see log.md)
---

# Admin flow

The admin flow is the temporary governance of a new [Aragon account](../accounts/account.md) during setup. Its [Admin plugin](../protocol-doc/plugins/admin-plugin.md) lets the initial admin act immediately so they can install the governance the organization will use afterwards.

## Starting with Admin

[Account creation](../accounts/account-creation.md) installs Admin with the connected wallet as the initial admin. An admin can add other admins, configure the account, and install governance without waiting for a vote. Each action creates and executes a proposal in one transaction, preserving the account's common proposal history and presentation.

Admin is provided for this bootstrap. The governance designer does not offer it as a new governance choice, and the current self-service flow cannot reinstall it after removal.

A freshly created account still needs its intended ongoing governance installed, and installing plugins requires permissions on the DAO. Installing Admin during creation supplies that authority immediately.

## Onboarding dashboard

When Admin is the account's only visible governance process, its dashboard guides the transition into governance. An admin can use the [governance designer](./governance-designer.md) where available or [work with Aragon](../application/getting-help.md) on a custom setup. Other visitors see that the account is still being set up and can inspect its admins.

## Admin controls

Admins can share setup responsibility by changing the admin list. Each admin can act immediately, so changing that list changes who can exercise the authority.

Account settings shows the installed Admin plugin and its members. **Manage admins** lets an existing admin add or remove members. The change executes in one transaction, with a [proposal](./proposal.md) retained in the account's history. At least one admin must remain in this form; ending admin control uses plugin removal instead.

## Handing over governance

The admin installs the chosen governance through the designer's [prepare-and-apply flow](./governance-designer.md#preparing-and-applying-an-installation). Admin executes the installation proposal immediately.

Installing governance does not by itself end admin control. Removing the Admin plugin completes the handover once the replacement is ready.

### Removal boundary

**Remove all admins** uninstalls the Admin plugin. This ends the bootstrap: the former admins lose the authority that plugin gave them, and the account depends on its remaining governance.

For the normal Admin setup, the app requires another process with unrestricted execution on the same account before starting removal. A process on a linked account does not satisfy this requirement. If replacement governance is missing, the app directs the admin to [create it](./governance-designer.md).

Before preparing removal, a critical confirmation asks the admin to consider that handover. Its purpose is to make the loss of admin authority explicit and establish that the remaining governance is sufficient. Removal is then prepared and submitted as a proposal through the [selected governance process](../application/execution-routing.md); the proposal must execute for Admin to be removed.
