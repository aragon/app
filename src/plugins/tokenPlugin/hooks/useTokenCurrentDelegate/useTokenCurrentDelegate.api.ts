import type { Address } from 'viem';
import type { Network } from '@/shared/api/daoService';

export interface IUseTokenCurrentDelegateResult {
    /**
     * The current delegate address.
     */
    data?: Address;
    /**
     * Whether the query is loading.
     */
    isLoading: boolean;
    /**
     * Defines if an error occurred while fetching the current delegate.
     */
    isError: boolean;
}

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
