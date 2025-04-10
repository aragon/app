import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdminManageMembersDialog } from '../dialogs/adminManageMembersDialog';
import { AdminUninstallProcessDialogCreate } from '../dialogs/adminUninstallProcessDialogCreate';
import { AdminPluginDialogId } from './adminPluginDialogId';

export const adminPluginDialogsDefinitions: Record<AdminPluginDialogId, IDialogComponentDefinitions> = {
    [AdminPluginDialogId.MANAGE_MEMBERS]: { Component: AdminManageMembersDialog },
    [AdminPluginDialogId.UNINSTALL_PROCESS_CREATE]: {
        Component: AdminUninstallProcessDialogCreate,
        size: 'lg',
    },
};
