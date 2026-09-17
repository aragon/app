---
type: capability
title: Admin management
tags: [accounts, admin, governance, settings]
status: draft
source: aragon-knowledge-base/product/capabilities/admin-management.md (first-slice brain dump + product-owner Q&A, 2026-07-06) + product-owner release-notes briefing (2026-08-03; release 1.0.0) + app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Admin management

What the app lets you do while the admin plugin is installed — the capability side of the [admin flow](./admin-flow.md). **User promise:** while the account is admin-run, directly manage who the admins are — and leave the admin flow when ready.

## Business logic

- While Admin is installed, the settings page renders a dedicated panel with governance information, **Manage admins**, and **Remove Admin** controls ([settings panel](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/components/adminSettingsPanel/adminSettingsPanel.tsx#L17-L37)). The panel is keyed to the installed plugin and visible to non-admin visitors too; actions apply their own guards.
- The banner appears only on the settings page. An admin member with the governance designer enabled is told to set up governance and gets an **Add governance** action. Otherwise, an installed Admin plugin produces the non-admin state and a **View Admins** link; that fallback also applies when the feature flag is disabled ([banner branches](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/application/components/bannerDao/bannerDao.tsx#L48-L85)).
- **Manage admins** runs the Admin proposal-creation guard and opens a dedicated dialog. Submitting it diffs the member list and builds grants and revocations of `EXECUTE_PROPOSAL_PERMISSION` ([action guard](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/components/adminSettingsPanel/components/adminManageMembers/adminManageMembers.tsx#L26-L55), [permission changes](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/dialogs/adminManageMembersDialog/adminManageMembersDialogUtils.ts#L16-L61)). The form does not allow an empty list, so this UI cannot remove every admin.
- Admin actions go through [proposals](../governance/proposal.md) that execute instantly in a single submitted transaction. The proposal shape is retained for common history and presentation, even though there is no voting or later execution step.
- **Remove Admin** means leaving the bootstrap once another full-execute process exists. That existence check opens the generic two-step uninstall; otherwise the control opens the governance-required dialog instead ([removal guard](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/adminPlugin/components/adminSettingsPanel/components/adminUninstallPlugin/adminUninstallPlugin.tsx#L18-L62)). The generic dialog then asks the user to select an eligible full-execute process for the proposal; the existence check does not itself prove that the other process will be selected.

## Removal boundary

The dedicated Admin path is stricter than the general [last-process removal](./last-process-removal.md) rule: its entry point requires another full-execute [process](../governance/process.md) to exist, treating Admin removal as completion of governance setup. Once permitted, removal uses the common plugin-uninstallation machinery described in the [Admin catalogue](./admin-flow.md#where-admin-matches). The source also mentions a critical alert after removal but does not identify its message or trigger, so no alert is documented here.
