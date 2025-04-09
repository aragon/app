import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdminManageMembersDialog } from '../dialogs/adminManageMembersDialog';
import { AdminUninstallProcessDialogCreate } from '../dialogs/adminUninstallProcessDialogCreate';
import { AdminPluginDialog } from './adminPluginDialogId';

export const adminPluginDialogs: Record<AdminPluginDialog, IDialogComponentDefinitions> = {
    [AdminPluginDialog.MANAGE_MEMBERS]: { Component: AdminManageMembersDialog },
    [AdminPluginDialog.UNINSTALL_PROCESS_CREATE]: {
        Component: AdminUninstallProcessDialogCreate,
        size: 'lg',
    },
};
