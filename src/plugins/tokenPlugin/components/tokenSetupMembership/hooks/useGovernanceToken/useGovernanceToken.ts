import { type IUseTokenResult, useToken } from '@/shared/hooks/useToken';
import type { IUseGovernanceTokenParams, IUseGovernanceTokenResult } from './useGovernanceToken.api';
import { useGovernanceTokenDelegationCheck } from './useGovernanceTokenDelegationCheck';
import { useGovernanceTokenErc20Check } from './useGovernanceTokenErc20Check';
import { useGovernanceTokenVotesCheck } from './useGovernanceTokenVotesCheck';

// Fallback to "unknown" token when token passes the ERC20 checks but has no valid token attributes
const tokenFallback: IUseTokenResult['data'] = { name: 'Unknown', decimals: 18, symbol: 'UNKNOWN', totalSupply: '0' };

export const useGovernanceToken = (params: IUseGovernanceTokenParams): IUseGovernanceTokenResult => {
    const { isLoading: isTokenLoading, data: tokenResult } = useToken(params);

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

    const token = isErc20Token ? (tokenResult ?? tokenFallback) : null;

    // Set fallback name and symbol in the case it's null or ""
    if (token) {
        token.name = token.name || tokenFallback.name;
        token.symbol = token.symbol || tokenFallback.symbol;
    }

    const isLoading = isErc20CheckLoading || isDelegationCheckLoading || isVotesCheckLoading || isTokenLoading;
    const isError = isErc20CheckError || isDelegationCheckError || isVotesCheckError;

    const data = { token, isGovernanceCompatible, isDelegationCompatible };

    return { isLoading, isError, data };
};
