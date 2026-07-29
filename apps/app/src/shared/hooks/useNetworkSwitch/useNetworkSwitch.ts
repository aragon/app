import { useCallback } from 'react';
import { useSwitchChain } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IUseNetworkSwitchParams,
    IUseNetworkSwitchReturn,
} from './useNetworkSwitch.api';

export const useNetworkSwitch = (
    params: IUseNetworkSwitchParams,
): IUseNetworkSwitchReturn => {
    const { network } = params;

    const { mutate: switchChain, status: switchChainStatus } = useSwitchChain();
    const { chainId: walletChainId } = useWalletAccount();

    const { id: requiredChainId, name: networkName } =
        networkDefinitions[network];

    const isCrossNetworkTransaction =
        walletChainId != null && walletChainId !== requiredChainId;

    const withNetworkSwitch = useCallback(
        (onSend: () => void) => {
            if (isCrossNetworkTransaction) {
                switchChain(
                    { chainId: requiredChainId },
                    { onSuccess: onSend },
                );
            } else {
                onSend();
            }
        },
        [switchChain, requiredChainId, isCrossNetworkTransaction],
    );

    return {
        requiredChainId,
        isCrossNetworkTransaction,
        networkName,
        switchChainStatus,
        withNetworkSwitch,
    };
};
