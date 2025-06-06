import type { IUseTokenParams, IUseTokenResult } from '../useToken';

export interface IUseGovernanceTokenParams extends IUseTokenParams {}

export interface IUseGovernanceTokenResultData {
    /**
     * Information about the token.
     */
    token: IUseTokenResult['data'];
    /**
     * Whether the token is governance compatible.
     */
    isGovernanceCompatible?: boolean;
    /**
     * Whether the token is delegation compatible.
     */
    isDelegationCompatible?: boolean;
}

export interface IUseGovernanceTokenResult {
    /**
     * Defines if an error occurred while fetching the token governance data.
     */
    isError: boolean;
    /**
     * Whether the token data and governance checks are loading.
     */
    isLoading: boolean;
    /**
     * Results of the token governance checks.
     */
    data: IUseGovernanceTokenResultData;
}
