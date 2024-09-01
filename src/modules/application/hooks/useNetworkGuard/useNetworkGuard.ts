import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCallback } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { getAccount } from 'wagmi/actions';
import { ApplicationDialog } from '../../constants/moduleDialogs';
import { type IUseConnectedWalletGuardParams, useConnectedWalletGuard } from '../useConnectedWalletGuard';

export interface IUseNetworkGuardParams extends IUseConnectedWalletGuardParams {
    /**
     * Requested network.
     */
    network: Network;
}

export const useNetworkGuard = (params: IUseNetworkGuardParams) => {
    const { onSuccess, onError, network } = params;

    const { open } = useDialogContext();
    const config = useConfig();
    const { chainId } = useAccount();

    const { chainId: requestedChainId } = networkDefinitions[network];
    const isCorretNetwork = chainId === requestedChainId;

    const handleConnectedWalletSuccess = useCallback(() => {
        // Retrieve chainId on connection success callback to compare the requested chainId with the updated value on
        // Wagmi store after the user is connected.
        const { chainId: currentChainId } = getAccount(config);

        if (currentChainId === requestedChainId) {
            onSuccess?.();
            return;
        }

        const dialogParams = { onSuccess, onError, network };
        open(ApplicationDialog.CHANGE_NETWORK, { params: dialogParams });
    }, [config, onSuccess, onError, network, open, requestedChainId]);

    const { check: checkWalletConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: handleConnectedWalletSuccess,
    });

    return { check: checkWalletConnected, result: isCorretNetwork };
};
