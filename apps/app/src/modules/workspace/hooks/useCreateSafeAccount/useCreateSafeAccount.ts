import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import type { ISafeCreateDialogParams } from '@/modules/safe/dialogs/safeCreateDialog';
import type { ISafeDeployedSafe } from '@/modules/safe/dialogs/safeDeployTransactionDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { IWorkspacePageParams } from '@/shared/types';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    type IWorkspaceAccount,
    useAddWorkspaceAccount,
    WorkspaceAccountType,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IUseCreateSafeAccountReturn {
    /**
     * Opens the create Safe flow, asking to connect a wallet first when none is connected.
     */
    createSafe: () => void;
}

/**
 * Creates a Safe from a page of a stored workspace and adds it to that workspace once it is deployed.
 */
export const useCreateSafeAccount = (): IUseCreateSafeAccountReturn => {
    const { workspaceId } =
        useParams<Pick<IWorkspacePageParams, 'workspaceId'>>();
    const queryClient = useQueryClient();
    const { open } = useDialogContext();
    const { check: checkWalletConnected } = useConnectedWalletGuard();
    const { mutate: addWorkspaceAccount } = useAddWorkspaceAccount();

    const handleSafeCreated = (safe: ISafeDeployedSafe) => {
        const { network, address, name } = safe;
        const account: IWorkspaceAccount = {
            id: workspaceUtils.buildAccountId({ address, network }),
            type: WorkspaceAccountType.SAFE,
            address,
            network,
            metadata: name == null ? undefined : { name },
        };

        addWorkspaceAccount(
            { urlParams: { id: workspaceId }, body: { account } },
            {
                onSuccess: () =>
                    Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: workspaceServiceKeys.workspaceList(),
                        }),
                        queryClient.invalidateQueries({
                            queryKey: workspaceServiceKeys.workspace({
                                urlParams: { id: workspaceId },
                            }),
                        }),
                    ]),
                onError: (error) =>
                    monitoringUtils.logError(error, {
                        context: { workspaceId, network, address },
                    }),
            },
        );
    };

    const createSafe = () => {
        const dialogParams: ISafeCreateDialogParams = {
            onCreated: handleSafeCreated,
        };

        checkWalletConnected({
            onSuccess: () =>
                open(SafeDialogId.CREATE, { params: dialogParams }),
        });
    };

    return { createSafe };
};
