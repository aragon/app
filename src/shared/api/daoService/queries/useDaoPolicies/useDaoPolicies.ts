import { useQuery } from '@tanstack/react-query';
// LMM_DEMO_HACK: see app/src/modules/flow/demo/lmmDemoConfig.ts.
import { tryLmmDaoPoliciesOverride } from '@/modules/flow/demo/lmmDaoOverride';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { daoService } from '../../daoService';
import type { IGetDaoPoliciesParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoPolicy } from '../../domain';

export const daoPoliciesOptions = (
    params: IGetDaoPoliciesParams,
    options?: QueryOptions<IDaoPolicy[]>,
): SharedQueryOptions<IDaoPolicy[]> => ({
    queryKey: daoServiceKeys.daoPolicies(params),
    queryFn: async () => {
        const override = await tryLmmDaoPoliciesOverride(
            params.urlParams.daoAddress,
        );
        if (override) {
            return override;
        }
        return daoService.getDaoPolicies(params);
    },
    ...options,
});

export const useDaoPolicies = (
    params: IGetDaoPoliciesParams,
    options?: QueryOptions<IDaoPolicy[]>,
) => useQuery(daoPoliciesOptions(params, options));
