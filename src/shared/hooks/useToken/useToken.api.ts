import type { Hex } from 'viem';

export interface IUseTokenParams {
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

export interface IUseTokenResultToken {
    /**
     * Decimals of the token.
     */
    decimals: number;
    /**
     * Name of the token.
     */
    name: string;
    /**
     * Symbol of the token.
     */
    symbol: string;
    /**
     * Total supply of the token.
     */
    totalSupply: string | null;
}

export interface IUseTokenResult {
    /**
     * Token data result.
     */
    data: IUseTokenResultToken | null;
    /**
     * Defines if an error occurred while fetching the token data.
     */
    isError: boolean;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}
