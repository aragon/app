import type { FeatureFlagEnvironment } from '@/shared/featureFlags/featureFlags.api';

interface IResolveAdvancedAvailabilityParams {
    environment: FeatureFlagEnvironment;
    daoBlockTimestamp: number | undefined;
    cutoffTimestamp: string | undefined;
}

/**
 * Pure resolver for advanced governance availability.
 * Available if: non-production environment OR (production AND DAO created before cutoff).
 * Fails safe to unavailable in production when data is missing or invalid.
 */
export const resolveAdvancedGovernanceAvailability = (
    params: IResolveAdvancedAvailabilityParams,
): boolean => {
    const { environment, daoBlockTimestamp, cutoffTimestamp } = params;

    if (environment !== 'production') {
        return true;
    }

    if (daoBlockTimestamp == null) {
        return false;
    }

    const cutoff = Number(cutoffTimestamp);

    if (!cutoffTimestamp || Number.isNaN(cutoff) || cutoff <= 0) {
        return false;
    }

    return daoBlockTimestamp < cutoff;
};
