import { useQuery } from '@tanstack/react-query';
// LMM_DEMO_HACK: see app/src/modules/flow/demo/lmmDemoConfig.ts.  In demo
// mode for the Lido Money Machine DAO we bypass the Aragon hosted subgraph
// and synthesise IDao from the manifest + Envio.  Remove this import + the
// override branch in queryFn to drop demo behaviour.
import { tryLmmDaoOverride } from '@/modules/flow/demo/lmmDaoOverride';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { daoService } from '../../daoService';
import type { IGetDaoParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDao } from '../../domain';

export const daoOptions = (
    params: IGetDaoParams,
    options?: QueryOptions<IDao>,
): SharedQueryOptions<IDao> => ({
    queryKey: daoServiceKeys.dao(params),
    queryFn: async () => {
        const override = await tryLmmDaoOverride(params.urlParams.id);
        if (override) {
            return override;
        }
        return daoService.getDao(params);
    },
    ...options,
});

export const useDao = (params: IGetDaoParams, options?: QueryOptions<IDao>) =>
    useQuery(daoOptions(params, options));
