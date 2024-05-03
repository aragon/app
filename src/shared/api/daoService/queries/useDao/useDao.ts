import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetDaoParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDao } from '../../domain';

export const daoOptions = (params: IGetDaoParams, options?: QueryOptions<IDao>): SharedQueryOptions<IDao> => ({
    queryKey: daoServiceKeys.dao(params),
    queryFn: () => daoService.getDao(params),
    ...options,
});

export const useDao = (params: IGetDaoParams, options?: QueryOptions<IDao>) => {
    return useQuery(daoOptions(params, options));
};
