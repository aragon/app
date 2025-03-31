import type { IUseTokenResult } from '@/plugins/tokenPlugin/hooks/useToken';
import type { Hash } from 'viem';

export interface IUseGovernanceTokenParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
}

export interface IUseGovernanceTokenResult {
    /**
     * Token data result.
     */
    token: IUseTokenResult['token'];
    /**
     * Defines if an error occurred while fetching the token governance data.
     */
    isError: boolean;
    /**
     * Whether the token data and governance checks are loading.
     */
    isLoading: boolean;
    /**
     * Whether the token is governance compatible.
     */
    isGovernanceCompatible: boolean;
    /**
     * Whether the token is delegation compatible.
     */
    isDelegationCompatible: boolean;
}
