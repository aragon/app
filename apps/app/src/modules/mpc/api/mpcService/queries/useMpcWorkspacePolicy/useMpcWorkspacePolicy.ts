import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcWorkspacePolicyResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetWorkspacePolicyServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspacePolicyOptions = (
    params: IMpcGetWorkspacePolicyServiceParams,
    options?: QueryOptions<IMpcWorkspacePolicyResponse>,
): SharedQueryOptions<IMpcWorkspacePolicyResponse> => ({
    queryKey: mpcServiceKeys.workspacePolicy(params),
    queryFn: () => mpcService.getWorkspacePolicy(params),
    ...options,
});

export const useMpcWorkspacePolicy = (
    params: IMpcGetWorkspacePolicyServiceParams,
    options?: QueryOptions<IMpcWorkspacePolicyResponse>,
) => useQuery(mpcWorkspacePolicyOptions(params, options));
