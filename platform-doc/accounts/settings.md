---
type: capability
title: Settings
tags: [accounts, governance]
status: draft
source: live application-page coverage audit, released app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md); existing owner-confirmed account, linked-account, governance and upgrade scope + product-owner briefings (2026-09-15, see log.md)
---

# Settings

The **Settings page** brings together an [account](./account.md)'s identity, governance processes, and contract versions. It helps participants inspect the account's configuration and start authorized changes through [Admin management](../governance/admin-flow.md#admin-controls), the [governance designer](../governance/governance-designer.md), or [contract upgrades](./contract-upgrades.md).

## Account information

The **Account** section shows the account's network, address or ENS name, description, and resource links. With [linked accounts](./linked-account.md), it presents the primary and linked accounts separately so readers can inspect each one's identity and network. The links to the block explorer and [Permissions](../access-control/permission-viewer.md#permissions-page) provide access to contract records and indexed OSx grants.

These identity details describe the deployed account. Changing its name, description, logo, or resources uses the [account-metadata action](../application/basic-action-views.md#assets-and-identity); the deployment network stays fixed.

## Governance

The **Governance** section lists the account's visible, supported processes, including processes from linked accounts. Selecting one opens its [Process details page](../governance/process.md#process-details-page), where members can inspect the governance configuration, proposal-creation requirements, and authorized actions.

For an account running OSx 1.4 or later, **Process** starts the [governance designer](../governance/governance-designer.md). [Execution routing](../application/execution-routing.md) identifies the existing process that will decide the installation proposal. While Admin is installed, its management panel also provides the [member-change and removal controls](../governance/admin-flow.md#admin-controls).

## Contracts

The **Contracts** panel identifies the account and installed plugins by address and version, with links to their contract records. Eligible accounts also receive an entry for available [contract upgrades](./contract-upgrades.md). Reviewing a version or opening an update flow does not apply an upgrade; the authorized proposal must execute the change.
