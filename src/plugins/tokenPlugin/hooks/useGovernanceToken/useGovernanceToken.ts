import { useToken } from '../useToken';
import { useERC20VotingTokenCheck } from './useERC20VotingTokenCheck';
import type { IUseGovernanceTokenParams, IUseGovernanceTokenResult } from './useGovernanceToken.api';

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
