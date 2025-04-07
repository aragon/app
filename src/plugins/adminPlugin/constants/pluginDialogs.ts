import { AdminManageMembersDialog } from '@/plugins/adminPlugin/dialogs/adminManageMembersDialog';
import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdminUninstallProcessDialogCreate } from '../components/adminUninstallPlugin/dialogs/adminUninstallProcessDialogCreate';
import { AdminUninstallProcessDialogSelect } from '../components/adminUninstallPlugin/dialogs/adminUninstallProcessDialogSelect';

export enum AdminPluginDialog {
    MANAGE_MEMBERS = 'MANAGE_MEMBERS',
    UNINSTALL_PROCESS_SELECT = 'UNINSTALL_PROCESS_SELECT',
    UNINSTALL_PROCESS_CREATE = 'UNINSTALL_PROCESS_CREATE',
}

export const adminPluginDialogs: Record<AdminPluginDialog, IDialogComponentDefinitions> = {
    [AdminPluginDialog.MANAGE_MEMBERS]: { Component: AdminManageMembersDialog },
    [AdminPluginDialog.UNINSTALL_PROCESS_SELECT]: {
        Component: AdminUninstallProcessDialogSelect,
        // hiddenDescription: 'app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.a11y.description',
        // variant: 'critical',
    },
    [AdminPluginDialog.UNINSTALL_PROCESS_CREATE]: {
        Component: AdminUninstallProcessDialogCreate,
        size: 'lg',
    },
};
