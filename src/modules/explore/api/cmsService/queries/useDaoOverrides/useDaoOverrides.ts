import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/shared/types';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { DaoOverridesMap } from '../../domain';

export const daoOverridesOptions = (
    options?: QueryOptions<DaoOverridesMap>,
) => ({
    queryKey: cmsServiceKeys.daoOverrides(),
    queryFn: async () => {
        try {
            return await cmsService.getDaoOverrides();
        } catch {
            // Fail-open: overrides are optional CMS metadata and should never
            // break DAO page rendering when the external source is unavailable.
            return {};
        }
    },
    staleTime: Number.POSITIVE_INFINITY,
    ...options,
});

export const useDaoOverrides = (options?: QueryOptions<DaoOverridesMap>) =>
    useQuery(daoOverridesOptions(options));
