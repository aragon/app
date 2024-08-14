import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IAsset } from '../../domain';
import { financeService } from '../../financeService';
import type { IGetAssetListParams } from '../../financeService.api';
import { financeServiceKeys } from '../../financeServiceKeys';

export const assetListOptions = (
    params: IGetAssetListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IAsset>, IGetAssetListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IAsset>, IGetAssetListParams> => ({
    queryKey: financeServiceKeys.assetList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => financeService.getAssetList(pageParam),
    getNextPageParam: financeService.getNextPageParamsQuery,
    ...options,
});

export const useAssetList = (
    params: IGetAssetListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IAsset>, IGetAssetListParams>,
) => {
    return useInfiniteQuery(assetListOptions(params, options));
};
