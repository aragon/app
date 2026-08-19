import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcSystemResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetSystemServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcSystemOptions = (
    params: IMpcGetSystemServiceParams,
    options?: QueryOptions<IMpcSystemResponse>,
): SharedQueryOptions<IMpcSystemResponse> => ({
    queryKey: mpcServiceKeys.system(params),
    queryFn: () => mpcService.getSystem(params),
    ...options,
});

export const useMpcSystem = (
    params: IMpcGetSystemServiceParams,
    options?: QueryOptions<IMpcSystemResponse>,
) => useQuery(mpcSystemOptions(params, options));
