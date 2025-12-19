import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IPaginatedResponse } from '../../../../../../shared/api/aragonBackendService';
import type { IAllowedAction } from '../../domain';
import { executeSelectorsService } from '../../executeSelectorsService';
import type { IGetAllowedActionsParams } from '../../executeSelectorsService.api';
import { executeSelectorsServiceKeys } from '../../executeSelectorsServiceKeys';

export const allowedActionsOptions = (
    params: IGetAllowedActionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IAllowedAction>,
        IGetAllowedActionsParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<IAllowedAction>,
    IGetAllowedActionsParams
> => ({
    queryKey: executeSelectorsServiceKeys.allowedActions(params),
    initialPageParam: params,
    queryFn: () => executeSelectorsService.getAllowedActions(params),
    getNextPageParam: executeSelectorsService.getNextPageParams,
    ...options,
});

export const useAllowedActions = (
    params: IGetAllowedActionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IAllowedAction>,
        IGetAllowedActionsParams
    >,
) => useInfiniteQuery(allowedActionsOptions(params, options));
