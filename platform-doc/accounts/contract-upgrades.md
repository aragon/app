---
type: capability
title: Contract upgrades
tags: [accounts, settings, upgradeability]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + pinned protocol-doc upgrade mechanism (2026-08-04, see log.md)
---

# Contract upgrades

**User promise:** opt into available OSx DAO and compatible installed-plugin contract updates through a governed proposal, without treating every release as mandatory maintenance.

## What can be upgraded

When this capability is enabled for an eligible account, the app surfaces an update entry in settings if an OSx DAO update or a compatible [plugin](../governance/plugin.md) update is available. Availability is selective: the [account contract](../protocol-doc/core/dao.md#upgrades-across-versions) has its own upgrade path, while only plugin types and versions supported by the [plugin update mechanism](../protocol-doc/guides/update-a-plugin.md) can update in place. An installed plugin appearing elsewhere in the app does not by itself promise an upgrade through this flow.

## Governed flow

1. Open the contract-update entry in account settings and review the available OSx and compatible plugin updates, including their release notes and contract addresses.
2. Choose the governance process that will authorize the change.
3. The app prepares any required plugin update data and opens the ordinary [proposal-creation flow](../governance/proposal-creation.md) with the upgrade actions.
4. Account participants review the implications and decide the proposal through that process; the contracts change only if its governed actions execute.

## Deliberately opt-in

Upgrades are offered, never pushed as routine maintenance. An upgrade changes executable code and can introduce risk, while many releases only add features an account does not need. The account opts in when the value of the new behavior justifies that change; remaining on the current compatible version is a legitimate posture.
