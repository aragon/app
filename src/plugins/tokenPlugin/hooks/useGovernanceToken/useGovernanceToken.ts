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

    return {
        isLoading: isTokenLoading || areGovernanceChecksLoading,
        isError: isTokenError || isError,
        token,
        isGovernanceCompatible,
        isDelegationCompatible,
    };
};
