import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types/queryOptions';
import { capitalDistributorService } from '../../capitalDistributorService';
import type { IGetCampaignListParams } from '../../capitalDistributorService.api';
import { capitalDistributorServiceKeys } from '../../capitalDistributorServiceKeys';
import type { ICampaign } from '../../domain';

export const campaignListOptions = (
    params: IGetCampaignListParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<ICampaign>,
        IGetCampaignListParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<ICampaign>,
    IGetCampaignListParams
> => ({
    queryKey: capitalDistributorServiceKeys.campaigns(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        capitalDistributorService.getCampaignList(pageParam),
    getNextPageParam: capitalDistributorService.getNextPageParams,
    ...options,
});

export const useCampaignList = (
    params: IGetCampaignListParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<ICampaign>,
        IGetCampaignListParams
    >,
) => useInfiniteQuery(campaignListOptions(params, options));
