import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AdminPluginDialogId } from './adminPluginDialogId';

export const adminPluginDialogsDefinitions: Record<
    AdminPluginDialogId,
    IDialogComponentDefinitions
> = {
    [AdminPluginDialogId.MANAGE_MEMBERS]: {
        Component: dynamic(() =>
            import('../dialogs/adminManageMembersDialog').then(
                (m) => m.AdminManageMembersDialog,
            ),
        ),
        size: 'lg',
    },
};
