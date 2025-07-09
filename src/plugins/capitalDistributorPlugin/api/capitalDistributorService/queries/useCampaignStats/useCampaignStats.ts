import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { capitalDistributorService } from '../../capitalDistributorService';
import type { IGetCampaignStatsParams } from '../../capitalDistributorService.api';
import { capitalDistributorServiceKeys } from '../../capitalDistributorServiceKeys';
import type { ICapitalDistributorStats } from '../../domain';

export const campaignStatsOptions = (
    params: IGetCampaignStatsParams,
    options?: QueryOptions<ICapitalDistributorStats>,
): SharedQueryOptions<ICapitalDistributorStats> => ({
    queryKey: capitalDistributorServiceKeys.campaignStats(params),
    queryFn: () => capitalDistributorService.getCampaignStats(params),
    ...options,
});

export const useCampaignStats = (params: IGetCampaignStatsParams, options?: QueryOptions<ICapitalDistributorStats>) => {
    return useQuery(campaignStatsOptions(params, options));
};
