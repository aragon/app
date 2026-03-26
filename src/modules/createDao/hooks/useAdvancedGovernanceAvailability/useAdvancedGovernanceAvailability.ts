import { useDao } from '@/shared/api/daoService';
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
    const isNonProd = environment !== 'production';

    const { data: dao, isLoading } = useDao(
        { urlParams: { id: daoId } },
        { enabled: !isNonProd },
    );

    if (isNonProd) {
        return { isAvailable: true, isLoading: false };
    }

    if (isLoading) {
        return { isAvailable: false, isLoading: true };
    }

    const isAvailable = resolveAdvancedGovernanceAvailability({
        environment,
        daoBlockTimestamp: dao?.blockTimestamp,
        cutoffTimestamp:
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP,
    });

    return { isAvailable, isLoading: false };
};
