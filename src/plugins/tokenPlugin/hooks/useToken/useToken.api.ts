import type { IToken } from '@/modules/finance/api/financeService';
import type { Hash } from 'viem';
import type { ReadContractsErrorType } from 'wagmi/actions';

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

export interface IUseTokenReturn extends Pick<IToken, 'decimals' | 'name' | 'symbol' | 'totalSupply'> {}

export interface IUseTokenResult {
    /**
     * Token data result.
     */
    token: IUseTokenReturn | null;
    /**
     * Possible error result.
     */
    error: ReadContractsErrorType | null;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}
