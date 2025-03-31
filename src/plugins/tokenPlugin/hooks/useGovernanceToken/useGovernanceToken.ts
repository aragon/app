import { useToken } from '../useToken';
import { useERC20VotesTokenCheck } from './useERC20VotesTokenCheck';
import type { IUseGovernanceTokenParams, IUseGovernanceTokenResult } from './useGovernanceToken.api';

export const useGovernanceToken = (params: IUseGovernanceTokenParams): IUseGovernanceTokenResult => {
    const { isLoading: isTokenLoading, isError: isTokenError, token } = useToken(params);
    const {
        isLoading: areGovernanceChecksLoading,
        isGovernanceCompatible,
        isDelegationCompatible,
        isError,
    } = useERC20VotesTokenCheck({
        ...params,
        query: {
            enabled: token != null,
        },
    });

    const isLoading = isTokenLoading || areGovernanceChecksLoading;

    return {
        isLoading,
        isError: isLoading ? false : isTokenError || isError,
        token: isLoading ? null : token,
        isGovernanceCompatible: isLoading ? false : isGovernanceCompatible,
        isDelegationCompatible: isLoading ? false : isDelegationCompatible,
    };
};
