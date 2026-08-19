import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcMembersResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetMembersServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcMembersOptions = (
    params: IMpcGetMembersServiceParams,
    options?: QueryOptions<IMpcMembersResponse>,
): SharedQueryOptions<IMpcMembersResponse> => ({
    queryKey: mpcServiceKeys.members(params),
    queryFn: () => mpcService.getMembers(params),
    ...options,
});

export const useMpcMembers = (
    params: IMpcGetMembersServiceParams,
    options?: QueryOptions<IMpcMembersResponse>,
) => useQuery(mpcMembersOptions(params, options));
