---
type: capability
title: Contract upgrades
tags: [accounts, settings, upgradeability]
source: product-owner release-notes briefing (2026-08-03, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + pinned protocol-doc upgrade mechanism (2026-08-04, see log.md) + product-owner briefings and app 1.39.0 upgrade verification (2026-09-15, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md)
---

# Contract upgrades

Contract upgrades let an account upgrade its [Aragon OSx contract](../protocol-doc/core/dao.md#upgrades-across-versions) and supported installed [plugins](../governance/plugin.md) to newer versions. Upgrades are optional and must be initiated by a plugin or actor with sufficient authorization. For example, governance participants must weigh the value of the changes against the risks of changing contract code and then vote accordingly.

## Available upgrades

The [Contracts panel](./settings.md#contracts) offers an upgrade when the account has an installed governance process and the app supports a newer version of its OSx contract or one of its plugins. Availability depends on the network and the installed contract versions.

A plugin's [repository](../protocol-doc/framework/plugin-repo.md) records its published versions onchain. The app offers [plugin updates](../protocol-doc/guides/update-a-plugin.md) only when both the type and repository match an update it supports. A custom plugin published through a separate repository therefore needs its own supported update path. Unknown plugins are excluded from the upgrade list.

## Performing an upgrade

The flow starts from account settings with [execution routing](../application/execution-routing.md). The app then shows the available upgrades, including current and new versions, contract addresses, and links to release notes.

If plugin updates are included, the user submits a preparation transaction. This runs the plugin's update setup, deploying any new supporting contracts it requires and preparing the initialization data and permission changes. The new implementation contract is supplied by the published plugin version; the installed plugin starts using it when the upgrade executes.

The app assembles the upgrade actions and pre-populates the proposal's title, summary, and description. These fields cannot be edited in this flow. The user publishes the prepared proposal, and participants decide it through the selected governance process. The upgrades take effect when the approved proposal's [actions execute](../governance/proposal.md#actions-and-execution).
