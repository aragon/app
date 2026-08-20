import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcWorkspacePoliciesResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetWorkspacePoliciesServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcWorkspacePoliciesOptions = (
    params: IMpcGetWorkspacePoliciesServiceParams,
    options?: QueryOptions<IMpcWorkspacePoliciesResponse>,
): SharedQueryOptions<IMpcWorkspacePoliciesResponse> => ({
    queryKey: mpcServiceKeys.workspacePolicies(params),
    queryFn: () => mpcService.getWorkspacePolicies(params),
    ...options,
});

export const useMpcWorkspacePolicies = (
    params: IMpcGetWorkspacePoliciesServiceParams,
    options?: QueryOptions<IMpcWorkspacePoliciesResponse>,
) => useQuery(mpcWorkspacePoliciesOptions(params, options));
