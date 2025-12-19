'use client';

import type { IGauge, IGetGaugeListParams } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useGaugeList } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/queries/useGaugeList';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions } from '@/shared/types/queryOptions';
import { useEffect, useMemo } from 'react';

export interface IUseAllGaugesParams {
    /**
     * Parameters for fetching gauge list.
     */
    gaugeListParams: IGetGaugeListParams;
    /**
     * Optional query options.
     */
    options?: InfiniteQueryOptions<IPaginatedResponse<IGauge>, IGetGaugeListParams>;
}

/**
 * Hook that fetches all gauges by automatically loading all pages.
 * Unlike useGaugeList which is paginated, this hook returns all gauges at once.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAllGauges({
 *   gaugeListParams: {
 *     urlParams: { pluginAddress: '0x...', network: 'polygon' },
 *     queryParams: { pageSize: 50 }
 *   }
 * });
 * ```
 */
export const useAllGauges = (params: IUseAllGaugesParams) => {
    const { gaugeListParams, options } = params;

    const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } = useGaugeList(
        { ...gaugeListParams, queryParams: { ...gaugeListParams.queryParams, pageSize: 50 } },
        options,
    );

    // Automatically fetch all pages
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    // Flatten all pages into a single array
    const allGauges = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    return {
        data: allGauges,
        isLoading,
        error,
        refetch,
    };
};
