import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcActivityResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetActivityServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcActivityOptions = (
    params: IMpcGetActivityServiceParams,
    options?: QueryOptions<IMpcActivityResponse>,
): SharedQueryOptions<IMpcActivityResponse> => ({
    queryKey: mpcServiceKeys.activity(params),
    queryFn: () => mpcService.getActivity(params),
    ...options,
});

export const useMpcActivity = (
    params: IMpcGetActivityServiceParams,
    options?: QueryOptions<IMpcActivityResponse>,
) => useQuery(mpcActivityOptions(params, options));
