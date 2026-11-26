'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceCreateAccountDialogParams } from '../../dialogs/workspaceCreateAccountDialog';

export interface IUseWorkspaceCreateAccountDialogOptions {
    /**
     * Opens the dialog on top of the current one instead of replacing it.
     */
    stack?: boolean;
}

/**
 * Opens the Create account dialog, asking to connect a wallet first: the dialog requires one.
 * @returns A function opening the dialog.
 */
export const useWorkspaceCreateAccountDialog = () => {
    const { open } = useDialogContext();
    const { check } = useConnectedWalletGuard();

    return (
        params: IWorkspaceCreateAccountDialogParams,
        options?: IUseWorkspaceCreateAccountDialogOptions,
    ) =>
        check({
            onSuccess: () =>
                open(WorkspaceDialogId.CREATE_ACCOUNT, {
                    params,
                    stack: options?.stack,
                }),
        });
};
