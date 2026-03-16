'use client';

import { useCallback } from 'react';
import { zeroAddress } from 'viem';
import { useConnection } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import { useTokenCurrentDelegate } from '../useTokenCurrentDelegate';

export interface IUseOpenDelegationOnboardingIfNeededParams {
    /**
     * Address of the governance token (not the underlying token!).
     */
    tokenAddress: string;
    /**
     * Symbol of the governance token.
     */
    tokenSymbol: string;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface IUseOpenDelegationOnboardingIfNeededResult {
    /**
     * Stable function that opens the delegation onboarding dialog if the user
     * has not delegated yet. Safe to call from event callbacks.
     */
    openIfNeeded: () => void;
}

export const useOpenDelegationOnboardingIfNeeded = (
    params: IUseOpenDelegationOnboardingIfNeededParams,
): IUseOpenDelegationOnboardingIfNeededResult => {
    const { tokenAddress, tokenSymbol, network, daoId } = params;

    const { open } = useDialogContext();
    const { address } = useConnection();

    const {
        data: delegate,
        isLoading: isDelegateLoading,
        isError: isDelegateError,
    } = useTokenCurrentDelegate({
        tokenAddress,
        userAddress: address,
        network,
        enabled: address != null,
    });

    const openIfNeeded = useCallback(() => {
        if (isDelegateLoading || isDelegateError) {
            return;
        }

        if (delegate === zeroAddress) {
            open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
                params: { tokenAddress, tokenSymbol, daoId },
            });
        }
    }, [
        delegate,
        isDelegateLoading,
        isDelegateError,
        open,
        tokenAddress,
        tokenSymbol,
        daoId,
    ]);

    return { openIfNeeded };
};
