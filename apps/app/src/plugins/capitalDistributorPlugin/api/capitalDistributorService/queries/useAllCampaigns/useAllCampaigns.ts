'use client';

import { useEffect, useMemo } from 'react';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions } from '@/shared/types/queryOptions';
import type { IGetCampaignListParams } from '../../capitalDistributorService.api';
import type { ICampaign } from '../../domain';
import { useCampaignList } from '../useCampaignList';

export interface IUseAllCampaignsParams {
    /**
     * Parameters for fetching campaign list.
     */
    campaignListParams: IGetCampaignListParams;
    /**
     * Optional query options.
     */
    options?: InfiniteQueryOptions<
        IPaginatedResponse<ICampaign>,
        IGetCampaignListParams
    >;
}

/**
 * Hook that fetches all campaigns by automatically loading all pages.
 * Unlike useCampaignList which is paginated, this hook returns all campaigns at once.
 */
export const useAllCampaigns = (params: IUseAllCampaignsParams) => {
    const { campaignListParams, options } = params;

    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useCampaignList(
        {
            ...campaignListParams,
            queryParams: { ...campaignListParams.queryParams, pageSize: 50 },
        },
        options,
    );

    // Automatically fetch all pages
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    // Flatten all pages into a single array
    const allCampaigns = useMemo(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data],
    );

    return {
        data: allCampaigns,
        isLoading,
        error,
        refetch,
    };
};
