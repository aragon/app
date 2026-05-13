import type { Hex } from 'viem';

export interface IUseTokenTotalSupplyParams {
    /**
     * Address of the token contract.
     */
    address: Hex;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
    /**
     * Flag to enable or disable the query.
     * @default true
     */
    enabled?: boolean;
}

export interface IUseTokenTotalSupplyResult {
    /**
     * Total supply of the token.
     */
    data: bigint | undefined;
    /**
     * Human-readable error message when the total supply fetch fails, otherwise undefined.
     */
    error: string | undefined;
    /**
     * Defines if an error occurred while fetching the total supply.
     */
    isError: boolean;
    /**
     * Whether the total supply is loading.
     */
    isLoading: boolean;
}
