import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { IUseTokenCurrentDelegateResult } from '../../types';
import { erc20DelegatesAbi } from './erc20DelegatesAbi';

export interface IUseTokenCurrentDelegateParams {
    /**
     * The ERC20 token address to check delegation for.
     */
    tokenAddress?: string;
    /**
     * The address to check delegation for.
     */
    userAddress?: string;
    /**
     * The network to make the call on.
     */
    network: Network;
    /**
     * Whether the query should be enabled.
     */
    enabled?: boolean;
}

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
        currentDelegate: (data as string) || null,
        isLoading,
        isError,
    };
};
