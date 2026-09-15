import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceAssetListResponse } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceAssetListParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

export const workspaceAssetListOptions = (
    params: IGetWorkspaceAssetListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceAssetListResponse,
        IGetWorkspaceAssetListParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceAssetListResponse,
    IGetWorkspaceAssetListParams
> => ({
    queryKey: workspaceQueryServiceKeys.assetList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => workspaceQueryService.getAssetList(pageParam),
    getNextPageParam: workspaceQueryService.getNextBodyPageParams,
    ...options,
});

export const useWorkspaceAssetList = (
    params: IGetWorkspaceAssetListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceAssetListResponse,
        IGetWorkspaceAssetListParams
    >,
) => useInfiniteQuery(workspaceAssetListOptions(params, options));
