import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcWorkspaceResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetWorkspaceServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspaceOptions = (
    params: IMpcGetWorkspaceServiceParams,
    options?: QueryOptions<IMpcWorkspaceResponse>,
): SharedQueryOptions<IMpcWorkspaceResponse> => ({
    queryKey: mpcServiceKeys.workspace(params),
    queryFn: () => mpcService.getWorkspace(params),
    ...options,
});

export const useMpcWorkspace = (
    params: IMpcGetWorkspaceServiceParams,
    options?: QueryOptions<IMpcWorkspaceResponse>,
) => useQuery(mpcWorkspaceOptions(params, options));
