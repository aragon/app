import { useEffect, useMemo } from 'react';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/domain';
import type { IGetGaugeListParams } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/gaugeVoterService.api';
import { useGaugeList } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/queries';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions } from '@/shared/types/queryOptions';

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
 * const { gauges, totalCount, isLoading } = useAllGauges({
 *   params: {
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
        options
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
