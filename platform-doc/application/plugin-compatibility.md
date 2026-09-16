---
type: concept
title: Plugin compatibility
tags: [cross-cutting, governance, plugins, compatibility]
source: product-owner briefing (2026-07-14) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + app and app-backend source verification + product-owner briefings (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.37.1 unresolved-interface verification (2026-09-08, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + product-owner semantic-anchor review and compatibility-reference extraction (2026-09-10, see log.md) + product-owner editorial feedback (2026-09-13, see log.md) + product-owner compatibility review and taxonomy reassessment (2026-09-15, see log.md) + product-owner compatibility follow-up and app 1.39.0 visibility/update verification (2026-09-15, see log.md)
---

# Plugin compatibility

Plugin compatibility determines which [plugins](../governance/plugin.md) are supported by the application and to what extent. A plugin can be supported for use once installed even when users cannot deploy it themselves through the app.

## Levels of support

| Category | What the app supports | How it is deployed |
| --- | --- | --- |
| Fully supported plugins | Setup and use of the plugin through the app. | Users can configure and deploy it themselves on supported networks. |
| [Aragon-deployed plugins](./aragon-deployed-plugins.md) | The user experience for the installed plugin. | The Aragon team deploys the plugin; the app has no self-service setup. |
| Unsupported plugins | No user experience for the installed plugin. | The plugin can still be installed onchain through other tools. |

The governance designer's [Basic flow](../governance/governance-designer.md#the-basic-flow) provides self-service setup for Multisig, Token Voting, and Lock to Vote on networks where they are available. Its [Advanced flow](../governance/governance-designer.md#the-advanced-flow) uses the Staged Proposal Processor (SPP) and requires setup by the Aragon team. [Admin](../governance/admin-flow.md#starting-with-admin) is set up during account creation. The [Aragon-deployed plugin catalogue](./aragon-deployed-plugins.md#plugin-catalogue) lists the plugins Aragon deploys for clients during a commercial engagement.

## How the app supports a plugin

The backend indexes installed plugins and identifies their type from the functions they expose. It makes the plugin's data available to the frontend, which uses it to show the appropriate user experience. For Token Voting, for example, this includes creating proposals and voting.

The app interacts with a plugin through its **ABI (Application Binary Interface)**, which describes its functions, events, and data formats. A developer can modify the plugin's internal logic and retain the existing app experience, provided the ABI and the behavior the app relies on remain compatible.

If the application cannot associate an installed plugin with a supported type, it has no corresponding user experience and treats the plugin as **unknown**. The plugin's actions still take effect onchain, whether or not the app displays them.

## Visibility

The app's governance data lists exclude unknown plugins and plugins the backend marks as unsupported. Individual plugins can also be hidden through [App CMS](./app-cms.md#five-established-uses).

An unknown plugin will still appear in the [Contracts panel](../accounts/settings.md#contracts), unless it has been hidden through App CMS. Its indexed permissions will also still appear in the [Permission Viewer](../access-control/permission-viewer.md).
