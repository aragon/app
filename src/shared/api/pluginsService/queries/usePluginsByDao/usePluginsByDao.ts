import { useQuery } from '@tanstack/react-query';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { pluginsService } from '../../pluginsService';
import type { IGetPluginsByDaoParams } from '../../pluginsService.api';
import { pluginsServiceKeys } from '../../pluginsServiceKeys';

export const pluginsByDaoOptions = (
    params: IGetPluginsByDaoParams,
    options?: QueryOptions<IDaoPlugin[]>,
): SharedQueryOptions<IDaoPlugin[]> => ({
    queryKey: pluginsServiceKeys.pluginsByDao(params),
    queryFn: () => pluginsService.getPluginsByDao(params),
    ...options,
});

export const usePluginsByDao = (
    params: IGetPluginsByDaoParams,
    options?: QueryOptions<IDaoPlugin[]>,
) => useQuery(pluginsByDaoOptions(params, options));
