import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { efpService } from '../../efpService';
import type { EfpStats, IGetEfpStatsParams } from '../../efpService.api';
import { efpServiceKeys } from '../../efpServiceKeys';

export const efpOptions = (
    params: IGetEfpStatsParams,
    options?: QueryOptions<EfpStats>,
): SharedQueryOptions<EfpStats> => ({
    queryKey: efpServiceKeys.stats(params),
    queryFn: () => efpService.getStats(params),
    ...options,
});

export const useEfpStats = (params: IGetEfpStatsParams, options?: QueryOptions<EfpStats>) => {
    return useQuery(efpOptions(params, options));
};
