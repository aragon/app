interface IResolveAdvancedAvailabilityParams {
    daoBlockTimestamp: number | undefined;
    cutoffTimestamp: string | undefined;
}

/**
 * Pure resolver for advanced governance availability.
 * Available when the DAO was created before the configured cutoff timestamp.
 * Fails safe to unavailable when data is missing or invalid.
 */
export const resolveAdvancedGovernanceAvailability = (
    params: IResolveAdvancedAvailabilityParams,
): boolean => {
    const { daoBlockTimestamp, cutoffTimestamp } = params;

    if (daoBlockTimestamp == null) {
        return false;
    }

    const cutoff = Number(cutoffTimestamp);

    if (!cutoffTimestamp || Number.isNaN(cutoff) || cutoff <= 0) {
        return false;
    }

    return daoBlockTimestamp < cutoff;
};
