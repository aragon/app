import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { erc20DelegatesAbi } from './erc20DelegatesAbi';
import type { IUseTokenCurrentDelegateParams, IUseTokenCurrentDelegateResult } from './useTokenCurrentDelegate.api';

export const useTokenCurrentDelegate = (params: IUseTokenCurrentDelegateParams): IUseTokenCurrentDelegateResult => {
    const { tokenAddress, userAddress, network, enabled = true } = params;

    const { id: chainId } = networkDefinitions[network];

    const { data, isLoading, isError } = useReadContract({
        abi: erc20DelegatesAbi,
        address: tokenAddress as Hex,
        functionName: 'delegates',
        args: [userAddress as Hex],
        query: {
            enabled: enabled && tokenAddress != null && userAddress != null,
        },
        chainId,
    });

    return {
        data,
        isLoading,
        isError,
    };
};
