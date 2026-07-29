import type { Network } from '@/shared/api/daoService';

export interface IUseTokenDelegationOnboardingCheckParams {
    /**
     * Address of the governance token.
     */
    tokenAddress?: string;
    /**
     * Address of the connected user.
     */
    userAddress?: string;
    /**
     * Network of the token contract.
     */
    network: Network;
    /**
     * Whether the query should be enabled.
     */
    enabled?: boolean;
}

export interface IUseTokenDelegationOnboardingCheckResult {
    /**
     * Whether the onboarding dialog should be triggered.
     * True when the user has a token balance but has not delegated.
     */
    shouldTrigger: boolean;
    /**
     * Whether the check is still loading.
     */
    isLoading: boolean;
}
