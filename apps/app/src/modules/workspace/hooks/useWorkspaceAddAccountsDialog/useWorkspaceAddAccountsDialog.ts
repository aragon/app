'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceAddAccountsDialogParams } from '../../dialogs/workspaceAddAccountsDialog';

/**
 * Opens the Add accounts dialog of a workspace, asking to connect a wallet first: the dialog requires one.
 * @returns A function opening the dialog.
 */
export const useWorkspaceAddAccountsDialog = (workspaceId: string) => {
    const { open } = useDialogContext();
    const { check } = useConnectedWalletGuard();

    return () => {
        const params: IWorkspaceAddAccountsDialogParams = { workspaceId };
        check({
            onSuccess: () => open(WorkspaceDialogId.ADD_ACCOUNTS, { params }),
        });
    };
};
