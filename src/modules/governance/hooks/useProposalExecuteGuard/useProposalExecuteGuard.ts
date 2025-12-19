import { useCallback } from 'react';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useConnectedWalletGuard } from '../../../application/hooks/useConnectedWalletGuard';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IExecuteCheckDialogParams } from '../../dialogs/executeCheckDialog';

export interface IUseProposalExecuteGuardParams {
    /**
     * ID of the DAO to check permissions on.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal.
     */
    pluginAddress: string;
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
}

export const useProposalExecuteGuard = (
    params: IUseProposalExecuteGuardParams,
) => {
    const { daoId, pluginAddress, onSuccess, onError } = params;

    const { open } = useDialogContext();
    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const checkUserPermission = useCallback(
        (functionParams?: Partial<IUseProposalExecuteGuardParams>) => {
            if (!dao) {
                return;
            }

            const dialogParams: IExecuteCheckDialogParams = {
                dao,
                plugin,
                onSuccess,
                onError,
                ...functionParams,
            };
            open(GovernanceDialogId.EXECUTE_CHECK, { params: dialogParams });
        },
        [dao, onError, onSuccess, open, plugin],
    );

    const { check: checkWalletConnected, result: isConnected } =
        useConnectedWalletGuard({
            onError,
            onSuccess: checkUserPermission,
        });

    const check = useCallback(
        (functionParams?: Partial<IUseProposalExecuteGuardParams>) => {
            if (isConnected) {
                // Skip wallet-connection check if user is already connected
                checkUserPermission(functionParams);
            } else {
                // Make sure to forward custom checkFunction params to check-permission
                checkWalletConnected({
                    onError: functionParams?.onError ?? params.onError,
                    onSuccess: () => checkUserPermission(functionParams),
                });
            }
        },
        [
            isConnected,
            params.onError,
            checkUserPermission,
            checkWalletConnected,
        ],
    );

    return { check };
};
