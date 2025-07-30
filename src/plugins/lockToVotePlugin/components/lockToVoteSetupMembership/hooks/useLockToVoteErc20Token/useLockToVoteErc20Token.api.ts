import type { IToken } from '@/modules/finance/api/financeService';
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

export interface IUseTokenResult {
    /**
     * Token data result.
     */
    data: Pick<IToken, 'decimals' | 'name' | 'symbol' | 'totalSupply'> | null;
    /**
     * Defines if an error occurred while fetching the token data.
     */
    isError: boolean;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}
