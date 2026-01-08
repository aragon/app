import { useQuery } from '@tanstack/react-query';
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
    queryFn: () => daoService.getDaoByEns(params),
    ...options,
});

export const useDaoByEns = (
    params: IGetDaoByEnsParams,
    options?: QueryOptions<IDao>,
) => useQuery(daoByEnsOptions(params, options));
