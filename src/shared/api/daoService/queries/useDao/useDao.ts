import { daoService, type IDao, type IGetDaoParams } from '@/shared/api/daoService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { daoServiceKeys } from '../../daoServiceKeys';

export const daoOptions = (params: IGetDaoParams, options?: QueryOptions<IDao>): SharedQueryOptions<IDao> => ({
    queryKey: daoServiceKeys.dao(params),
    queryFn: () => daoService.getDao(params),
    ...options,
});

export const useDao = (params: IGetDaoParams, options?: QueryOptions<IDao>) => {
    return useQuery(daoOptions(params, options));
};
