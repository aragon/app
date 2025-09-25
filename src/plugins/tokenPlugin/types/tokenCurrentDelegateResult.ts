import type { Address } from 'viem';

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
