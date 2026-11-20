'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
    type IWorkspaceAccount,
    useAddWorkspaceAccount,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

/**
 * Adds an account to a workspace, then opens its overview.
 * @returns A function adding and opening the account.
 */
export const useAddWorkspaceAccountAndOpen = (workspaceId: string) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutateAsync: addWorkspaceAccount } = useAddWorkspaceAccount();

    return async (account: IWorkspaceAccount) => {
        await addWorkspaceAccount({
            urlParams: { id: workspaceId },
            body: { account },
        });
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id: workspaceId },
                }),
            }),
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspaceList(),
            }),
        ]);
        router.push(
            workspaceUtils.getAccountScopeUrl(
                workspaceId,
                account.id,
                'overview',
            ),
        );
    };
};
