import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceTransactionPage } from '../../domain';
import { workspaceFinanceService } from '../../workspaceFinanceService';
import type { IGetWorkspaceTransactionListParams } from '../../workspaceFinanceService.api';
import { workspaceFinanceServiceKeys } from '../../workspaceFinanceServiceKeys';

export const workspaceTransactionListOptions = (
    params: IGetWorkspaceTransactionListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceTransactionPage,
        IGetWorkspaceTransactionListParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceTransactionPage,
    IGetWorkspaceTransactionListParams
> => ({
    queryKey: workspaceFinanceServiceKeys.transactionList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        workspaceFinanceService.getTransactionList(pageParam),
    getNextPageParam: workspaceFinanceService.getNextTransactionPageParams,
    ...options,
});

export const useWorkspaceTransactionList = (
    params: IGetWorkspaceTransactionListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceTransactionPage,
        IGetWorkspaceTransactionListParams
    >,
) => useInfiniteQuery(workspaceTransactionListOptions(params, options));
