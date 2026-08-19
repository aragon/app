import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcRequestsResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetRequestsServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcRequestsOptions = (
    params: IMpcGetRequestsServiceParams,
    options?: QueryOptions<IMpcRequestsResponse>,
): SharedQueryOptions<IMpcRequestsResponse> => ({
    queryKey: mpcServiceKeys.requests(params),
    queryFn: () => mpcService.getRequests(params),
    ...options,
});

export const useMpcRequests = (
    params: IMpcGetRequestsServiceParams,
    options?: QueryOptions<IMpcRequestsResponse>,
) => useQuery(mpcRequestsOptions(params, options));
