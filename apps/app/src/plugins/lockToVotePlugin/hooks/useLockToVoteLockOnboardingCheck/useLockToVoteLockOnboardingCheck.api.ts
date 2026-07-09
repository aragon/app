import type { Network } from '@/shared/api/daoService';

export interface IUseLockToVoteLockOnboardingCheckParams {
    /**
     * Address of the lock manager contract (getLockedBalance checked here).
     */
    lockManagerAddress?: string;
    /**
     * Address of the governance token (balanceOf checked here).
     */
    tokenAddress?: string;
    /**
     * Address of the connected user.
     */
    userAddress?: string;
    /**
     * Network of the contracts.
     */
    network: Network;
    /**
     * Whether the query should be enabled.
     */
    enabled?: boolean;
}

export interface IUseLockToVoteLockOnboardingCheckResult {
    /**
     * Whether the onboarding dialog should be triggered.
     * True when the user has zero locked balance but holds the governance token.
     */
    shouldTrigger: boolean;
    /**
     * Whether the check is still loading.
     */
    isLoading: boolean;
}
