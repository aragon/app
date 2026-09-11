import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceTransaction } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type {
    IGetWorkspaceTransactionsParams,
    IWorkspaceQueryResponse,
} from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

export const workspaceTransactionsOptions = (
    params: IGetWorkspaceTransactionsParams,
    options?: InfiniteQueryOptions<
        IWorkspaceQueryResponse<IWorkspaceTransaction>,
        IGetWorkspaceTransactionsParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceQueryResponse<IWorkspaceTransaction>,
    IGetWorkspaceTransactionsParams
> => ({
    queryKey: workspaceQueryServiceKeys.transactions(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        workspaceQueryService.getTransactions(pageParam),
    getNextPageParam: workspaceQueryService.getNextPageParams,
    ...options,
});

export const useWorkspaceTransactions = (
    params: IGetWorkspaceTransactionsParams,
    options?: InfiniteQueryOptions<
        IWorkspaceQueryResponse<IWorkspaceTransaction>,
        IGetWorkspaceTransactionsParams
    >,
) => useInfiniteQuery(workspaceTransactionsOptions(params, options));
