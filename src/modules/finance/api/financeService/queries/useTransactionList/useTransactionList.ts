import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ITransaction } from '../../domain';
import { financeService } from '../../financeService';
import type { IGetTransactionListParams } from '../../financeService.api';
import { financeServiceKeys } from '../../financeServiceKeys';

export const transactionListOptions = (
    params: IGetTransactionListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITransaction>, IGetTransactionListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<ITransaction>, IGetTransactionListParams> => ({
    queryKey: financeServiceKeys.transactionList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => financeService.getTransactionList(pageParam),
    getNextPageParam: financeService.getNextPageParams,
    ...options,
});

export const useTransactionList = (
    params: IGetTransactionListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITransaction>, IGetTransactionListParams>,
) => {
    return useInfiniteQuery(transactionListOptions(params, options));
};
