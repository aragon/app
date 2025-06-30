import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types/queryOptions';
import { useInfiniteQuery } from '@tanstack/react-query';
import { capitalDistributorService } from '../../capitalDistributorService';
import { type IGetCampaignsListParams } from '../../capitalDistributorService.api';
import { capitalDistributorServiceKeys } from '../../capitalDistributorServiceKeys';
import { type ICampaign } from '../../domain';

export const campaignListOptions = (
    params: IGetCampaignsListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ICampaign>, IGetCampaignsListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<ICampaign>, IGetCampaignsListParams> => ({
    queryKey: capitalDistributorServiceKeys.campaigns(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => capitalDistributorService.getCampaignsList(pageParam),
    getNextPageParam: capitalDistributorService.getNextPageParams,
    ...options,
});

export const useCampaignList = (
    params: IGetCampaignsListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ICampaign>, IGetCampaignsListParams>,
) => {
    return useInfiniteQuery(campaignListOptions(params, options));
};
