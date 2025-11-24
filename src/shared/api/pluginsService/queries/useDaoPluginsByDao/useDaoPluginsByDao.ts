import type { IDaoPlugin } from '@/shared/api/daoService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { pluginsService } from '../../pluginsService';
import type { IGetDaoPluginsByDaoParams } from '../../pluginsService.api';
import { pluginsServiceKeys } from '../../pluginsServiceKeys';

export const daoPluginsByDaoOptions = (
    params: IGetDaoPluginsByDaoParams,
    options?: QueryOptions<IDaoPlugin[]>,
): SharedQueryOptions<IDaoPlugin[]> => ({
    queryKey: pluginsServiceKeys.daoPluginsByDao(params),
    queryFn: () => pluginsService.getDaoPluginsByDao(params),
    ...options,
});

export const useDaoPluginsByDao = (params: IGetDaoPluginsByDaoParams, options?: QueryOptions<IDaoPlugin[]>) => {
    return useQuery(daoPluginsByDaoOptions(params, options));
};
