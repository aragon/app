import { useToken } from '../useToken';
import type { IUseGovernanceTokenParams, IUseGovernanceTokenResult } from './useGovernanceToken.api';
import { useGovernanceTokenDelegationCheck } from './useGovernanceTokenDelegationCheck';
import { useGovernanceTokenErc20Check } from './useGovernanceTokenErc20Check';
import { useGovernanceTokenVotesCheck } from './useGovernanceTokenVotesCheck';

export const useGovernanceToken = (params: IUseGovernanceTokenParams): IUseGovernanceTokenResult => {
    const { isLoading: isTokenLoading, isError: isTokenError, data: token } = useToken(params);

    const {
        data: isErc20Token,
        isLoading: isErc20CheckLoading,
        isError: isErc20CheckError,
    } = useGovernanceTokenErc20Check(params);

    const {
        data: isDelegationCompatible,
        isLoading: isDelegationCheckLoading,
        isError: isDelegationCheckError,
    } = useGovernanceTokenDelegationCheck({ ...params, enabled: isErc20Token });

    const {
        data: isGovernanceCompatible,
        isLoading: isVotesCheckLoading,
        isError: isVotesCheckError,
    } = useGovernanceTokenVotesCheck({ ...params, enabled: isErc20Token });

    const isLoading = isErc20CheckLoading || isDelegationCheckLoading || isVotesCheckLoading || isTokenLoading;
    const isError = isErc20CheckError || isDelegationCheckError || isVotesCheckError || isTokenError;

    const data = { token, isGovernanceCompatible, isDelegationCompatible };

    return { isLoading, isError, data };
};
