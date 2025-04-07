import { AdminManageMembersDialog } from '@/plugins/adminPlugin/dialogs/adminManageMembersDialog';
import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';

export enum AdminPluginDialog {
    MANAGE_MEMBERS = 'MANAGE_MEMBERS',
}

export const adminPluginDialogs: Record<AdminPluginDialog, IDialogComponentDefinitions> = {
    [AdminPluginDialog.MANAGE_MEMBERS]: { Component: AdminManageMembersDialog },
};
