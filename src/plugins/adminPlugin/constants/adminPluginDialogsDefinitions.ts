import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdminManageMembersDialog } from '../dialogs/adminManageMembersDialog';
import { AdminPluginDialogId } from './adminPluginDialogId';

export const adminPluginDialogsDefinitions: Record<AdminPluginDialogId, IDialogComponentDefinitions> = {
    [AdminPluginDialogId.MANAGE_MEMBERS]: { Component: AdminManageMembersDialog, size: 'lg' },
};
