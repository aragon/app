import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcPolicyCatalogResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcPolicyCatalogOptions = (
    options?: QueryOptions<IMpcPolicyCatalogResponse>,
): SharedQueryOptions<IMpcPolicyCatalogResponse> => ({
    queryKey: mpcServiceKeys.policyCatalog(),
    queryFn: () => mpcService.getPolicyCatalog(),
    // The catalog only changes when the policy engine restarts.
    staleTime: 60_000,
    ...options,
});

export const useMpcPolicyCatalog = (
    options?: QueryOptions<IMpcPolicyCatalogResponse>,
) => useQuery(mpcPolicyCatalogOptions(options));
