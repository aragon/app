import { useDao } from '@/shared/api/daoService';
import { useDebugContext } from '@/shared/components/debugProvider/debugProvider';
import { getEnvironment } from '@/shared/featureFlags/utils/getEnvironment';
import { resolveAdvancedGovernanceAvailability } from './advancedGovernanceAvailabilityUtils';
import type {
    IUseAdvancedGovernanceAvailabilityParams,
    IUseAdvancedGovernanceAvailabilityReturn,
} from './useAdvancedGovernanceAvailability.api';

export const useAdvancedGovernanceAvailability = (
    params: IUseAdvancedGovernanceAvailabilityParams,
): IUseAdvancedGovernanceAvailabilityReturn => {
    const { daoId } = params;

    const environment = getEnvironment();
    const { values } = useDebugContext();
    const isGateOverride = values['gateAdvancedGovernance'] === true;
    const isNonProd = environment !== 'production';
    const shouldBypassGating = isNonProd && !isGateOverride;

    const { data: dao, isLoading } = useDao(
        { urlParams: { id: daoId } },
        { enabled: !shouldBypassGating },
    );

    if (shouldBypassGating) {
        return { isAvailable: true, isLoading: false };
    }

    if (isLoading) {
        return { isAvailable: false, isLoading: true };
    }

    const isAvailable = resolveAdvancedGovernanceAvailability({
        environment: isGateOverride ? 'production' : environment,
        daoBlockTimestamp: dao?.blockTimestamp,
        cutoffTimestamp:
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP,
    });

    return { isAvailable, isLoading: false };
};
