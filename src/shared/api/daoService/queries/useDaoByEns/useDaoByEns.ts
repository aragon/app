import { useQuery } from '@tanstack/react-query';
// LMM_DEMO_HACK: see app/src/modules/flow/demo/lmmDemoConfig.ts.
import { tryLmmDaoByEnsOverride } from '@/modules/flow/demo/lmmDaoOverride';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { daoService } from '../../daoService';
import type { IGetDaoByEnsParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDao } from '../../domain';

export const daoByEnsOptions = (
    params: IGetDaoByEnsParams,
    options?: QueryOptions<IDao>,
): SharedQueryOptions<IDao> => ({
    queryKey: daoServiceKeys.daoByEns(params),
    queryFn: async () => {
        const override = await tryLmmDaoByEnsOverride(
            params.urlParams.network,
            params.urlParams.ens,
        );
        if (override) {
            return override;
        }
        return daoService.getDaoByEns(params);
    },
    ...options,
});

export const useDaoByEns = (
    params: IGetDaoByEnsParams,
    options?: QueryOptions<IDao>,
) => useQuery(daoByEnsOptions(params, options));
