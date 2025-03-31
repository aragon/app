import type { IUseTokenParams, IUseTokenResult } from '@/plugins/tokenPlugin/hooks/useToken';

export interface IUseGovernanceTokenParams extends IUseTokenParams {}

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
    isGovernanceCompatible?: boolean;
    /**
     * Whether the token is delegation compatible.
     */
    isDelegationCompatible?: boolean;
}
