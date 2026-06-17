import { useCallback } from 'react';
import { useSwitchChain } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type {
    IUseNetworkSwitchParams,
    IUseNetworkSwitchReturn,
} from './useNetworkSwitch.api';

export const useNetworkSwitch = (
    params: IUseNetworkSwitchParams,
): IUseNetworkSwitchReturn => {
    const { mutate: switchChain, status: switchChainStatus } = useSwitchChain();
    const { chainId: walletChainId } = useWalletAccount();
    const {
        chainId: requiredChainId,
        networkDefinition,
        isLoading,
    } = useDaoChain(params);

    const isCrossNetworkTransaction =
        walletChainId != null &&
        requiredChainId != null &&
        walletChainId !== requiredChainId;

    const networkName = networkDefinition?.name;

    const withNetworkSwitch = useCallback(
        (onSend: () => void) => {
            if (isCrossNetworkTransaction && requiredChainId != null) {
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
        isLoading,
    };
};
