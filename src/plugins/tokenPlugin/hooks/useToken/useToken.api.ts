import type { IToken } from '@/modules/finance/api/financeService';
import type { Hash } from 'viem';

export interface IUseTokenParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
}

export interface IUseTokenResult {
    /**
     * Token data result.
     */
    token: Pick<IToken, 'decimals' | 'name' | 'symbol' | 'totalSupply'> | null;
    /**
     * Defines if an error occurred while fetching the token data.
     */
    isError: boolean;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}
