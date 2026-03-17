import type { Network } from '@/shared/api/daoService';

export interface IUseTokenLockAndWrapOnboardingCheckParams {
    /**
     * Address of the governance token (getVotes checked here).
     */
    governanceTokenAddress?: string;
    /**
     * Address of the underlying token (balanceOf checked here).
     */
    underlyingTokenAddress?: string;
    /**
     * Address of the connected user.
     */
    userAddress?: string;
    /**
     * Network of the token contracts.
     */
    network: Network;
    /**
     * Whether the query should be enabled.
     */
    enabled?: boolean;
}

export interface IUseTokenLockAndWrapOnboardingCheckResult {
    /**
     * Whether the onboarding dialog should be triggered.
     * True when the user has zero voting power but holds the underlying token.
     */
    shouldTrigger: boolean;
    /**
     * Whether the check is still loading.
     */
    isLoading: boolean;
}
