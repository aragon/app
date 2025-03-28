import { useToken } from '@/plugins/tokenPlugin/hooks/useToken';
import { IUseTokenResult } from '@/plugins/tokenPlugin/hooks/useToken/useToken';
import type { Hash } from 'viem';
import type { ReadContractsErrorType } from 'wagmi/actions';
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
     * Possible error result.
     */
    error: ReadContractsErrorType | null;
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

/**
 * Just an internal hook, not to be used outside useGovernanceToken.
 */
export const useGovernanceToken = (params: IUseGovernanceTokenParams): IUseGovernanceTokenResult => {
    const { isLoading: isTokenLoading, error: tokenError, token } = useToken(params);
    const {
        isLoading: areGovernanceChecksLoading,
        isGovernanceCompatible,
        isDelegationCompatible,
        error,
    } = useERC20VotingTokenCheck(params, {
        enabled: token != null && !isTokenLoading,
    });

    const isLoading = isTokenLoading || areGovernanceChecksLoading;

    if (isLoading) {
        return {
            isLoading: true,
            error: null,
            token: null,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
        };
    }

    return {
        isLoading: false,
        error: tokenError ?? error,
        isGovernanceCompatible,
        isDelegationCompatible,
        token: token,
    };
};
