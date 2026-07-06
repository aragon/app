import { useDao } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { resolveAdvancedGovernanceAvailability } from './advancedGovernanceAvailabilityUtils';
import type {
    IUseAdvancedGovernanceAvailabilityParams,
    IUseAdvancedGovernanceAvailabilityReturn,
} from './useAdvancedGovernanceAvailability.api';

export const useAdvancedGovernanceAvailability = (
    params: IUseAdvancedGovernanceAvailabilityParams,
): IUseAdvancedGovernanceAvailabilityReturn => {
    const { daoId } = params;

    const { isEnabled } = useFeatureFlags();
    const shouldGateAdvancedGovernance = isEnabled('gateAdvancedGovernance');

    const { data: dao, isLoading } = useDao(
        { urlParams: { id: daoId } },
        { enabled: shouldGateAdvancedGovernance },
    );

    if (!shouldGateAdvancedGovernance) {
        return { isAvailable: true, isLoading: false };
    }

    if (isLoading) {
        return { isAvailable: false, isLoading: true };
    }

    const isAvailable = resolveAdvancedGovernanceAvailability({
        daoBlockTimestamp: dao?.blockTimestamp,
        cutoffTimestamp:
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP,
    });

    return { isAvailable, isLoading: false };
};
