import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcSystemsResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetWorkspaceSystemsServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspaceSystemsOptions = (
    params: IMpcGetWorkspaceSystemsServiceParams,
    options?: QueryOptions<IMpcSystemsResponse>,
): SharedQueryOptions<IMpcSystemsResponse> => ({
    queryKey: mpcServiceKeys.workspaceSystems(params),
    queryFn: () => mpcService.getWorkspaceSystems(params),
    ...options,
});

export const useMpcWorkspaceSystems = (
    params: IMpcGetWorkspaceSystemsServiceParams,
    options?: QueryOptions<IMpcSystemsResponse>,
) => useQuery(mpcWorkspaceSystemsOptions(params, options));
