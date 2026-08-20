import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcWorkspaceMembersResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetWorkspaceMembersServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspaceMembersOptions = (
    params: IMpcGetWorkspaceMembersServiceParams,
    options?: QueryOptions<IMpcWorkspaceMembersResponse>,
): SharedQueryOptions<IMpcWorkspaceMembersResponse> => ({
    queryKey: mpcServiceKeys.workspaceMembers(params),
    queryFn: () => mpcService.getWorkspaceMembers(params),
    ...options,
});

export const useMpcWorkspaceMembers = (
    params: IMpcGetWorkspaceMembersServiceParams,
    options?: QueryOptions<IMpcWorkspaceMembersResponse>,
) => useQuery(mpcWorkspaceMembersOptions(params, options));
