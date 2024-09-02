import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
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
    const { chainId } = useAccount();

    const { chainId: requestedChainId } = networkDefinitions[network];
    const isCorretNetwork = chainId === requestedChainId;

    const handleWalletConnectionSuccess = useCallback(() => {
        const dialogParams = { onSuccess, onError, network };
        open(ApplicationDialog.CHANGE_NETWORK, { params: dialogParams });
    }, [onSuccess, onError, network, open]);

    const { check: checkWalletConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: handleWalletConnectionSuccess,
    });

    return { check: checkWalletConnected, result: isCorretNetwork };
};
