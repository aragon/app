---
type: concept
title: Admin flow
tags: [accounts, admin, onboarding, governance]
status: draft
source: aragon-knowledge-base/product/concepts/admin-flow.md (first-slice brain dump, 2026-07-06) + product-owner release-notes briefing (2026-08-03; releases 1.0.0, 1.2.0, and 1.24) + app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Admin flow

The bespoke product experience around the [admin plugin](../protocol-doc/plugins/admin-plugin.md): the state a freshly created [account](./account.md) starts in, where one or more admins can act on it instantly. The app treats the admin plugin differently from other plugins in many ways (and similarly in others), so the admin flow has its own surface area — and its own intent: **it is a transitional bootstrap.**

## Its place in the plugin model

Admin is a recognized, built-in [plugin](../governance/plugin.md): the app registers it and supplies Admin-specific governance and settings slots ([registration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/index.ts#L12-L50)). It nevertheless sits outside the governance designer's three self-service setup families — Multisig, Token Voting, and Lock to Vote where deployed. Admin's complete plugin definition has no picker `setup` property ([Admin definition](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/constants/adminPlugin.ts#L4-L36)), while the picker admits only registered plugins with setup data and a non-zero repository address for the selected network ([picker filter](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogSelect/setupBodyDialogSelect.tsx#L32-L39)). Its apparent “third status” is therefore a separate installation-availability axis: **known and purpose-built, but factory-installed as the bootstrap rather than selectable as new governance.**

## Where Admin differs

- **It is installed during account creation.** The app passes Admin as the sole initial plugin setting to `DAOFactory.createDao`, with the connected wallet as the initial admin ([creation transaction](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialogUtils.tsx#L49-L69), [plugin setting](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialogUtils.tsx#L106-L122)). It is not installed through the live-account setup picker and the current self-service flow cannot reinstall it after removal. This is the product behavior behind [installing Admin by default](./admin-plugin-by-default.md).
- **Creation is permission-gated and execution is atomic.** The app lets a wallet create an Admin proposal only when that wallet is an Admin member ([permission check](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/hooks/useAdminPermissionCheckProposalCreation/useAdminPermissionCheckProposalCreation.ts#L13-L60)). It submits `createProposal` once ([transaction builder](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/utils/adminTransactionUtils/adminTransactionUtils.ts#L5-L17)); the contract creates and executes in that call, without the eligibility and later execution phases ordinary processes may have. See [proposal creation](../governance/proposal-creation.md) for the contrast.
- **Its status has no intermediate states.** The Admin status slot always returns `EXECUTED` ([status function](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/utils/adminProposalUtils/adminProposalUtils.ts#L3-L5)), matching the Admin exception in [proposal status](../governance/proposal-status.md).
- **It owns dedicated product surfaces.** The per-account onboarding dashboard below and the settings banner, Admin panel, member-management dialog, and removal control in [Admin management](./admin-management.md) exist specifically for this bootstrap state.

## Where Admin matches

- **It plugs into the common proposal shell.** Admin registers the same proposal-building, creation-check, status, and voting-terminal slot families used by recognized governance plugins, so Admin actions still create proposal-shaped, indexed history even though their lifecycle has zero width ([Admin slots](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/index.ts#L19-L48), [why the protocol keeps the proposal shape](../protocol-doc/plugins/admin-plugin.md#the-zero-width-proposal-lifecycle)).
- **It installs replacement governance through the common live-plugin lifecycle.** The selected plugin's slot builds the `prepareInstallation` call; after preparation, the app turns the exact setup data into a proposal and publishes it through Admin with the shared temporary-ROOT grant/apply/revoke action sequence ([plugin-specific preparation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils.ts#L322-L343), [proposal construction and publish](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialog.tsx#L145-L190), [shared apply actions](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/pluginTransactionUtils/pluginTransactionUtils.ts#L163-L208)). Admin immediately executes the governed apply step; this is the normal [prepare/apply separation](../protocol-doc/framework/plugin-setup-processor.md#why-prepare-and-apply-are-separate) for the **new governance plugin**.
- **Its own removal uses the shared two-step uninstall.** The dedicated removal entry point opens the generic uninstallation flow: a direct `prepareUninstallation`, then a proposal through a selected full-execute process containing the standard temporary-ROOT/apply/revoke actions ([process selection](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/settings/dialogs/uninstallPluginAlertDialog/uninstallPluginAlertDialog.tsx#L61-L100), [prepare and publish](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/settings/dialogs/preparePluginUninstallationDialog/preparePluginUninstallationDialog.tsx#L60-L123), [shared apply action](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/pluginTransactionUtils/pluginTransactionUtils.ts#L210-L245)). The app forwards the permissions returned by preparation and adds no Admin-specific cleanup. Consequently, the former admins' `EXECUTE_PROPOSAL_PERMISSION_ID` grants remain as the [inert dangling state](../protocol-doc/plugins/admin-plugin.md#migrating-away) the setup contract leaves behind; the inspected uninstall UI neither removes nor calls out those grants.

## Surface area

The admin flow has its own product surface — an onboarding-dashboard state, a settings page for managing admins, a banner on that settings route, and removal of the admin plugin itself. The management controls are described in [Admin management](./admin-management.md).

## Onboarding dashboard

An individual account's dashboard switches into an onboarding state when its admin plugin is installed and no other visible [process](../governance/process.md) plugin is present. This replaces the ordinary onboarded-dashboard sections for that account.

The state adapts to the visitor:

- A connected wallet recognized as an admin sees a **Get in touch** button to the Aragon assistance form and a **Set up governance yourself** card. Its **Add governance** button opens the [governance designer](../governance/governance-designer.md); **View docs** is the secondary action. This admin branch also requires the effective `governanceDesigner` feature flag; otherwise, once membership status resolves, the dashboard uses the non-admin branch.
- A non-admin or disconnected visitor is told the account is still being set up and can open its admin-member list.

This is the release 1.24 **onboarding dashboard**: an active prompt away from the admin-only bootstrap. The release-notes term names this per-account state; the global [Explore page](./explore-page.md) and its discovery lists are unchanged.

## Intent: a transitional state

An account should not stay admin-run forever — that is part of why the admin plugin is installed at creation ([decision](./admin-plugin-by-default.md)). The expected path is to install real governance via the [governance designer](../governance/governance-designer.md) and then remove the admin plugin: removal means the bootstrap setup is complete. The dedicated Admin removal entry point is available only after another full-execute process exists; the subsequent generic dialog selects an eligible process to publish the removal proposal. The broader warn-but-don't-block rule for ordinary process removal remains documented separately in [removing the last process](./last-process-removal.md).
