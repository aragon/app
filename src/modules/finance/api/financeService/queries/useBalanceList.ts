import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IBalance } from '../domain';
import { financeService } from '../financeService';
import type { IGetBalanceListParams } from '../financeService.api';
import { financeServiceKeys } from '../financeServiceKeys';

export const balanceListOptions = (
    params: IGetBalanceListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IBalance>, IGetBalanceListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IBalance>, IGetBalanceListParams> => ({
    queryKey: financeServiceKeys.balanceList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => financeService.getBalanceList(pageParam),
    getNextPageParam: financeService.getNextPageParams,
    ...options,
});

export const useBalanceList = (
    params: IGetBalanceListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IBalance>, IGetBalanceListParams>,
) => {
    return useInfiniteQuery(balanceListOptions(params, options));
};
