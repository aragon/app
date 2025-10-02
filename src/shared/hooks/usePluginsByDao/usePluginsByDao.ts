import { daoService } from '@/shared/api/daoService/daoService';
import type { IGetPluginsByDaoParams } from '@/shared/api/daoService/daoService.api';
import { daoServiceKeys } from '@/shared/api/daoService/daoServiceKeys';
import type { IDaoPlugin } from '@/shared/api/daoService/domain';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';

export const pluginsByDaoOptions = (
    params: IGetPluginsByDaoParams,
    options?: QueryOptions<IDaoPlugin[]>,
): SharedQueryOptions<IDaoPlugin[]> => ({
    queryKey: daoServiceKeys.pluginsByDao(params),
    queryFn: () => daoService.getPluginsByDao(params),
    ...options,
});

export const usePluginsByDao = (params: IGetPluginsByDaoParams, options?: QueryOptions<IDaoPlugin[]>) => {
    return useQuery(pluginsByDaoOptions(params, options));
};
