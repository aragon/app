import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcWorkspacesResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspacesOptions = (
    options?: QueryOptions<IMpcWorkspacesResponse>,
): SharedQueryOptions<IMpcWorkspacesResponse> => ({
    queryKey: mpcServiceKeys.workspaces(),
    queryFn: () => mpcService.getWorkspaces(),
    ...options,
});

export const useMpcWorkspaces = (
    options?: QueryOptions<IMpcWorkspacesResponse>,
) => useQuery(mpcWorkspacesOptions(options));
