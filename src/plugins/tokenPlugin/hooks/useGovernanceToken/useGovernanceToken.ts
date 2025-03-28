import type { Hash } from 'viem';
import { useToken, type IUseTokenResult } from '../useToken';
import { useERC20VotingTokenCheck } from './useERC20VotingTokenCheck';

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
     * Error flag.
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

export const useGovernanceToken = (params: IUseGovernanceTokenParams): IUseGovernanceTokenResult => {
    const { isLoading: isTokenLoading, isError: isTokenError, token } = useToken(params);
    const {
        isLoading: areGovernanceChecksLoading,
        isGovernanceCompatible,
        isDelegationCompatible,
        isError,
    } = useERC20VotingTokenCheck(params, {
        enabled: token != null && !isTokenLoading,
    });

    const isLoading = isTokenLoading || areGovernanceChecksLoading;

    if (isLoading) {
        return {
            isLoading: true,
            isError: false,
            token: null,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
        };
    }

    return {
        isLoading: false,
        isError: isTokenError || isError,
        isGovernanceCompatible,
        isDelegationCompatible,
        token,
    };
};
