import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { efpService } from '../../efpService';
import type { IGetEfpStatsParams } from '../../efpService.api';
import { efpServiceKeys } from '../../efpServiceKeys';
import type { IEfpStats } from '../../domain';

export const efpOptions = (params: IGetEfpStatsParams, options?: QueryOptions<IEfpStats>): SharedQueryOptions<IEfpStats> => ({
    queryKey: efpServiceKeys.stats(params),
    queryFn: () => efpService.getStats(params),
    ...options,
});

export const useEfpStats = (params: IGetEfpStatsParams, options?: QueryOptions<IEfpStats>) => {
    return useQuery(efpOptions(params, options));
};
